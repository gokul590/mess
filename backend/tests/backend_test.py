"""Backend tests for Palaniyappa Mess — JWT auth, protected endpoints, brute force, public forms."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://tamil-feast.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@palaniyappamess.com"
ADMIN_PASSWORD = "Palaniyappa@1980"


@pytest.fixture(scope="session")
def admin_token():
    # Clear any lockout from previous runs by using a unique-ish flow — use correct creds first
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    if r.status_code == 429:
        pytest.skip("Locked out from previous test run — wait 15 min or clear login_attempts")
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---- Health ----
def test_root():
    r = requests.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---- Auth ----
class TestAuth:
    def test_login_success(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_login_wrong_password(self):
        # Use a unique wrong password to not increment lockout for correct one
        r = requests.post(f"{API}/auth/login", json={"email": "nonexistent_xyz@test.com", "password": "wrong"}, timeout=10)
        assert r.status_code in (401, 429)

    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "password_hash" not in data
        assert "_id" not in data

    def test_me_with_invalid_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer invalid.token.here"}, timeout=10)
        assert r.status_code == 401


# ---- Protected list endpoints ----
class TestProtectedEndpoints:
    def test_reservations_requires_auth(self):
        r = requests.get(f"{API}/reservations", timeout=10)
        assert r.status_code == 401

    def test_contact_requires_auth(self):
        r = requests.get(f"{API}/contact", timeout=10)
        assert r.status_code == 401

    def test_newsletter_requires_auth(self):
        r = requests.get(f"{API}/newsletter", timeout=10)
        assert r.status_code == 401

    def test_stats_requires_auth(self):
        r = requests.get(f"{API}/admin/stats", timeout=10)
        assert r.status_code == 401

    def test_reservations_with_auth(self, auth_headers):
        r = requests.get(f"{API}/reservations", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_contact_with_auth(self, auth_headers):
        r = requests.get(f"{API}/contact", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_newsletter_with_auth(self, auth_headers):
        r = requests.get(f"{API}/newsletter", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_stats_with_auth(self, auth_headers):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "reservations" in data
        assert "contact_messages" in data
        assert "newsletter_subs" in data
        for k in ("reservations", "contact_messages", "newsletter_subs"):
            assert isinstance(data[k], int)


# ---- Public form endpoints (no auth) ----
class TestPublicForms:
    def test_reservation_create(self, auth_headers):
        payload = {
            "name": "TEST_Reserve",
            "phone": "9999999999",
            "email": "test_reserve@example.com",
            "guests": 2,
            "date": "2026-02-01",
            "time": "19:30",
            "occasion": "Birthday",
            "message": "TEST reservation",
        }
        r = requests.post(f"{API}/reservations", json=payload, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == "TEST_Reserve"
        assert "id" in data
        # Verify persistence via authenticated GET
        list_r = requests.get(f"{API}/reservations", headers=auth_headers, timeout=10)
        assert list_r.status_code == 200
        assert any(x["id"] == data["id"] for x in list_r.json())

    def test_contact_create(self):
        payload = {
            "name": "TEST_Contact",
            "email": "test_contact@example.com",
            "phone": "9999999999",
            "subject": "Hello",
            "message": "TEST message",
        }
        r = requests.post(f"{API}/contact", json=payload, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == "test_contact@example.com"

    def test_newsletter_create_idempotent(self):
        payload = {"email": "test_newsletter@example.com"}
        r1 = requests.post(f"{API}/newsletter", json=payload, timeout=10)
        assert r1.status_code == 200
        r2 = requests.post(f"{API}/newsletter", json=payload, timeout=10)
        assert r2.status_code == 200
        assert r1.json()["email"] == r2.json()["email"]


# ---- Brute force ----
class TestBruteForce:
    def test_lockout_after_5_attempts(self):
        # Use unique email so we don't lock out real admin
        unique_email = f"bf_test_{int(time.time())}@example.com"
        statuses = []
        for i in range(6):
            r = requests.post(f"{API}/auth/login", json={"email": unique_email, "password": "wrong"}, timeout=10)
            statuses.append(r.status_code)
        # First 5 should be 401; 6th should be 429
        assert statuses[:5] == [401] * 5, f"Expected 5x 401, got {statuses}"
        assert statuses[5] == 429, f"Expected 429 on 6th attempt, got {statuses[5]}"
