"""Shop/infinity API constraints: purchase, equip validation, and infinity result rules."""

import uuid


def _profile_data(profile):
    return ((profile or {}).get("profile_data") or {}).get("profile") or {}


def _win_payload(run_id: str, game: str = "onet", **extra):
    base = {
        "game": game,
        "runId": run_id,
        "level": 1,
        "isWinner": True,
        "isFlawless": False,
        "timeElapsed": 35000,
        "remainingTime": 1,
        "progress": 60,
        "highestCombo": 12,
        "score": 12000,
        "matches": 20,
        "linesCleared": 6,
        "blocksCleared": 30,
        "stars": 3,
    }
    base.update(extra)
    return base


def _claim_achievement(user_session, helpers, profile, achievement_id):
    r = helpers.mutate(
        user_session,
        "CLAIM_ACHIEVEMENT_REWARD",
        {"achievementId": achievement_id},
        profile["revision"],
    )
    assert r.status_code == 200, r.text
    return helpers.get_profile(user_session)


def _earn_for_shop(user_session, helpers):
    p = helpers.get_profile(user_session)
    claimables = [
        "first_win",
        "high_score",
        "total_score",
        "survivor",
        "near_death",
        "block_lines",
        "memory_master",
        "triple_master",
    ]
    claimed = set()

    def try_claim_all(current):
        for ach in claimables:
            if ach in claimed:
                continue
            r = helpers.mutate(
                user_session,
                "CLAIM_ACHIEVEMENT_REWARD",
                {"achievementId": ach},
                current["revision"],
            )
            if r.status_code == 200:
                claimed.add(ach)
                current = helpers.get_profile(user_session)
        return current

    # Up to 12 wins/claims until we reach enough permen for one cosmetic purchase.
    for _ in range(12):
        if p["permen"] >= 30:
            return p

        # Onet
        r1 = helpers.mutate(user_session, "PROCESS_WIN", _win_payload(str(uuid.uuid4())), p["revision"])
        assert r1.status_code == 200, r1.text
        p = helpers.get_profile(user_session)
        p = try_claim_all(p)
        if p["permen"] >= 30:
            return p

        # Block / Memory / Triple to unlock their low-tier achievements.
        for game in ["block", "memory", "triple"]:
            rw = helpers.mutate(user_session, "PROCESS_WIN", _win_payload(str(uuid.uuid4()), game=game), p["revision"])
            assert rw.status_code == 200, rw.text
            p = helpers.get_profile(user_session)
            p = try_claim_all(p)
            if p["permen"] >= 30:
                return p

    return p


