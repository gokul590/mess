"""Iteration 3 backend tests: rate limiting, Instagram fallback, reservation email bg."""
import os
import uuid
import time
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://tamil-feast.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

ADMIN_EMAIL = "admin@palaniyappamess.com"
ADMIN_PASSWORD = "Palaniyappa@1980"


@pytest.fixture(scope="session")
def mongo_db():
    c = MongoClient(MONGO_URL)
    # clear login lockouts up front so admin_token fixture works cleanly
    c[DB_NAME].login_attempts.delete_many({})
    yield c[DB_NAME]
    c.close()


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


def _ip():
    return f"198.51.100.{uuid.uuid4().int % 250 + 2}"


def _clear_rl(db, ip):
    db.rate_limits.delete_many({"key": {"$regex": f"^{ip}:"}})


# ---------- Health ----------
def test_api_root():
    r = requests.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------- Instagram fallback ----------
def test_instagram_fallback():
    r = requests.get(f"{API}/instagram", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data.get("source") == "fallback"
    assert data.get("items") == []


# ---------- Rate limit: newsletter (3 per window) ----------
def test_newsletter_rate_limit(mongo_db):
    ip = _ip()
    _clear_rl(mongo_db, ip)
    headers = {"X-Forwarded-For": ip}
    for i in range(3):
        r = requests.post(f"{API}/newsletter", json={"email": f"rl_nl_{i}_{ip}@test.com"}, headers=headers, timeout=10)
        assert r.status_code == 200, f"attempt {i+1}: {r.status_code} {r.text}"
    r4 = requests.post(f"{API}/newsletter", json={"email": f"rl_nl_4_{ip}@test.com"}, headers=headers, timeout=10)
    assert r4.status_code == 429
    assert "Too many" in r4.json().get("detail", "")


# ---------- Rate limit: reservations (5 per window) ----------
def test_reservation_rate_limit(mongo_db):
    ip = _ip()
    _clear_rl(mongo_db, ip)
    headers = {"X-Forwarded-For": ip}
    payload = {
        "name": "TEST_rl_user", "phone": "+911234567890",
        "guests": 2, "date": "2026-02-01", "time": "19:00",
    }
    for i in range(5):
        r = requests.post(f"{API}/reservations", json=payload, headers=headers, timeout=10)
        assert r.status_code == 200, f"attempt {i+1}: {r.status_code} {r.text}"
    r6 = requests.post(f"{API}/reservations", json=payload, headers=headers, timeout=10)
    assert r6.status_code == 429


# ---------- Rate limit: contact (5 per window) ----------
def test_contact_rate_limit(mongo_db):
    ip = _ip()
    _clear_rl(mongo_db, ip)
    headers = {"X-Forwarded-For": ip}
    payload = {"name": "TEST_rl", "email": "rl_c@test.com", "message": "hi"}
    for i in range(5):
        r = requests.post(f"{API}/contact", json=payload, headers=headers, timeout=10)
        assert r.status_code == 200, f"attempt {i+1}: {r.status_code} {r.text}"
    r6 = requests.post(f"{API}/contact", json=payload, headers=headers, timeout=10)
    assert r6.status_code == 429


# ---------- IP isolation ----------
def test_rate_limit_ip_isolation(mongo_db):
    ip1, ip2 = _ip(), _ip()
    _clear_rl(mongo_db, ip1)
    _clear_rl(mongo_db, ip2)
    for i in range(3):
        r = requests.post(f"{API}/newsletter", json={"email": f"iso1_{i}_{ip1}@t.com"},
                          headers={"X-Forwarded-For": ip1}, timeout=10)
        assert r.status_code == 200
    rblk = requests.post(f"{API}/newsletter", json={"email": f"iso1_blk_{ip1}@t.com"},
                         headers={"X-Forwarded-For": ip1}, timeout=10)
    assert rblk.status_code == 429
    rok = requests.post(f"{API}/newsletter", json={"email": f"iso2_{ip2}@t.com"},
                        headers={"X-Forwarded-For": ip2}, timeout=10)
    assert rok.status_code == 200, f"ip2 unexpectedly blocked: {rok.status_code} {rok.text}"


# ---------- Reservation persists + background email (no key = warn+skip) ----------
def test_reservation_created_persists_and_email_bg(mongo_db, admin_token):
    ip = _ip()
    _clear_rl(mongo_db, ip)
    unique_name = f"TEST_bg_{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{API}/reservations", json={
        "name": unique_name, "phone": "+911234567890",
        "guests": 3, "date": "2026-03-01", "time": "20:00",
    }, headers={"X-Forwarded-For": ip}, timeout=10)
    assert r.status_code == 200
    rid = r.json()["id"]
    time.sleep(1)  # let bg task run
    # verify persisted via admin list
    lst = requests.get(f"{API}/reservations",
                       headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    assert lst.status_code == 200
    assert any(x["id"] == rid and x["name"] == unique_name for x in lst.json())


# ---------- Regression: admin auth ----------
def test_admin_auth_me(admin_token):
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_admin_stats(admin_token):
    r = requests.get(f"{API}/admin/stats", headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    assert r.status_code == 200
    d = r.json()
    for k in ("reservations", "contact_messages", "newsletter_subs"):
        assert k in d and isinstance(d[k], int)


def test_unauthorized_admin_list():
    r = requests.get(f"{API}/reservations", timeout=10)
    assert r.status_code == 401


# ---------- Cleanup ----------
@pytest.fixture(scope="session", autouse=True)
def _cleanup(mongo_db):
    yield
    mongo_db.reservations.delete_many({"name": {"$regex": "^TEST_"}})
    mongo_db.contact_messages.delete_many({"name": {"$regex": "^TEST_"}})
    mongo_db.newsletter_subs.delete_many({"email": {"$regex": "^(rl_|iso)"}})
    mongo_db.rate_limits.delete_many({"key": {"$regex": "^198\\.51\\.100\\."}})
