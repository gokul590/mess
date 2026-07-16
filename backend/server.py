from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import jwt
import bcrypt
import httpx
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, BackgroundTasks
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------- MongoDB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------- Auth config ----------
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"
ACCESS_TOKEN_HOURS = 24

# ---------- Email config ----------
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMERGENT_EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "").strip()
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Palaniyappa Mess")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@palaniyappamess.com")

# ---------- Instagram config ----------
IG_ACCESS_TOKEN = os.environ.get("IG_ACCESS_TOKEN", "").strip()
IG_USER_ID = os.environ.get("IG_USER_ID", "").strip()
IG_CACHE = {"data": None, "ts": None}

# ---------- Rate limiting ----------
RATE_LIMITS = {
    # endpoint -> (max_requests, window_seconds)
    "reservations": (5, 600),
    "contact": (5, 600),
    "newsletter": (3, 600),
}


app = FastAPI(title="Palaniyappa Mess API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def enforce_rate_limit(request: Request, bucket: str):
    max_req, window = RATE_LIMITS.get(bucket, (10, 600))
    ip = _client_ip(request)
    key = f"{ip}:{bucket}"
    now = datetime.now(timezone.utc)
    cutoff = (now - timedelta(seconds=window)).isoformat()
    # sliding-window: count entries newer than cutoff
    doc = await db.rate_limits.find_one({"key": key})
    entries = [t for t in (doc.get("timestamps", []) if doc else []) if t > cutoff]
    if len(entries) >= max_req:
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Please try again in {window // 60} minutes.",
        )
    entries.append(now.isoformat())
    await db.rate_limits.update_one(
        {"key": key},
        {"$set": {"key": key, "timestamps": entries}},
        upsert=True,
    )


# ---------- Auth helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_HOURS),
        "iat": datetime.now(timezone.utc), "type": "access",
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


# ---------- Email ----------
def _reservation_email_html(r) -> str:
    email_line = f"<tr><td style='padding:4px 0;color:#5C4D4A'>Email</td><td style='padding:4px 0'><strong>{r.email}</strong></td></tr>" if r.email else ""
    occ_line = f"<tr><td style='padding:4px 0;color:#5C4D4A'>Occasion</td><td style='padding:4px 0'><strong>{r.occasion}</strong></td></tr>" if r.occasion else ""
    msg_block = f"<div style='margin-top:20px;padding:16px;background:#F7F5F0;border-left:3px solid #D4AF37;font-style:italic;color:#5C4D4A'>{r.message}</div>" if r.message else ""
    return f"""
<!doctype html>
<html><body style="margin:0;padding:0;background:#0C0A09;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0C0A09;padding:40px 20px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#F7F5F0;border:1px solid #E2DCD0;">
        <tr><td style="padding:32px 40px;border-bottom:1px solid #E2DCD0">
          <div style="color:#D4AF37;font-size:11px;letter-spacing:0.24em;text-transform:uppercase">New Reservation · Est. 1980</div>
          <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1;color:#1A0F0D;margin:12px 0 0">Palaniyappa <em style="color:#8B0000">Mess.</em></h1>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <p style="font-size:16px;color:#1A0F0D;margin:0 0 20px">A new table booking has just come in.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#1A0F0D">
            <tr><td style="padding:4px 0;color:#5C4D4A;width:120px">Guest</td><td style="padding:4px 0"><strong>{r.name}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#5C4D4A">Phone</td><td style="padding:4px 0"><strong>{r.phone}</strong></td></tr>
            {email_line}
            <tr><td style="padding:4px 0;color:#5C4D4A">Party size</td><td style="padding:4px 0"><strong>{r.guests} guests</strong></td></tr>
            <tr><td style="padding:4px 0;color:#5C4D4A">Date</td><td style="padding:4px 0"><strong>{r.date}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#5C4D4A">Time</td><td style="padding:4px 0"><strong>{r.time}</strong></td></tr>
            {occ_line}
          </table>
          {msg_block}
          <p style="margin-top:28px;font-size:12px;color:#5C4D4A">Submitted at {r.created_at}. Sign in to the admin dashboard to confirm.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#1A0F0D;color:#F7F5F0;font-size:11px;letter-spacing:0.24em;text-transform:uppercase">
          Palaniyappa Mess · Pudukkottai · +91 99429 33912
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
"""


async def send_reservation_email(r) -> None:
    if not EMERGENT_EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY not set — skipping reservation email.")
        return
    payload = {
        "to": [ADMIN_EMAIL],
        "subject": f"New Reservation · {r.name} · {r.date} {r.time} · {r.guests} guests",
        "html": _reservation_email_html(r),
        "from_name": EMAIL_FROM_NAME,
    }
    if r.email:
        payload["contact_email"] = r.email
    try:
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMERGENT_EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        logger.info(f"Reservation email sent to {ADMIN_EMAIL}: id={resp.json().get('id')}")
    except Exception as e:
        logger.error(f"Reservation email failed: {e}")


# ---------- Models ----------
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


# ---------- Public routes ----------
@api_router.get("/")
async def root():
    return {"message": "Palaniyappa Mess API is live", "status": "ok"}


@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(payload: ReservationCreate, request: Request, background: BackgroundTasks):
    await enforce_rate_limit(request, "reservations")
    doc = Reservation(**payload.model_dump())
    await db.reservations.insert_one(doc.model_dump())
    # non-blocking admin notification
    background.add_task(send_reservation_email, doc)
    return doc


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(payload: ContactCreate, request: Request):
    await enforce_rate_limit(request, "contact")
    doc = ContactMessage(**payload.model_dump())
    await db.contact_messages.insert_one(doc.model_dump())
    return doc


@api_router.post("/newsletter", response_model=NewsletterSub)
async def create_newsletter(payload: NewsletterCreate, request: Request):
    await enforce_rate_limit(request, "newsletter")
    existing = await db.newsletter_subs.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        return existing
    doc = NewsletterSub(**payload.model_dump())
    await db.newsletter_subs.insert_one(doc.model_dump())
    return doc


# ---------- Instagram (public) ----------
@api_router.get("/instagram")
async def get_instagram():
    """Fetches recent Instagram posts if IG_ACCESS_TOKEN + IG_USER_ID are set.
    Falls back to a signalling response so the frontend can show curated tiles."""
    if not IG_ACCESS_TOKEN or not IG_USER_ID:
        return {"source": "fallback", "items": []}

    # 1h cache
    now = datetime.now(timezone.utc)
    if IG_CACHE["data"] and IG_CACHE["ts"] and (now - IG_CACHE["ts"]).total_seconds() < 3600:
        return {"source": "instagram", "items": IG_CACHE["data"]}

    url = f"https://graph.instagram.com/v18.0/{IG_USER_ID}/media"
    params = {
        "fields": "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
        "limit": 8,
        "access_token": IG_ACCESS_TOKEN,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            r = await http.get(url, params=params)
        r.raise_for_status()
        data = r.json().get("data", [])
        items = []
        for m in data:
            src = m.get("media_url") if m.get("media_type") != "VIDEO" else m.get("thumbnail_url")
            if not src:
                continue
            items.append({
                "id": m["id"],
                "src": src,
                "permalink": m.get("permalink", "https://instagram.com"),
                "caption": (m.get("caption") or "")[:120],
            })
        IG_CACHE["data"] = items
        IG_CACHE["ts"] = now
        return {"source": "instagram", "items": items}
    except Exception as e:
        logger.error(f"Instagram fetch failed: {e}")
        return {"source": "fallback", "items": []}


# ---------- Auth routes ----------
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest, request: Request):
    email = payload.email.lower()
    ip = _client_ip(request)
    identifier = f"{ip}:{email}"

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
        locked_until = (now + timedelta(minutes=15)).isoformat()
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": locked_until}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(user["id"], user["email"])
    return LoginResponse(
        access_token=token,
        user={"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")},
    )


@api_router.get("/auth/me")
async def me(current: dict = Depends(get_current_admin)):
    return current


# ---------- Admin (protected) routes ----------
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


# ---------- Startup ----------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@palaniyappamess.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Palaniyappa Admin", "role": "admin", "created_at": _now_iso(),
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
    await db.rate_limits.create_index("key")
    await seed_admin()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
