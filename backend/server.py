from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Auth config
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"
ACCESS_TOKEN_HOURS = 24

app = FastAPI(title="Palaniyappa Mess API")
api_router = APIRouter(prefix="/api")


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


# --------------------- Auth helpers ---------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_HOURS),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_admin(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --------------------- Models ---------------------
class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    guests: int = Field(ge=1, le=50)
    date: str
    time: str
    occasion: Optional[str] = None
    message: Optional[str] = None
    created_at: str = Field(default_factory=_now_iso)


class ReservationCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    guests: int
    date: str
    time: str
    occasion: Optional[str] = None
    message: Optional[str] = None


class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    created_at: str = Field(default_factory=_now_iso)


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


class NewsletterSub(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    created_at: str = Field(default_factory=_now_iso)


class NewsletterCreate(BaseModel):
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# --------------------- Public routes ---------------------
@api_router.get("/")
async def root():
    return {"message": "Palaniyappa Mess API is live", "status": "ok"}


@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(payload: ReservationCreate):
    doc = Reservation(**payload.model_dump())
    await db.reservations.insert_one(doc.model_dump())
    return doc


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(payload: ContactCreate):
    doc = ContactMessage(**payload.model_dump())
    await db.contact_messages.insert_one(doc.model_dump())
    return doc


@api_router.post("/newsletter", response_model=NewsletterSub)
async def create_newsletter(payload: NewsletterCreate):
    existing = await db.newsletter_subs.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        return existing
    doc = NewsletterSub(**payload.model_dump())
    await db.newsletter_subs.insert_one(doc.model_dump())
    return doc


# --------------------- Auth routes ---------------------
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest, request: Request):
    email = payload.email.lower()
    # Under K8s ingress, request.client.host is the proxy pod IP (varies across requests).
    # Use X-Forwarded-For's leftmost entry (real client IP) for reliable brute-force tracking.
    xff = request.headers.get("x-forwarded-for", "")
    if xff:
        ip = xff.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"

    # brute force check
    now = datetime.now(timezone.utc)
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until_str = attempt.get("locked_until")
        if locked_until_str:
            locked_until = datetime.fromisoformat(locked_until_str)
            if now < locked_until:
                raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        # increment failed attempts
        locked_until = (now + timedelta(minutes=15)).isoformat()
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": locked_until}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # clear attempts
    await db.login_attempts.delete_one({"identifier": identifier})

    token = create_access_token(user["id"], user["email"])
    return LoginResponse(
        access_token=token,
        user={"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")},
    )


@api_router.get("/auth/me")
async def me(current: dict = Depends(get_current_admin)):
    return current


# --------------------- Admin (protected) routes ---------------------
@api_router.get("/reservations", response_model=List[Reservation])
async def list_reservations(current: dict = Depends(get_current_admin)):
    rows = await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.get("/contact", response_model=List[ContactMessage])
async def list_contacts(current: dict = Depends(get_current_admin)):
    rows = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.get("/newsletter", response_model=List[NewsletterSub])
async def list_newsletter(current: dict = Depends(get_current_admin)):
    rows = await db.newsletter_subs.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.get("/admin/stats")
async def stats(current: dict = Depends(get_current_admin)):
    return {
        "reservations": await db.reservations.count_documents({}),
        "contact_messages": await db.contact_messages.count_documents({}),
        "newsletter_subs": await db.newsletter_subs.count_documents({}),
    }


# --------------------- Startup / Seeding ---------------------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@palaniyappamess.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Palaniyappa Admin",
            "role": "admin",
            "created_at": _now_iso(),
        })
        logger.info(f"Seeded admin user: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Updated admin password for: {admin_email}")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_admin()


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
