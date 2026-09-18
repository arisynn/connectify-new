"""Onet/block semantic invariants via deterministic TS helper execution."""

import json
import subprocess


def test_onet_and_block_semantics_script_passes():
    result = subprocess.run(
        ["yarn", "tsx", "/app/tests/game_semantics_check.ts"],
        capture_output=True,
        text=True,
        timeout=120,
        check=False,
        cwd="/app",
    )
    assert result.returncode == 0, result.stderr or result.stdout
    lines = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    json_line = next((line for line in reversed(lines) if line.startswith('{') and line.endswith('}')), None)
    assert json_line, result.stdout
    payload = json.loads(json_line)
    assert payload["ok"] is True
    assert payload["pieceVariants"] == 11