class TestShopAndCosmeticRules:
    """Permanent cosmetic purchase/equip and anti-forgery checks."""

    def test_purchase_insufficient_funds_rejected(self, user_session, helpers):
        p0 = helpers.get_profile(user_session)
        r = helpers.mutate(user_session, "PURCHASE_ITEM", {"itemId": "frame_mint"}, p0["revision"])
        assert r.status_code == 400
        assert r.json().get("error") == "INSUFFICIENT_PERMEN"

    def test_real_cosmetic_purchase_deducts_server_price_and_persists(self, user_session, helpers):
        p0 = _earn_for_shop(user_session, helpers)
        before = p0["permen"]
        assert before >= 30

        r = helpers.mutate(
            user_session,
            "PURCHASE_ITEM",
            {"itemId": "frame_mint", "price": 1},  # forged price should be ignored server-side
            p0["revision"],
        )
        assert r.status_code == 200, r.text

        p1 = helpers.get_profile(user_session)
        prof = _profile_data(p1)
        assert p1["permen"] == before - 30
        assert "frame_mint" in (prof.get("ownedCosmetics") or [])
        ledger = prof.get("ledger") or []
        assert any(entry.get("source") == "PURCHASE_ITEM" and entry.get("amount", 0) < 0 for entry in ledger)

    def test_duplicate_purchase_rejected(self, user_session, helpers):
        p0 = _earn_for_shop(user_session, helpers)
        r1 = helpers.mutate(user_session, "PURCHASE_ITEM", {"itemId": "frame_mint"}, p0["revision"])
        assert r1.status_code == 200, r1.text
        p1 = helpers.get_profile(user_session)
        if p1["permen"] < 30:
            p1 = _earn_for_shop(user_session, helpers)

        r2 = helpers.mutate(user_session, "PURCHASE_ITEM", {"itemId": "frame_mint"}, p1["revision"])
        assert r2.status_code == 400
        assert r2.json().get("error") == "ALREADY_OWNED"

    def test_equip_owned_and_reject_unowned_or_slot_mismatch(self, user_session, helpers):
        p0 = _earn_for_shop(user_session, helpers)
        r1 = helpers.mutate(user_session, "PURCHASE_ITEM", {"itemId": "frame_mint"}, p0["revision"])
        assert r1.status_code == 200, r1.text
        p1 = helpers.get_profile(user_session)

        equip_owned = helpers.mutate(
            user_session,
            "UPDATE_PROFILE",
            {"equippedCosmetics": {"frame": "frame_mint"}},
            p1["revision"],
        )
        assert equip_owned.status_code == 200, equip_owned.text
        p2 = helpers.get_profile(user_session)
        assert (_profile_data(p2).get("equippedCosmetics") or {}).get("frame") == "frame_mint"

        unowned = helpers.mutate(
            user_session,
            "UPDATE_PROFILE",
            {"equippedCosmetics": {"avatar": "avatar_mochi"}},
            p2["revision"],
        )
        assert unowned.status_code == 400
        assert unowned.json().get("error") == "COSMETIC_LOCKED"

        mismatch = helpers.mutate(
            user_session,
            "UPDATE_PROFILE",
            {"equippedCosmetics": {"avatar": "frame_mint"}},
            p2["revision"],
        )
        assert mismatch.status_code == 400
        assert mismatch.json().get("error") == "COSMETIC_LOCKED"

    def test_cannot_forge_owned_cosmetics_via_update_profile(self, user_session, helpers):
        p0 = helpers.get_profile(user_session)
        forged = helpers.mutate(
            user_session,
            "UPDATE_PROFILE",
            {"ownedCosmetics": ["avatar_mochi", "frame_mint"]},
            p0["revision"],
        )
        assert forged.status_code == 200, forged.text
        body = forged.json()
        assert body.get("ignored") is True
        p1 = helpers.get_profile(user_session)
        assert "avatar_mochi" not in (_profile_data(p1).get("ownedCosmetics") or [])


class TestInfinityResultRules:
    """Infinity run constraints and progression boundaries."""

    def test_infinity_cannot_submit_winner_true(self, user_session, helpers):
        p0 = helpers.get_profile(user_session)
        payload = _win_payload(str(uuid.uuid4()), game="block-infinity", isWinner=True)
        r = helpers.mutate(user_session, "PROCESS_WIN", payload, p0["revision"])
        assert r.status_code == 400
        assert r.json().get("error") == "INVALID_GAME_RESULT"

    def test_infinity_loss_updates_infinity_stats_without_advancing_campaign(self, user_session, helpers):
        p0 = helpers.get_profile(user_session)
        pd0 = _profile_data(p0)
        level_before = pd0.get("highestBlockPuzzleLevel", 1)

        payload = _win_payload(
            str(uuid.uuid4()),
            game="block-infinity",
            isWinner=False,
            linesCleared=9,
            score=4321,
            level=1,
        )
        r = helpers.mutate(user_session, "PROCESS_WIN", payload, p0["revision"])
        assert r.status_code == 200, r.text

        p1 = helpers.get_profile(user_session)
        stats = (_profile_data(p1).get("statistics") or {})
        pd1 = _profile_data(p1)
        assert stats.get("infinityGames", 0) >= 1
        assert stats.get("infinityHighScore", 0) >= 4321
        assert pd1.get("highestBlockPuzzleLevel", 1) == level_before
