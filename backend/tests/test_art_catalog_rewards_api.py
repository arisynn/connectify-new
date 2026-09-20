"""Catalog/reward contract checks and API guardrail tests for art economy updates."""

import subprocess
import uuid


def _profile_data(profile):
    return ((profile or {}).get("profile_data") or {}).get("profile") or {}


def test_art_catalog_contracts_script_passes():
    result = subprocess.run(
        ["yarn", "tsx", "/app/tests/art_catalog_contracts.ts"],
        capture_output=True,
        text=True,
        timeout=120,
        check=False,
        cwd="/app",
    )
    assert result.returncode == 0, result.stderr or result.stdout
    assert '"ok":true' in result.stdout.replace(" ", "")


def test_new_and_reward_theme_generation_script_passes():
    result = subprocess.run(
        ["yarn", "tsx", "/app/tests/new_theme_generation_check.ts"],
        capture_output=True,
        text=True,
        timeout=120,
        check=False,
        cwd="/app",
    )
    assert result.returncode == 0, result.stderr or result.stdout
    assert '"ok":true' in result.stdout.replace(" ", "")


class TestArtEconomyApiGuards:
    """Server-authoritative checks for reward purchases, equip rules, and daily check-in idempotency."""

    def test_reward_theme_purchase_rejected(self, user_session, helpers):
        profile = helpers.get_profile(user_session)
        response = helpers.mutate(
            user_session,
            "PURCHASE_ITEM",
            {"itemId": "theme_reward_sakura", "price": 1},
            profile["revision"],
        )
        assert response.status_code == 400
        assert response.json().get("error") == "INVALID_ITEM"

    def test_meadow_is_free_and_unowned_theme_equip_is_rejected(self, user_session, helpers):
        profile = helpers.get_profile(user_session)
        equip_free = helpers.mutate(
            user_session,
            "UPDATE_PROFILE",
            {"activeTheme": "meadow"},
            profile["revision"],
        )
        assert equip_free.status_code == 200, equip_free.text

        after = helpers.get_profile(user_session)
        assert _profile_data(after).get("activeTheme") == "meadow"

        equip_locked = helpers.mutate(
            user_session,
            "UPDATE_PROFILE",
            {"activeTheme": "sakura"},
            after["revision"],
        )
        assert equip_locked.status_code == 400
        assert equip_locked.json().get("error") == "THEME_LOCKED"

    def test_daily_check_in_same_day_idempotent_and_payload_timestamp_ignored(self, user_session, helpers):
        profile = helpers.get_profile(user_session)
        before_login_days = int((_profile_data(profile).get("statistics") or {}).get("totalLoginDays", 0))

        first = helpers.mutate(
            user_session,
            "DAILY_CHECK_IN",
            {"clientDate": "2035-12-31", "now": 9999999999999},
            profile["revision"],
            opid=str(uuid.uuid4()),
        )
        assert first.status_code == 200, first.text

        p1 = helpers.get_profile(user_session)
        d1 = int((_profile_data(p1).get("statistics") or {}).get("totalLoginDays", 0))
        assert d1 in (before_login_days, before_login_days + 1)

        second = helpers.mutate(
            user_session,
            "DAILY_CHECK_IN",
            {"clientDate": "1999-01-01", "now": 1},
            p1["revision"],
            opid=str(uuid.uuid4()),
        )
        assert second.status_code == 200, second.text
        p2 = helpers.get_profile(user_session)
        d2 = int((_profile_data(p2).get("statistics") or {}).get("totalLoginDays", 0))
        assert d2 == d1
