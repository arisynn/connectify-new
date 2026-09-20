"""Premium art delivery checks: file counts, transparency basics, and runtime URL availability."""

import json
from pathlib import Path

import requests
from PIL import Image


PREMIUM_DIR = Path('/app/public/art/premium')
MANIFEST_PATH = PREMIUM_DIR / 'manifest.json'


def test_premium_webp_count_and_brand_png_presence():
    webps = list(PREMIUM_DIR.rglob('*.webp'))
    assert len(webps) == 124

    assert (PREMIUM_DIR / 'brand' / 'favicon.png').exists()
    assert (PREMIUM_DIR / 'brand' / 'touch-icon.png').exists()


def test_premium_webp_has_alpha_channel_and_non_opaque_pixels():
    webps = list(PREMIUM_DIR.rglob('*.webp'))
    assert webps, 'No premium webp assets found'

    for path in webps:
        with Image.open(path) as img:
            assert img.mode in ('RGBA', 'LA') or ('A' in img.getbands()), f'{path} has no alpha channel'
            alpha = img.convert('RGBA').getchannel('A')
            alpha_min, alpha_max = alpha.getextrema()
            assert alpha_min < 255, f'{path} appears fully opaque (no transparency)'
            assert alpha_max > 0, f'{path} appears fully transparent/unusable'


def test_manifest_and_brand_urls_resolve(base_url):
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    assets = manifest.get('assets', [])
    assert assets, 'Manifest has no assets'

    url_paths = [f"/{p.lstrip('/')}" for p in assets]
    url_paths += ['/art/premium/brand/favicon.png', '/art/premium/brand/touch-icon.png']

    session = requests.Session()
    missing = []
    for rel in url_paths:
        response = session.get(f"{base_url}{rel}", timeout=20)
        if response.status_code != 200:
            missing.append((rel, response.status_code))

    assert not missing, f'Missing/broken asset URLs: {missing[:10]}'
