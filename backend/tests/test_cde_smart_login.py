"""Backend API tests for smart-login + mutate_state (Connectify iteration 2).

Covers:
- check_username (existing / unknown)
- Unauthenticated get_profile -> 401
- mutate_state UNKNOWN_OPERATION_TYPE (OPEN_CHEST removed)
- CLAIM_LOGIN_REWARD idempotency (second call same day -> LOGIN_REWARD_CLAIMED)
"""
import os
import time
import uuid
import random
import string
import requests
import pytest

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
SUPA = "https://ymunfgclqfdqaczluqti.supabase.co"
ANON = "sb_publishable_Zq3ajEGs_dTEp4MuEFLI9g_F1JINDdU"

API = f"{BASE}/api/cde"


def _rand(n=6):
    return "".join(random.choices(string.digits, k=n))


# ---------------- check_username ----------------
def test_check_username_existing():
    r = requests.post(API + "?action=check_username", json={"username": "QaAll4505061"}, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("exists") is True, body


def test_check_username_unknown():
    name = f"HubTest{_rand(8)}"
    r = requests.post(API + "?action=check_username", json={"username": name}, timeout=15)
    assert r.status_code == 200, r.text
    assert r.json().get("exists") is False


# ---------------- unauth get_profile ----------------
def test_get_profile_unauthenticated_401():
    r = requests.get(API + "?action=get_profile", timeout=15)
    assert r.status_code == 401, f"{r.status_code} {r.text}"


# ---------------- helper: create fresh supabase account via smartLogin ----------------
def _new_account_token():
    name = f"HubTest{_rand(6)}"
    email = f"{name.lower()}@connectify.com"
    password = "HubPass123!"
    # Sign up via supabase auth REST
    r = requests.post(
        f"{SUPA}/auth/v1/signup",
        headers={"apikey": ANON, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=20,
    )
    assert r.status_code in (200, 201), r.text
    body = r.json()
    token = body.get("access_token") or (body.get("session") or {}).get("access_token")
    if not token:
        r2 = requests.post(
            f"{SUPA}/auth/v1/token?grant_type=password",
            headers={"apikey": ANON, "Content-Type": "application/json"},
            json={"email": email, "password": password},
            timeout=20,
        )
        assert r2.status_code == 200, r2.text
        token = r2.json()["access_token"]
    # Provision profile row (required for mutate_state / get_profile)
    pr = requests.post(
        API + "?action=provision",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"username": name},
        timeout=20,
    )
    assert pr.status_code == 200, pr.text
    return name, email, token


def _get_revision(token):
    r = requests.get(API + "?action=get_profile", headers={"Authorization": f"Bearer {token}"}, timeout=20)
    assert r.status_code == 200, r.text
    return r.json().get("revision", 1)


# ---------------- mutate_state unknown op ----------------
def test_mutate_state_unknown_open_chest():
    _, _, token = _new_account_token()
    rev = _get_revision(token)
    r = requests.post(
        API + "?action=mutate_state",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"opId": str(uuid.uuid4()), "type": "OPEN_CHEST", "payload": {}, "baseRevision": rev},
        timeout=20,
    )
    assert r.status_code == 400, f"{r.status_code} {r.text}"
    body = r.json()
    err = str(body.get("error") or body.get("code") or body).upper()
    assert "UNKNOWN_OPERATION_TYPE" in err or "UNKNOWN" in err, body


# ---------------- login reward idempotent ----------------
def test_claim_login_reward_twice():
    _, _, token = _new_account_token()
    h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    rev = _get_revision(token)
    r1 = requests.post(API + "?action=mutate_state", headers=h,
                       json={"opId": str(uuid.uuid4()), "type": "CLAIM_LOGIN_REWARD", "payload": {}, "baseRevision": rev},
                       timeout=20)
    assert r1.status_code == 200, r1.text
    rev2 = _get_revision(token)
    r2 = requests.post(API + "?action=mutate_state", headers=h,
                       json={"opId": str(uuid.uuid4()), "type": "CLAIM_LOGIN_REWARD", "payload": {}, "baseRevision": rev2},
                       timeout=20)
    assert r2.status_code == 400, f"{r2.status_code} {r2.text}"
    body = r2.json()
    err = str(body.get("error") or body.get("code") or body).upper()
    assert "LOGIN_REWARD_CLAIMED" in err or "CLAIMED" in err, body


# ---------------- authenticated get_profile has structure ----------------
def test_get_profile_shape():
    _, _, token = _new_account_token()
    r = requests.get(
        API + "?action=get_profile",
        headers={"Authorization": f"Bearer {token}"},
        timeout=20,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    # Response wraps { profile: {...}, account: {...} }
    assert "profile" in body and "account" in body, body
    assert body["profile"]["revision"] >= 1
