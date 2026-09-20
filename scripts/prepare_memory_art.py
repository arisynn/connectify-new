"""Extract the deliberately non-uniform Memory card sheet, adding files only."""
from pathlib import Path
import json
from urllib.request import urlopen
from PIL import Image, ImageDraw
from prepare_premium_art import clean
ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://static.prod-images.emergentagent.com/jobs/0b8cb69b-dec7-4561-bae8-f56ff8e79c27/images/e2472f118b2e13618ddde945de5ad89b1baed5e7653b7c746b85e43da67f7ce0.jpeg'
BOXES = {'mint':(40,25,330,420),'autumn':(340,25,635,420),'celestial':(645,25,935,420),'arcade':(45,430,340,835),'front':(470,430,780,835),'deck':(830,450,1250,835)}
def main():
    source=ROOT/'scripts/art-originals/memory-cards.jpg'
    if not source.exists(): source.write_bytes(urlopen(SOURCE,timeout=90).read())
    sheet=Image.open(source).convert('RGB')
    out=ROOT/'public/art/premium/cards';out.mkdir(parents=True,exist_ok=True)
    review=Image.new('RGB',(6*180,300),'#eee7dd');draw=ImageDraw.Draw(review)
    for i,(name,box) in enumerate(BOXES.items()):
        image=clean(sheet.crop(box));image.thumbnail((240,356),Image.Resampling.LANCZOS)
        canvas=Image.new('RGBA',(248,368));canvas.alpha_composite(image,((248-image.width)//2,(368-image.height)//2))
        path=out/f'{name}.webp'
        if not path.exists(): canvas.save(path,'WEBP',quality=95,method=6)
        canvas.thumbnail((162,255));review.paste(canvas,(i*180+9,8),canvas);draw.text((i*180+12,274),name,fill='#172337')
    review.save(ROOT/'scripts/art-originals/memory-review.jpg',quality=90)
    (out/'manifest.json').write_text(json.dumps({'source':SOURCE,'boxes':BOXES,'assets':[f'/art/premium/cards/{name}.webp' for name in BOXES]},indent=2))
    print('6 Memory images added. Existing images unchanged.')
if __name__=='__main__': main()