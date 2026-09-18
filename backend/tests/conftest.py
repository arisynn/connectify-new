import os
import uuid
import pytest
import requests


def _load_base_url() -> str:
    env_url = os.environ.get("REACT_APP_BACKEND_URL")
    if env_url:
        return env_url.rstrip("/")

    env_file = "/app/frontend/.env"
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if line.startswith("REACT_APP_BACKEND_URL="):
                    return line.split("=", 1)[1].strip().rstrip("/")

    raise RuntimeError("REACT_APP_BACKEND_URL is required for tests")


BASE_URL = _load_base_url()
API = f"{BASE_URL}/api/cde"


def _mock_token(nickname: str) -> str:
    return f"mock-token:{nickname}@connectify.com"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture
def opid():
    return str(uuid.uuid4())


@pytest.fixture
def user_session():
    """Fresh nickname + provisioned account each test."""
    nick = f"tuser{uuid.uuid4().hex[:8]}"
    token = _mock_token(nick)
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    # Provision
    r = s.post(f"{API}?action=provision", json={"username": nick})
    assert r.status_code == 200, r.text
    s.nickname = nick  # type: ignore
    return s


def get_profile(session):
    r = session.get(f"{API}?action=get_profile")
    assert r.status_code == 200, r.text
    return r.json()["profile"]


def mutate(session, op_type, payload, base_revision, opid=None):
    body = {
        "opId": opid or str(uuid.uuid4()),
        "type": op_type,
        "payload": payload,
        "baseRevision": base_revision,
    }
    return session.post(f"{API}?action=mutate_state", json=body)


@pytest.fixture
def helpers():
    class H:
        get_profile = staticmethod(get_profile)
        mutate = staticmethod(mutate)
        API = API
    return H
