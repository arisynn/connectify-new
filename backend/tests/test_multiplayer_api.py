"""Multiplayer API regression tests for auth hardening, wager lockout, and result verification."""

import uuid
import requests


def _mock_token(username: str) -> str:
    return f"mock-token:{username}@connectify.com"


def _new_username(prefix: str) -> str:
    return f"{prefix}{uuid.uuid4().hex[:8]}".lower()


def _new_session(base_url: str, username: str) -> requests.Session:
    session = requests.Session()
    session.headers.update(
        {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {_mock_token(username)}",
        }
    )
    provision = session.post(
        f"{base_url}/api/cde?action=provision",
        json={"username": username},
        timeout=20,
    )
    assert provision.status_code == 200, provision.text
    return session


def _mp_post(session: requests.Session, base_url: str, body: dict):
    return session.post(f"{base_url}/api/multiplayer", json=body, timeout=20)


def _profile(session: requests.Session, base_url: str):
    response = session.get(f"{base_url}/api/cde?action=get_profile", timeout=20)
    assert response.status_code == 200, response.text
    return response.json()["profile"]


def _mutate_state(session: requests.Session, base_url: str, op_type: str, payload: dict, base_revision: int):
    return session.post(
        f"{base_url}/api/cde?action=mutate_state",
        json={
            "opId": str(uuid.uuid4()),
            "type": op_type,
            "payload": payload,
            "baseRevision": base_revision,
        },
        timeout=20,
    )


def _stats(profile: dict):
    return (((profile or {}).get("profile_data") or {}).get("profile") or {}).get("statistics") or {}


def _setup_playing_room(base_url: str, game_mode: str = "onet"):
    host = _new_username("host")
    guest = _new_username("guest")
    host_s = _new_session(base_url, host)
    guest_s = _new_session(base_url, guest)

    create = _mp_post(host_s, base_url, {"action": "create", "host": host, "level": 1, "theme": "sweets", "gameMode": game_mode})
    assert create.status_code == 200, create.text
    room = create.json()

    join = _mp_post(guest_s, base_url, {"action": "join", "roomId": room["id"], "name": guest, "level": 1, "theme": "sweets"})
    assert join.status_code == 200, join.text

    r1 = _mp_post(host_s, base_url, {"action": "ready", "roomId": room["id"], "name": host, "ready": True})
    r2 = _mp_post(guest_s, base_url, {"action": "ready", "roomId": room["id"], "name": guest, "ready": True})
    assert r1.status_code == 200 and r2.status_code == 200

    board = [[1, 1], [1, 1]] if game_mode == "onet" else []
    start = _mp_post(host_s, base_url, {"action": "start_match", "roomId": room["id"], "host": host, "board": board})
    assert start.status_code == 200, start.text
    started = start.json()["room"]
    assert started["status"] == "STARTING"
    assert started.get("matchId")

    g1 = _mp_post(host_s, base_url, {"action": "ready_for_game", "roomId": room["id"], "name": host})
    g2 = _mp_post(guest_s, base_url, {"action": "ready_for_game", "roomId": room["id"], "name": guest})
    assert g1.status_code == 200 and g2.status_code == 200
    assert g2.json()["room"]["status"] == "PLAYING"

    return host_s, guest_s, host, guest, room["id"], started["matchId"]


# Module focus: multiplayer auth/session identity + room membership enforcement.
class TestMultiplayerAuthAndMembership:
    def test_requires_token_for_create(self, base_url):
        response = requests.post(
            f"{base_url}/api/multiplayer",
            json={"action": "create", "host": "any", "level": 1, "theme": "sweets", "gameMode": "onet"},
            timeout=20,
        )
        assert response.status_code == 401

    def test_identity_mismatch_rejected_403(self, base_url):
        owner = _new_username("own")
        other = _new_username("oth")
        owner_s = _new_session(base_url, owner)
        _new_session(base_url, other)
        response = _mp_post(owner_s, base_url, {"action": "create", "host": other, "level": 1, "theme": "sweets", "gameMode": "onet"})
        assert response.status_code == 403
        assert response.json().get("error") == "PLAYER_IDENTITY_MISMATCH"

    def test_nonmember_blocked_from_room_actions_403(self, base_url):
        host_s, guest_s, host, guest, room_id, _ = _setup_playing_room(base_url, "onet")
        outsider = _new_username("outs")
        outsider_s = _new_session(base_url, outsider)

        response = _mp_post(outsider_s, base_url, {"action": "ready", "roomId": room_id, "name": outsider, "ready": True})
        assert response.status_code == 403
        assert response.json().get("error") == "NOT_A_ROOM_MEMBER"

        _mp_post(host_s, base_url, {"action": "leave", "roomId": room_id, "name": host})
        _mp_post(guest_s, base_url, {"action": "leave", "roomId": room_id, "name": guest})


