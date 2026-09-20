"""Prepare generated assets without modifying any legacy artwork.

Sources and provider provenance: art_sources.json. Run from the repository root.
Background removal is offline image processing, not an in-app AI integration.
"""
import os
os.environ.setdefault('OMP_NUM_THREADS', '2')
from pathlib import Path
import json
from urllib.request import urlopen
import numpy as np
from PIL import Image, ImageOps, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/art/premium'
SOURCES = ROOT / 'scripts/art-originals'
CONFIG = json.loads((ROOT / 'scripts/art_sources.json').read_text())
NAMES = {
    'surfaces': ['cream', 'mint', 'sunset', 'jelly', 'wood', 'night', 'cloud', 'candy', 'opal'],
    'avatars': ['mochi', 'orbit', 'bear', 'cat', 'panda', 'fox', 'shiba', 'penguin', 'koala'],
    'details': ['frames/mint', 'frames/sunset', 'frames/moon', 'effects/stars', 'effects/confetti', 'effects/blossom', 'chests/common', 'chests/rare', 'chests/epic'],
    'ui': ['onet', 'block', 'memory', 'triple', 'hint', 'shuffle', 'hammer', 'bomb', 'permen', 'achievements', 'missions', 'collection', 'theme', 'leaderboard', 'notifications', 'multiplayer']
}

def clean(cell, open_holes=False):
    # Final source sheets have solid white backgrounds. Edge-connected keying
    # keeps enclosed white porcelain intact and avoids model-generated halos.
    result = cell.convert('RGBA')
    rgb = np.array(cell.convert('RGB')).astype(float)
    low = rgb.min(axis=2)
    neutral = (rgb.max(axis=2)-low) < 18
    candidates = (low >= 238) & neutral
    regions, _ = ndimage.label(candidates)
    edges = np.unique(np.concatenate([regions[0],regions[-1],regions[:,0],regions[:,-1]]))
    background = np.isin(regions, edges[edges>0])
    if open_holes:
        background = candidates
    alpha = np.full(low.shape, 255, dtype=np.uint8)
    alpha[background] = np.clip((249-low[background])/11*255,0,255).astype(np.uint8)
    result.putalpha(Image.fromarray(alpha))
    labels, count = ndimage.label(alpha > 90)
    sizes = np.bincount(labels.ravel())
    # Remove specks and any residual atlas border, preserve detached object detail.
    keep = np.zeros_like(alpha, dtype=bool)
    for label in range(1, count + 1):
        if sizes[label] < max(12, alpha.size * .0006):
            continue
        ys, xs = np.where(labels == label)
        if xs.min() == 0 or ys.min() == 0 or xs.max() == alpha.shape[1]-1 or ys.max() == alpha.shape[0]-1:
            continue
        keep |= labels == label
    if keep.any():
        nearby = ndimage.binary_dilation(keep, iterations=2)
        alpha[~nearby] = 0
        result.putalpha(Image.fromarray(alpha))
    box = result.getchannel('A').point(lambda p: 255 if p > 35 else 0).getbbox()
    return result.crop(box) if box else result

def main():
    SOURCES.mkdir(parents=True, exist_ok=True)
    manifest = []
    previous = json.loads((OUT / 'manifest.json').read_text()) if (OUT / 'manifest.json').exists() else {}
    for kind, image_id in CONFIG['sheets'].items():
        source = SOURCES / f'{kind}-{image_id}.jpg'
        if not source.exists():
            source.write_bytes(urlopen(CONFIG['base_url'] + image_id + '.jpeg', timeout=90).read())
        image = Image.open(source).convert('RGB')
        grid = 1 if kind == 'brand' else 3 if kind in ('surfaces', 'avatars', 'details') else 4
        for i in range(grid * grid):
            name = 'mark' if kind == 'brand' else NAMES.get(kind, [str(n) for n in range(16)])[i]
            relative = name if kind == 'details' else f'{kind}/{name}'
            target = OUT / f'{relative}.webp'
            if target.exists() and previous.get('source_ids', {}).get(kind) == image_id:
                manifest.append(str(target.relative_to(ROOT / 'public')))
                continue
            col, row = i % grid, i // grid
            gutter = 7 if grid > 1 else 0
            cell = image.crop((round(col * image.width/grid)+gutter, round(row * image.height/grid)+gutter,
                               round((col+1)*image.width/grid)-gutter, round((row+1)*image.height/grid)-gutter))
            if kind == 'bakery':
                # The edited food sheet has small unwanted captions below each object.
                cell = cell.crop((0, 0, cell.width, round(cell.height*.83)))
            result = clean(cell, open_holes=(kind=='details' and i<3) or (kind=='bakery' and i==6))
            size = 640 if kind == 'brand' else 256
            padding = 3 if kind == 'surfaces' else 8
            result.thumbnail((size-padding*2, size-padding*2), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (size, size))
            canvas.alpha_composite(result, ((size-result.width)//2, (size-result.height)//2))
            target.parent.mkdir(parents=True, exist_ok=True)
            canvas.save(target, 'WEBP', quality=94, method=6)
            manifest.append(str(target.relative_to(ROOT / 'public')))
            print(relative, flush=True)
    brand = Image.open(OUT / 'brand/mark.webp').convert('RGBA')
    for name, size in [('favicon',64), ('touch-icon',180)]:
        brand.resize((size,size), Image.Resampling.LANCZOS).save(OUT / f'brand/{name}.png')
    (OUT / 'manifest.json').write_text(json.dumps({'provider': CONFIG['provider'], 'source_ids':CONFIG['sheets'], 'assets': manifest}, indent=2))
    # Local review sheet; not shipped to the game.
    review = Image.new('RGB', (960, ((len(manifest)+7)//8)*140), '#ecf0e9')
    draw = ImageDraw.Draw(review)
    for i, name in enumerate(manifest):
        icon = Image.open(ROOT / 'public' / name).convert('RGBA')
        icon.thumbnail((108,108))
        x,y = (i%8)*120, (i//8)*140
        review.paste(icon, (x+6,y+4), icon)
        draw.text((x+3,y+116), name.replace('art/premium/','')[:21], fill='#192638')
    review.save(SOURCES / 'review.jpg', quality=92)

if __name__ == '__main__':
    main()