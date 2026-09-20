"""Add seasonal WebP sprites only; never overwrite any existing artwork."""
from pathlib import Path
import json
from urllib.request import urlopen
from PIL import Image, ImageDraw
from prepare_premium_art import clean

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/art/premium'
CONFIG = json.loads((ROOT / 'scripts/seasonal_art_sources.json').read_text())
NAMES = [f'avatars/{name}' for name in ['hedgehog', 'wizard-owl', 'robot', 'polar-cub']]
NAMES += [f'frames/{name}' for name in ['autumn', 'enchanted', 'arcade', 'frost']]
NAMES += [f'surfaces/{name}' for name in ['amber', 'enchanted', 'pixel', 'frost']]
NAMES += [f'effects/{name}' for name in ['autumn', 'magic', 'pixel', 'snow']]

def main():
    manifest = []
    for kind, source_id in CONFIG['sheets'].items():
        source = ROOT / f'scripts/art-originals/seasonal-{source_id}.jpg'
        source.parent.mkdir(parents=True, exist_ok=True)
        if not source.exists():
            source.write_bytes(urlopen(CONFIG['base_url'] + source_id + '.jpeg', timeout=90).read())
        sheet = Image.open(source).convert('RGB')
        for i in range(16):
            relative = NAMES[i] if kind == 'seasonal' else f'{kind}/{i}'
            target = OUT / f'{relative}.webp'
            manifest.append(str(target.relative_to(ROOT / 'public')))
            if target.exists():
                continue
            col, row = i % 4, i // 4
            cell = sheet.crop((round(col*sheet.width/4)+5, round(row*sheet.height/4)+5,
                               round((col+1)*sheet.width/4)-5, round((row+1)*sheet.height/4)-5))
            icon = clean(cell, open_holes=kind == 'seasonal' and 4 <= i <= 7)
            padding = 3 if kind == 'seasonal' and 8 <= i <= 11 else 10
            icon.thumbnail((256-padding*2, 256-padding*2), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (256, 256))
            canvas.alpha_composite(icon, ((256-icon.width)//2, (256-icon.height)//2))
            target.parent.mkdir(parents=True, exist_ok=True)
            canvas.save(target, 'WEBP', quality=94, method=6)
    (OUT / 'seasonal-manifest.json').write_text(json.dumps({**CONFIG, 'assets': manifest}, indent=2))
    review = Image.new('RGB', (960, 10*140), '#f3f1e9')
    draw = ImageDraw.Draw(review)
    for i, name in enumerate(manifest):
        icon = Image.open(ROOT / 'public' / name).convert('RGBA')
        icon.thumbnail((104, 104))
        x, y = i % 8 * 120, i // 8 * 140
        review.paste(icon, (x+8, y+4), icon)
        draw.text((x+2, y+114), name.replace('art/premium/', '')[:20], fill='#172337')
    review.save(ROOT / 'scripts/art-originals/seasonal-review.jpg', quality=90)
    print(f'{len(manifest)} seasonal assets ready; existing images preserved.')

if __name__ == '__main__':
    main()