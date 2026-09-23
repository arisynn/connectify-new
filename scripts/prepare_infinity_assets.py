"""Infinity-only original bitmap pack. Preserve all previous game artwork."""
from pathlib import Path
from collections import deque
import math, random, urllib.request
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/art/infinity'
SRC = ROOT / 'scripts/art-originals/infinity'
OUT.mkdir(parents=True, exist_ok=True)
SRC.mkdir(parents=True, exist_ok=True)
SHEETS = {
    'players': ('https://static.prod-images.emergentagent.com/jobs/f240ee2a-1c3c-4c62-a697-d6af9a74fe44/images/aad10776d11c609c1d084d8d569584d54b0c81ba0d28c679f19dbc9cf91296aa.jpeg', ['scout','coral','glacier','phantom','mint','solar']),
    'enemies': ('https://static.prod-images.emergentagent.com/jobs/f240ee2a-1c3c-4c62-a697-d6af9a74fe44/images/40146affaa9abd74d3faa96b4ee80a495754f2c497668bb148f2f6e820fc8a12.jpeg', ['drone','interceptor','cruiser','boss-manta','boss-kraken','boss-helios']),
    'reinforcements': ('https://static.prod-images.emergentagent.com/jobs/f240ee2a-1c3c-4c62-a697-d6af9a74fe44/images/cd07945ba517c1a4638f3856d102df388f5bb7f4e9c4d5dd5bbe0b8b49023faf.jpeg', ['wasp','bomber','guardian','boss-serpent','boss-eclipse','boss-crown']),
    'arsenal': ('https://static.prod-images.emergentagent.com/jobs/f240ee2a-1c3c-4c62-a697-d6af9a74fe44/images/c0c39ae7669715c45c64e2dfbfb3223ce58cef29b1f5afd917c722310ffda9f1.jpeg', ['companion','power-spread','power-rapid','power-beam','power-drone','power-shield'])
}
for sheet, (url, names) in SHEETS.items():
    source = SRC / f'{sheet}.jpg'
    if not source.exists(): urllib.request.urlretrieve(url, source)
    atlas = Image.open(source).convert('RGBA')
    for i, name in enumerate(names):
        x, y = i % 3, i // 3
        img = atlas.crop((x*atlas.width//3+14, y*atlas.height//2+14, (x+1)*atlas.width//3-14, (y+1)*atlas.height//2-14))
        pixels = img.load(); w,h = img.size
        queue = deque([(xx,yy) for xx in range(w) for yy in (0,h-1)] + [(xx,yy) for yy in range(h) for xx in (0,w-1)])
        seen = set()
        while queue:
            xx,yy = queue.popleft()
            if (xx,yy) in seen or not (0<=xx<w and 0<=yy<h): continue
            seen.add((xx,yy))
            r,g,b,a = pixels[xx,yy]
            if max(r,g,b)>47: continue
            pixels[xx,yy]=(r,g,b,0)
            queue.extend([(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)])
        img = img.crop(img.getbbox()); img.thumbnail((310,310), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA',(336,336)); canvas.alpha_composite(img,((336-img.width)//2,(336-img.height)//2))
        canvas.save(OUT / f'{name}.png', optimize=True)

# Original quiet starfields with a distinctive planet per sector. No stock assets.
for n, (name, tint) in enumerate([('aurora',(32,119,132)),('rift',(39,85,163)),('solar',(153,85,43)),('jade',(38,127,88)),('eclipse',(101,76,134)),('crown',(153,57,83))]):
    rng=random.Random(402+n); w,h=720,1020
    bg=Image.new('RGB',(w,h)); p=bg.load()
    for y in range(h):
        for x in range(w):
            glow=math.exp(-(((x-w*.8)/(w*.8))**2+((y-h*.3)/(h*.5))**2)*2)*.38
            p[x,y]=tuple(int(base+v*glow) for base,v in zip((7,14,25),tint))
    d=ImageDraw.Draw(bg)
    for _ in range(230):
        x,y=rng.randrange(w),rng.randrange(h); r=rng.choice([.55,.7,1,1.4]); a=rng.randrange(55,160)
        d.ellipse((x-r,y-r,x+r,y+r),fill=(a,min(200,a+20),min(220,a+35)))
    planet=Image.new('RGBA',bg.size); pd=ImageDraw.Draw(planet)
    cx,cy,rad=580,250,167
    for r in range(rad,0,-1):
        f=(r/rad)**2; pd.ellipse((cx-r,cy-r,cx+r,cy+r),fill=tuple(int(v*(.13+f*.29)) for v in tint)+(220,))
    pd.arc((cx-rad,cy-rad,cx+rad,cy+rad),190,292,fill=tuple(min(255,v+45) for v in tint)+(150,),width=2)
    bg=Image.alpha_composite(bg.convert('RGBA'),planet)
    bg.convert('RGB').save(OUT/f'background-{name}.webp',quality=88)

def save(name, draw_fn):
    im=Image.new('RGBA',(128,128)); draw_fn(ImageDraw.Draw(im)); im.save(OUT/f'{name}.png',optimize=True)
for name,color in [('blue','#85efff'),('green','#a2ffce'),('red','#ff8f9f')]:
    save(f'laser-{name}',lambda d,c=color: (d.rounded_rectangle((51,6,77,122),radius=13,fill=c),d.rounded_rectangle((60,9,68,111),radius=4,fill='#f7ffff')))
save('hazard',lambda d:(d.ellipse((43,20,85,108),fill='#ff566a'),d.ellipse((51,29,77,91),fill='#ffcfaa'),d.ellipse((58,34,70,74),fill='#fff7e4')))
save('shield',lambda d:(d.ellipse((5,5,123,123),outline='#89edeb',width=4),d.arc((12,12,116,116),210,315,fill='#edfffb',width=5)))
save('flame',lambda d:(d.polygon([(37,9),(91,9),(80,73),(64,124),(48,73)],fill='#53bde0'),d.polygon([(49,9),(79,9),(70,68),(64,89),(58,68)],fill='#dcfff7')))
save('spark',lambda d:d.polygon([(64,2),(77,45),(112,18),(88,55),(126,64),(85,76),(107,115),(74,87),(64,126),(52,85),(13,112),(39,76),(2,64),(43,52),(21,18),(52,42)],fill='#ffe3a1'))
save('heal',lambda d:(d.rounded_rectangle((21,21,107,107),radius=24,fill='#183c43',outline='#9ff6cc',width=5),d.rounded_rectangle((53,35,75,93),radius=4,fill='#baffda'),d.rounded_rectangle((35,53,93,75),radius=4,fill='#baffda')))
save('hull',lambda d:(d.polygon([(64,12),(110,30),(101,86),(64,117),(27,86),(18,30)],fill='#22495b',outline='#9cece0',width=5),d.line([(41,62),(59,80),(90,43)],fill='#d9fff4',width=8)))
save('cannon',lambda d:(d.ellipse((10,10,118,118),fill='#493c35',outline='#ffda92',width=4),d.polygon([(72,22),(38,70),(59,70),(52,106),(94,53),(72,53)],fill='#ffda92')))
save('recovery',lambda d:(d.ellipse((10,10,118,118),fill='#323651',outline='#a8cfff',width=4),d.arc((33,33,95,95),30,330,fill='#c9e4ff',width=9),d.polygon([(84,28),(107,42),(82,49)],fill='#c9e4ff')))
save('nova',lambda d:(d.ellipse((9,9,119,119),outline='#ffc5a0',width=4),d.polygon([(64,18),(77,48),(109,64),(77,78),(64,111),(50,78),(18,64),(50,49)],fill='#ffb19b'),d.ellipse((49,49,79,79),fill='#fff5df')))
save('beam',lambda d:(d.rounded_rectangle((31,0,97,128),radius=22,fill='#46bbda66'),d.rounded_rectangle((46,0,82,128),radius=16,fill='#82eeffff'),d.rounded_rectangle((59,0,69,128),radius=5,fill='#ffffffff')))
save('rapid',lambda d:(d.ellipse((45,6,83,122),fill='#ffbf6b'),d.ellipse((55,8,73,94),fill='#fff8dc')))
save('missile',lambda d:(d.polygon([(64,3),(80,36),(81,85),(99,104),(73,95),(64,115),(55,95),(29,104),(47,85),(48,36)],fill='#b9ffe1'),d.polygon([(64,8),(71,34),(64,55),(57,34)],fill='#ffffff')))
save('shot-scout',lambda d:(d.rounded_rectangle((49,5,79,123),radius=12,fill='#7bf7ff'),d.rounded_rectangle((60,8,68,109),radius=4,fill='#ffffff')))
save('shot-coral',lambda d:(d.polygon([(64,5),(86,66),(64,117),(42,66)],fill='#ff92b5'),d.polygon([(64,17),(72,63),(64,88),(56,63)],fill='#fff3f7')))
save('shot-glacier',lambda d:(d.polygon([(64,0),(83,41),(73,115),(64,128),(55,115),(45,41)],fill='#a6ceff'),d.line([(64,9),(64,115)],fill='#ffffff',width=7)))
save('shot-phantom',lambda d:(d.rounded_rectangle((43,26,85,107),radius=12,fill='#ff536e'),d.line([(54,12),(54,35)],fill='#ff92a0',width=6),d.line([(74,12),(74,35)],fill='#ff92a0',width=6),d.rounded_rectangle((58,37,70,95),radius=6,fill='#fff1c6')))
save('shot-mint',lambda d:(d.ellipse((33,31,95,99),fill='#69f4c7'),d.arc((20,13,108,110),190,355,fill='#bbffe1',width=6),d.ellipse((51,45,77,76),fill='#f0fff6')))
save('shot-solar',lambda d:(d.ellipse((31,25,97,103),fill='#f5ac53'),d.ellipse((42,37,86,91),fill='#ffe69a'),d.ellipse((54,46,74,77),fill='#ffffff')))
print(f'Created {len(list(OUT.iterdir()))} Infinity assets; previous artwork untouched.')