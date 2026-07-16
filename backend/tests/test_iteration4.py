"""Iteration 4 backend tests — public dishes/specials, reservation status workflow, admin CMS for dishes/specials."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://tamil-feast.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@palaniyappamess.com"
ADMIN_PASSWORD = "Palaniyappa@1980"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                      headers={"X-Forwarded-For": f"10.99.{uuid.uuid4().int % 250}.10"},
                      timeout=15)
    if r.status_code == 429:
        pytest.skip("Locked out")
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture
def auth(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _uip():
    return {"X-Forwarded-For": f"10.88.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}"}


# ---------- Public dishes ----------
class TestPublicDishes:
    def test_list_dishes(self):
        r = requests.get(f"{API}/dishes", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 15, f"Expected >=15 dishes, got {len(data)}"
        # Fields
        d = data[0]
        for k in ("id", "name", "tamil", "price", "category", "desc", "image", "sort_order"):
            assert k in d
        # Sort order ascending
        sorts = [d["sort_order"] for d in data]
        assert sorts == sorted(sorts), f"Not sorted: {sorts}"

    def test_list_specials(self):
        r = requests.get(f"{API}/specials", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 3
        for k in ("id", "title", "price", "tag", "desc", "image"):
            assert k in data[0]


# ---------- Reservation status workflow ----------
class TestReservationStatus:
    @pytest.fixture
    def new_reservation(self):
        payload = {
            "name": "TEST_Iter4_Status", "phone": "9000000000",
            "guests": 2, "date": "2026-02-15", "time": "19:00",
        }
        r = requests.post(f"{API}/reservations", json=payload, headers=_uip(), timeout=10)
        assert r.status_code == 200, r.text
        return r.json()

    def test_new_reservation_is_pending(self, new_reservation):
        assert new_reservation["status"] == "pending"
        assert new_reservation.get("status_updated_at") in (None, "")

    def test_patch_status_no_auth(self, new_reservation):
        r = requests.patch(f"{API}/reservations/{new_reservation['id']}/status",
                           json={"status": "confirmed"}, timeout=10)
        assert r.status_code == 401

    def test_patch_status_confirmed(self, new_reservation, auth):
        r = requests.patch(f"{API}/reservations/{new_reservation['id']}/status",
                           json={"status": "confirmed"}, headers=auth, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "confirmed"
        assert data["status_updated_at"] is not None
        # Restore to pending
        requests.patch(f"{API}/reservations/{new_reservation['id']}/status",
                       json={"status": "pending"}, headers=auth, timeout=10)

    def test_patch_status_all_allowed(self, new_reservation, auth):
        for s in ("confirmed", "seated", "cancelled", "pending"):
            r = requests.patch(f"{API}/reservations/{new_reservation['id']}/status",
                               json={"status": s}, headers=auth, timeout=10)
            assert r.status_code == 200, f"{s}: {r.text}"
            assert r.json()["status"] == s

    def test_patch_status_invalid(self, new_reservation, auth):
        r = requests.patch(f"{API}/reservations/{new_reservation['id']}/status",
                           json={"status": "booked"}, headers=auth, timeout=10)
        assert r.status_code == 400
        assert "Invalid status" in r.json().get("detail", "")

    def test_patch_status_not_found(self, auth):
        r = requests.patch(f"{API}/reservations/does-not-exist-{uuid.uuid4()}/status",
                           json={"status": "confirmed"}, headers=auth, timeout=10)
        assert r.status_code == 404


# ---------- Admin dishes CMS ----------
class TestAdminDishes:
    def test_admin_list_requires_auth(self):
        r = requests.get(f"{API}/admin/dishes", timeout=10)
        assert r.status_code == 401

    def test_patch_price_and_restore(self, auth):
        # Get original
        r0 = requests.get(f"{API}/dishes", timeout=10)
        assert r0.status_code == 200
        biryani = next(d for d in r0.json() if d["id"] == "chicken-biryani")
        orig_price = biryani["price"]

        # Patch to 199
        r1 = requests.patch(f"{API}/admin/dishes/chicken-biryani",
                            json={"price": 199}, headers=auth, timeout=10)
        assert r1.status_code == 200, r1.text
        assert r1.json()["price"] == 199

        # Verify via GET
        r2 = requests.get(f"{API}/dishes", timeout=10)
        biryani2 = next(d for d in r2.json() if d["id"] == "chicken-biryani")
        assert biryani2["price"] == 199

        # Restore
        rrest = requests.patch(f"{API}/admin/dishes/chicken-biryani",
                               json={"price": orig_price}, headers=auth, timeout=10)
        assert rrest.status_code == 200

    def test_toggle_active(self, auth):
        # Hide chicken-65
        r1 = requests.patch(f"{API}/admin/dishes/chicken-65",
                            json={"active": False}, headers=auth, timeout=10)
        assert r1.status_code == 200
        assert r1.json()["active"] is False

        # Public excludes it
        r2 = requests.get(f"{API}/dishes", timeout=10)
        ids = [d["id"] for d in r2.json()]
        assert "chicken-65" not in ids

        # Restore
        r3 = requests.patch(f"{API}/admin/dishes/chicken-65",
                            json={"active": True}, headers=auth, timeout=10)
        assert r3.status_code == 200
        assert r3.json()["active"] is True

    def test_empty_body(self, auth):
        r = requests.patch(f"{API}/admin/dishes/chicken-biryani",
                           json={}, headers=auth, timeout=10)
        assert r.status_code == 400
        assert "No fields to update" in r.json().get("detail", "")

    def test_dish_not_found(self, auth):
        r = requests.patch(f"{API}/admin/dishes/nope-{uuid.uuid4()}",
                           json={"price": 100}, headers=auth, timeout=10)
        assert r.status_code == 404


# ---------- Admin specials CMS ----------
class TestAdminSpecials:
    def test_patch_special(self, auth):
        # Get original
        r0 = requests.get(f"{API}/admin/specials", headers=auth, timeout=10)
        assert r0.status_code == 200
        sp = r0.json()[0]
        sp_id = sp["id"]
        orig_title = sp["title"]
        orig_price = sp["price"]
        orig_desc = sp["desc"]

        r1 = requests.patch(f"{API}/admin/specials/{sp_id}",
                            json={"title": "TEST_X", "price": 888}, headers=auth, timeout=10)
        assert r1.status_code == 200, r1.text
        data = r1.json()
        assert data["title"] == "TEST_X"
        assert data["price"] == 888
        assert data["desc"] == orig_desc  # preserved

        # Restore
        requests.patch(f"{API}/admin/specials/{sp_id}",
                       json={"title": orig_title, "price": orig_price}, headers=auth, timeout=10)


# ---------- Admin stats ----------
class TestStats:
    def test_stats_has_pending(self, auth):
        r = requests.get(f"{API}/admin/stats", headers=auth, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "reservations_pending" in data
        assert isinstance(data["reservations_pending"], int)


# ---------- Twilio fallback ----------
class TestTwilioFallback:
    def test_reservation_still_works_no_twilio(self):
        payload = {
            "name": "TEST_TwilioFallback", "phone": "9111111111",
            "guests": 3, "date": "2026-03-01", "time": "20:00",
        }
        r = requests.post(f"{API}/reservations", json=payload, headers=_uip(), timeout=10)
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "pending"
