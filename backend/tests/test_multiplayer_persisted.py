"""Backend tests: Multiplayer Supabase-persisted rooms + CDE PROCESS_WIN for game=fruit.
Uses real Supabase auth via REST (grant_type=password), then provisions cde_account,
runs full mp create/join/ready/start/ready_for_game/complete/rematch flow, and
verifies wager actions return 403.
"""
import os
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cosmic-patrol-update.preview.emergentagent.com").rstrip("/")
SUPABASE_URL = "https://ymunfgclqfdqaczluqti.supabase.co"
SUPABASE_ANON = "sb_publishable_Zq3ajEGs_dTEp4MuEFLI9g_F1JINDdU"
PASSWORD = "ClubPlay2026!"


def _clean(name: str) -> str:
    return "".join(c for c in name.lower() if c.isalnum())


def _signup_and_provision(username: str):
    email = f"{_clean(username)}@connectify.com"
    # signup
    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/signup",
        headers={"apikey": SUPABASE_ANON, "Content-Type": "application/json"},
        json={"email": email, "password": PASSWORD},
        timeout=30,
    )
    if r.status_code not in (200, 400):
        raise AssertionError(f"signup failed {r.status_code}: {r.text[:200]}")
    # login
    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": SUPABASE_ANON, "Content-Type": "application/json"},
        json={"email": email, "password": PASSWORD},
        timeout=30,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text[:200]}"
    token = r.json()["access_token"]
    # provision
    r = requests.post(
        f"{BASE_URL}/api/cde?action=provision",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"username": username},
        timeout=30,
    )
    assert r.status_code == 200, f"provision failed: {r.status_code} {r.text[:200]}"
    return token


@pytest.fixture(scope="module")
def two_users():
    tag = uuid.uuid4().hex[:6]
    u1 = f"QaMpA{tag}"
    u2 = f"QaMpB{tag}"
    t1 = _signup_and_provision(u1)
    t2 = _signup_and_provision(u2)
    return {"u1": u1, "t1": t1, "u2": u2, "t2": t2}


def _mp(token, body=None, params=None):
    url = f"{BASE_URL}/api/multiplayer"
    if params:
        return requests.get(url, headers={"Authorization": f"Bearer {token}"}, params=params, timeout=30)
    return requests.post(url, headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}, json=body or {}, timeout=30)


class TestMultiplayerPersistedRooms:
    def test_full_flow(self, two_users):
        u = two_users
        # create
        r = _mp(u["t1"], {"action": "create", "host": u["u1"], "level": 1, "theme": "sweets", "gameMode": "onet"})
        assert r.status_code == 200, r.text
        room = r.json()
        room_id = room["id"]
        assert room["status"] == "WAITING"
        assert room["host"] == u["u1"]
        assert len(room["players"]) == 1

        # join
        r = _mp(u["t2"], {"action": "join", "roomId": room_id, "name": u["u2"], "level": 1, "theme": "sweets"})
        assert r.status_code == 200, r.text
        room = r.json()
        assert len(room["players"]) == 2

        # both ready
        r = _mp(u["t1"], {"action": "ready", "roomId": room_id, "name": u["u1"], "ready": True})
        assert r.status_code == 200
        r = _mp(u["t2"], {"action": "ready", "roomId": room_id, "name": u["u2"], "ready": True})
        assert r.status_code == 200

        # host start_match
        r = _mp(u["t1"], {"action": "start_match", "roomId": room_id, "host": u["u1"]})
        assert r.status_code == 200, r.text
        room = r.json()["room"]
        assert room["status"] == "STARTING"
        assert room.get("matchId")
        match_id = room["matchId"]

        # both ready_for_game
        r = _mp(u["t1"], {"action": "ready_for_game", "roomId": room_id, "name": u["u1"]})
        assert r.status_code == 200
        r = _mp(u["t2"], {"action": "ready_for_game", "roomId": room_id, "name": u["u2"]})
        assert r.status_code == 200
        room = r.json()["room"]
        assert room["status"] == "PLAYING", f"expected PLAYING, got {room['status']}"
        assert room.get("startAt")

        # sync GET
        r = _mp(u["t1"], params={"action": "sync", "roomId": room_id, "name": u["u1"]})
        assert r.status_code == 200
        assert r.json()["id"] == room_id

        # persistence: token2 GET sync must load same room
        r = _mp(u["t2"], params={"action": "sync", "roomId": room_id, "name": u["u2"]})
        assert r.status_code == 200
        assert r.json()["matchId"] == match_id

        # complete -> FINISHED
        r = _mp(u["t1"], {"action": "complete", "roomId": room_id, "name": u["u1"]})
        assert r.status_code == 200
        room = r.json()
        assert room["status"] == "FINISHED"
        assert room["winner"] == u["u1"]

        # rematch -> WAITING
        r = _mp(u["t1"], {"action": "rematch", "roomId": room_id, "name": u["u1"]})
        assert r.status_code == 200
        room = r.json()
        assert room["status"] == "WAITING"

    def test_wager_forbidden(self, two_users):
        r = _mp(two_users["t1"], {"action": "wager_something", "name": two_users["u1"]})
        assert r.status_code == 403

    def test_change_mode_non_friendly_forbidden(self, two_users):
        r = _mp(two_users["t1"], {"action": "change_mode", "mode": "Ranked", "name": two_users["u1"]})
        assert r.status_code == 403

    def test_missing_token_401(self):
        r = requests.post(f"{BASE_URL}/api/multiplayer", json={"action": "create"}, timeout=30)
        assert r.status_code == 401


class TestCdeMutateStateFruit:
    """Ensure PROCESS_WIN accepts game 'fruit' (cde_mutate_state RPC path)."""

    def test_process_win_fruit(self, two_users):
        token = two_users["t1"]
        # fetch profile to get revision
        r = requests.get(
            f"{BASE_URL}/api/cde?action=get_profile",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        profile = r.json().get("profile") or {}
        base_rev = profile.get("revision", 1)

        payload = {
            "opId": str(uuid.uuid4()),
            "type": "PROCESS_WIN",
            "baseRevision": base_rev,
            "payload": {
                "game": "fruit",
                "runId": f"run-{uuid.uuid4().hex}",
                "isWinner": True,
                "score": 500,
                "fruitStage": 5,
                "watermelons": 0,
                "timeElapsed": 45000,
            },
        }
        r = requests.post(
            f"{BASE_URL}/api/cde?action=mutate_state",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
        assert r.status_code == 200, f"PROCESS_WIN fruit failed: {r.status_code} {r.text[:300]}"
        body = r.json()
        assert body.get("success") is True or body.get("result")

    def test_process_win_invalid_game(self, two_users):
        token = two_users["t1"]
        r = requests.get(
            f"{BASE_URL}/api/cde?action=get_profile",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        base_rev = (r.json().get("profile") or {}).get("revision", 1)
        payload = {
            "opId": str(uuid.uuid4()),
            "type": "PROCESS_WIN",
            "baseRevision": base_rev,
            "payload": {"game": "ninja-fruit", "runId": "x", "isWinner": True},
        }
        r = requests.post(
            f"{BASE_URL}/api/cde?action=mutate_state",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
        assert r.status_code == 400