# Module focus: create/join/ready/start/ready_for_game/sync/complete/time_up/leave flow stability.
class TestMultiplayerCoreFlow:
    def test_two_player_onet_flow_works(self, base_url):
        host_s, guest_s, host, guest, room_id, match_id = _setup_playing_room(base_url, "onet")

        sync = host_s.get(
            f"{base_url}/api/multiplayer?action=sync&roomId={room_id}&name={host}&matchId={match_id}&progress=1",
            timeout=20,
        )
        assert sync.status_code == 200, sync.text
        sync_data = sync.json()
        assert sync_data["id"] == room_id
        assert sync_data.get("matchId") == match_id

        complete = _mp_post(host_s, base_url, {"action": "complete", "roomId": room_id, "name": host})
        assert complete.status_code == 200, complete.text
        final_room = complete.json()
        assert final_room["status"] == "FINISHED"
        assert final_room["winner"] == host

        leave_host = _mp_post(host_s, base_url, {"action": "leave", "roomId": room_id, "name": host})
        leave_guest = _mp_post(guest_s, base_url, {"action": "leave", "roomId": room_id, "name": guest})
        assert leave_host.status_code == 200 and leave_guest.status_code == 200

    def test_time_up_winner_rules_onet_block_and_draw(self, base_url):
        # ONET: lower remaining tiles wins
        h1, g1, host1, guest1, room1, match1 = _setup_playing_room(base_url, "onet")
        h1.get(f"{base_url}/api/multiplayer?action=sync&roomId={room1}&name={host1}&matchId={match1}&progress=2", timeout=20)
        g1.get(f"{base_url}/api/multiplayer?action=sync&roomId={room1}&name={guest1}&matchId={match1}&progress=5", timeout=20)
        t1 = _mp_post(h1, base_url, {"action": "time_up", "roomId": room1, "name": host1})
        assert t1.status_code == 200 and t1.json().get("winner") == host1

        # DRAW when equal progress
        h2, g2, host2, guest2, room2, match2 = _setup_playing_room(base_url, "onet")
        h2.get(f"{base_url}/api/multiplayer?action=sync&roomId={room2}&name={host2}&matchId={match2}&progress=4", timeout=20)
        g2.get(f"{base_url}/api/multiplayer?action=sync&roomId={room2}&name={guest2}&matchId={match2}&progress=4", timeout=20)
        t2 = _mp_post(h2, base_url, {"action": "time_up", "roomId": room2, "name": host2})
        assert t2.status_code == 200 and t2.json().get("winner") == "DRAW"

        # BLOCK: higher score wins
        h3, g3, host3, guest3, room3, match3 = _setup_playing_room(base_url, "block-puzzle")
        h3.get(f"{base_url}/api/multiplayer?action=sync&roomId={room3}&name={host3}&matchId={match3}&progress=11", timeout=20)
        g3.get(f"{base_url}/api/multiplayer?action=sync&roomId={room3}&name={guest3}&matchId={match3}&progress=3", timeout=20)
        t3 = _mp_post(h3, base_url, {"action": "time_up", "roomId": room3, "name": host3})
        assert t3.status_code == 200 and t3.json().get("winner") == host3


