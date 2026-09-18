"""CDE API regression tests for economy, idempotency, auth, and protected updates."""

import uuid
import requests


def _win_payload(run_id: str):
    return {
        "game": "onet",
        "runId": run_id,
        "level": 1,
        "isWinner": True,
        "isFlawless": False,
        "timeElapsed": 55000,
        "remainingTime": 40,
        "progress": 60,
        "highestCombo": 3,
        "score": 1200,
        "matches": 12,
        "isDailyChallenge": False,
    }


def _stats(profile):
    return (((profile or {}).get("profile_data") or {}).get("profile") or {}).get("statistics") or {}


def _profile_data(profile):
    return ((profile or {}).get("profile_data") or {}).get("profile") or {}


class TestCDEAuthAndSafety:
    """Auth and forbidden-operation checks."""

    def test_get_profile_requires_auth(self, base_url):
        response = requests.get(f"{base_url}/api/cde?action=get_profile", timeout=20)
        assert response.status_code == 401

    def test_invalid_token_rejected(self, base_url):
        response = requests.get(
            f"{base_url}/api/cde?action=get_profile",
            headers={"Authorization": "Bearer invalid-token"},
            timeout=20,
        )
        assert response.status_code == 401

    def test_forbidden_direct_currency_mutation_routes(self, user_session, helpers):
        for action in ("mutate_permen", "migrate_v2"):
            response = user_session.post(
                f"{helpers.API}?action={action}",
                json={"opId": str(uuid.uuid4())},
                timeout=20,
            )
            assert response.status_code == 403


class TestCDECoreFlows:
    """Provision, PROCESS_WIN semantics, idempotency, and revision checks."""

    def test_provisioned_user_profile_defaults(self, user_session, helpers):
        profile = helpers.get_profile(user_session)
        assert profile["permen"] == 0
        assert int(profile["revision"]) >= 1

    def test_process_win_no_direct_permen_but_updates_progress(self, user_session, helpers):
        before = helpers.get_profile(user_session)
        before_stats = _stats(before)

        response = helpers.mutate(user_session, "PROCESS_WIN", _win_payload(str(uuid.uuid4())), before["revision"])
        assert response.status_code == 200, response.text

        after = helpers.get_profile(user_session)
        after_stats = _stats(after)
        pdata = _profile_data(after)

        assert after["permen"] == before["permen"]
        assert after_stats.get("totalWins", 0) == before_stats.get("totalWins", 0) + 1
        assert len(pdata.get("activeMissions", [])) == 5

    def test_duplicate_runid_does_not_double_progress(self, user_session, helpers):
        run_id = str(uuid.uuid4())
        p0 = helpers.get_profile(user_session)
        s0 = _stats(p0)

        r1 = helpers.mutate(user_session, "PROCESS_WIN", _win_payload(run_id), p0["revision"])
        assert r1.status_code == 200, r1.text
        p1 = helpers.get_profile(user_session)
        s1 = _stats(p1)

        r2 = helpers.mutate(user_session, "PROCESS_WIN", _win_payload(run_id), p1["revision"])
        assert r2.status_code == 200, r2.text
        p2 = helpers.get_profile(user_session)
        s2 = _stats(p2)

        assert s1.get("totalWins", 0) == s0.get("totalWins", 0) + 1
        assert s2.get("totalWins", 0) == s1.get("totalWins", 0)

    def test_duplicate_opid_is_idempotent(self, user_session, helpers):
        p0 = helpers.get_profile(user_session)
        hints_before = _profile_data(p0).get("hints", 3)
        op_id = str(uuid.uuid4())

        r1 = helpers.mutate(user_session, "USE_ITEM", {"itemId": "hint"}, p0["revision"], opid=op_id)
        assert r1.status_code == 200, r1.text
        p1 = helpers.get_profile(user_session)
        hints_after_first = _profile_data(p1).get("hints", 3)

        # Replay exact opId with same base revision: should be idempotent (no second decrement)
        r2 = helpers.mutate(user_session, "USE_ITEM", {"itemId": "hint"}, p0["revision"], opid=op_id)
        assert r2.status_code == 200, r2.text
        p2 = helpers.get_profile(user_session)
        hints_after_second = _profile_data(p2).get("hints", 3)

        assert hints_after_first == hints_before - 1
        assert hints_after_second == hints_after_first

    def test_stale_revision_rejected(self, user_session, helpers):
        p0 = helpers.get_profile(user_session)
        r1 = helpers.mutate(user_session, "USE_ITEM", {"itemId": "hint"}, p0["revision"])
        assert r1.status_code == 200, r1.text
        r2 = helpers.mutate(user_session, "USE_ITEM", {"itemId": "hint"}, p0["revision"])
        assert r2.status_code == 409


class TestCDEEconomyRules:
    """Income source constraints and protected profile fields."""

    def test_update_profile_protected_fields_cannot_be_forged(self, user_session, helpers):
        p0 = helpers.get_profile(user_session)
        original_permen = p0["permen"]
        original_stats = _stats(p0)

        r = helpers.mutate(
            user_session,
            "UPDATE_PROFILE",
            {"permen": 9999, "statistics": {"totalWins": 777}, "hints": 50},
            p0["revision"],
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("ignored") is True

        p1 = helpers.get_profile(user_session)
        assert p1["permen"] == original_permen
        assert _stats(p1).get("totalWins", 0) == original_stats.get("totalWins", 0)

    def test_achievement_claim_grants_income_within_cap_rules(self, user_session, helpers):
        # Make first_win eligible
        p0 = helpers.get_profile(user_session)
        rw = helpers.mutate(user_session, "PROCESS_WIN", _win_payload(str(uuid.uuid4())), p0["revision"])
        assert rw.status_code == 200, rw.text

        p1 = helpers.get_profile(user_session)
        before_permen = p1["permen"]
        before_earned = (_profile_data(p1).get("economy") or {}).get("earned", 0)

        rc = helpers.mutate(
            user_session,
            "CLAIM_ACHIEVEMENT_REWARD",
            {"achievementId": "first_win"},
            p1["revision"],
        )
        assert rc.status_code == 200, rc.text

        p2 = helpers.get_profile(user_session)
        after_permen = p2["permen"]
        delta = after_permen - before_permen
        economy = _profile_data(p2).get("economy") or {}

        assert 1 <= delta <= 10
        assert int(economy.get("earned", 0)) == int(before_earned) + delta
        assert int(economy.get("earned", 0)) <= 100
