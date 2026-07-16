from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Palaniyappa Mess API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


# --------------------- Models ---------------------
class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    guests: int = Field(ge=1, le=50)
    date: str  # ISO date string
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


# --------------------- Routes ---------------------
@api_router.get("/")
async def root():
    return {"message": "Palaniyappa Mess API is live", "status": "ok"}


@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(payload: ReservationCreate):
    doc = Reservation(**payload.model_dump())
    await db.reservations.insert_one(doc.model_dump())
    return doc


@api_router.get("/reservations", response_model=List[Reservation])
async def list_reservations():
    rows = await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(payload: ContactCreate):
    doc = ContactMessage(**payload.model_dump())
    await db.contact_messages.insert_one(doc.model_dump())
    return doc


@api_router.get("/contact", response_model=List[ContactMessage])
async def list_contacts():
    rows = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.post("/newsletter", response_model=NewsletterSub)
async def create_newsletter(payload: NewsletterCreate):
    existing = await db.newsletter_subs.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        # idempotent — return existing without raising
        return existing
    doc = NewsletterSub(**payload.model_dump())
    await db.newsletter_subs.insert_one(doc.model_dump())
    return doc


@api_router.get("/newsletter", response_model=List[NewsletterSub])
async def list_newsletter():
    rows = await db.newsletter_subs.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


# Include the router in the main app
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