# Module focus: wager APIs disabled + result verification for PROCESS_WIN multiplayer submission.
class TestMultiplayerEconomyAndVerification:
    def test_wager_actions_forbidden_and_friendly_mode_allowed(self, base_url):
        host = _new_username("wh")
        guest = _new_username("wg")
        host_s = _new_session(base_url, host)
        guest_s = _new_session(base_url, guest)

        create = _mp_post(host_s, base_url, {"action": "create", "host": host, "level": 1, "theme": "sweets", "gameMode": "onet"})
        room_id = create.json()["id"]
        _mp_post(guest_s, base_url, {"action": "join", "roomId": room_id, "name": guest, "level": 1, "theme": "sweets"})

        for action, body in [
            ("propose_wager", {"roomId": room_id, "host": host, "currency": "coins", "amount": 5}),
            ("cancel_wager", {"roomId": room_id, "host": host, "offerId": "off"}),
            ("accept_wager", {"roomId": room_id, "name": guest, "offerId": "off"}),
            ("reject_wager", {"roomId": room_id, "name": guest, "offerId": "off"}),
        ]:
            response = _mp_post(host_s if "host" in body else guest_s, base_url, {"action": action, **body})
            assert response.status_code == 403, f"{action} expected 403, got {response.status_code}: {response.text}"

        forbidden_mode = _mp_post(host_s, base_url, {"action": "change_mode", "roomId": room_id, "host": host, "mode": "Match Berhadiah"})
        assert forbidden_mode.status_code == 403

        friendly_mode = _mp_post(host_s, base_url, {"action": "change_mode", "roomId": room_id, "host": host, "mode": "Friendly Match"})
        assert friendly_mode.status_code == 200
        assert friendly_mode.json().get("mode") == "Friendly Match"

    def test_process_win_multiplayer_verification_and_archive(self, base_url):
        host_s, guest_s, host, guest, room_id, _ = _setup_playing_room(base_url, "onet")
        complete = _mp_post(host_s, base_url, {"action": "complete", "roomId": room_id, "name": host})
        assert complete.status_code == 200, complete.text
        match_id = complete.json().get("matchId")
        assert match_id

        # Trigger archive persistence by rematch (room was FINISHED before this call)
        rematch = _mp_post(host_s, base_url, {"action": "rematch", "roomId": room_id, "name": host})
        assert rematch.status_code == 200

        # winner accepted
        host_before = _profile(host_s, base_url)
        host_wins_before = _stats(host_before).get("totalWins", 0)
        winner = _mutate_state(
            host_s,
            base_url,
            "PROCESS_WIN",
            {
                "game": "onet",
                "runId": match_id,
                "isMultiplayer": True,
                "isWinner": True,
                "score": 0,
                "matches": 0,
                "level": 1,
                "timeElapsed": 1200,
            },
            host_before["revision"],
        )
        assert winner.status_code == 200, winner.text

        host_after = _profile(host_s, base_url)
        assert _stats(host_after).get("totalWins", 0) == host_wins_before + 1

        # duplicate run cannot be rewarded again
        repeat = _mutate_state(
            host_s,
            base_url,
            "PROCESS_WIN",
            {
                "game": "onet",
                "runId": match_id,
                "isMultiplayer": True,
                "isWinner": True,
                "score": 0,
                "matches": 0,
                "level": 1,
                "timeElapsed": 1200,
            },
            host_after["revision"],
        )
        assert repeat.status_code == 200, repeat.text
        host_after_repeat = _profile(host_s, base_url)
        assert _stats(host_after_repeat).get("totalWins", 0) == _stats(host_after).get("totalWins", 0)

        # loser accepted
        guest_before = _profile(guest_s, base_url)
        loser = _mutate_state(
            guest_s,
            base_url,
            "PROCESS_WIN",
            {
                "game": "onet",
                "runId": match_id,
                "isMultiplayer": True,
                "isWinner": False,
                "score": 0,
                "matches": 0,
                "level": 1,
                "timeElapsed": 2000,
            },
            guest_before["revision"],
        )
        assert loser.status_code == 200, loser.text

        # wrong winner rejected
        guest_after = _profile(guest_s, base_url)
        wrong_winner = _mutate_state(
            guest_s,
            base_url,
            "PROCESS_WIN",
            {
                "game": "onet",
                "runId": match_id,
                "isMultiplayer": True,
                "isWinner": True,
                "score": 0,
                "matches": 0,
                "level": 1,
                "timeElapsed": 2000,
            },
            guest_after["revision"],
        )
        assert wrong_winner.status_code == 400

        # wrong game rejected
        host_fresh = _profile(host_s, base_url)
        wrong_game = _mutate_state(
            host_s,
            base_url,
            "PROCESS_WIN",
            {
                "game": "block",
                "runId": match_id,
                "isMultiplayer": True,
                "isWinner": True,
                "score": 0,
                "matches": 0,
                "level": 1,
                "timeElapsed": 1200,
            },
            host_fresh["revision"],
        )
        assert wrong_game.status_code == 400

        # fake run rejected
        fake_run = _mutate_state(
            host_s,
            base_url,
            "PROCESS_WIN",
            {
                "game": "onet",
                "runId": "M-fake-run",
                "isMultiplayer": True,
                "isWinner": True,
                "score": 0,
                "matches": 0,
                "level": 1,
                "timeElapsed": 1200,
            },
            _profile(host_s, base_url)["revision"],
        )
        assert fake_run.status_code == 400

        # nonparticipant rejected
        outsider = _new_username("np")
        outsider_s = _new_session(base_url, outsider)
        outsider_profile = _profile(outsider_s, base_url)
        nonparticipant = _mutate_state(
            outsider_s,
            base_url,
            "PROCESS_WIN",
            {
                "game": "onet",
                "runId": match_id,
                "isMultiplayer": True,
                "isWinner": False,
                "score": 0,
                "matches": 0,
                "level": 1,
                "timeElapsed": 1400,
            },
            outsider_profile["revision"],
        )
        assert nonparticipant.status_code == 400
