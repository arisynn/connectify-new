"""Build compact, local game sprites from the generated source sheets."""
from pathlib import Path
from urllib.request import urlopen
from PIL import Image
from io import BytesIO

ROOT = Path('/app/public/art')
SHEETS = {
 'forest': '76906524ce2413982f1cb736990b93208bdafb0405c962209604c3a6a803c831',
 'space': '5fa294d88cd9df32c99ea093d32828e98b382becfb4aea155e6b217aab7396cb',
 'candy': '88ee7d972319f33b5a34513682f3dd6c73ba50ce512f10fee5d9d9ea4f93b2a1',
 'avatars': 'efc40609b6070286c11affd913bda42a663907e3d8c62866c2617f581f2d9786',
 'ocean': '48952e735b0375093878f3d516c6c79a47f47fe17040ec820e69421c0cda0a9c'
}
BASE = 'https://static.prod-images.emergentagent.com/jobs/4b6a9ca0-2199-4a07-bc22-5068b16b9ff9/images/'
for name, image_id in SHEETS.items():
    folder = ROOT / name
    folder.mkdir(parents=True, exist_ok=True)
    image = Image.open(BytesIO(urlopen(BASE + image_id + '.jpeg').read())).convert('RGB')
    n = 3 if name == 'avatars' else 4
    for row in range(n):
        for col in range(n):
            cell = image.crop((round(col*image.width/n), round(row*image.height/n), round((col+1)*image.width/n), round((row+1)*image.height/n)))
            cell.thumbnail((220, 220))
            cell.save(folder / f'{row*n+col}.webp', quality=90)
    image.resize((512,512)).save(folder / 'sheet.webp', quality=88)
    print(name, n*n, 'sprites prepared')