"""Add the Fruit Merge sheet as distinct sprites; old art is never overwritten."""
from pathlib import Path
from urllib.request import urlopen
from PIL import Image,ImageDraw
import json
from prepare_premium_art import clean
ROOT=Path(__file__).resolve().parents[1]
SOURCE='https://static.prod-images.emergentagent.com/jobs/0b8cb69b-dec7-4561-bae8-f56ff8e79c27/images/6d7231fb6325cbe146116509542f6aa4ddabdd3941b82585273e2525c211fc6f.jpeg'
def main():
    source=ROOT/'scripts/art-originals/fruit-merge.jpg'
    if not source.exists(): source.write_bytes(urlopen(SOURCE,timeout=90).read())
    sheet=Image.open(source).convert('RGB');out=ROOT/'public/art/premium/fruit-merge';out.mkdir(parents=True,exist_ok=True)
    review=Image.new('RGB',(8*120,2*135),'#f4ecdf');draw=ImageDraw.Draw(review)
    for i in range(16):
        col,row=i%4,i//4;image=clean(sheet.crop((col*256+5,row*256+5,(col+1)*256-5,(row+1)*256-5)))
        image.thumbnail((244,244),Image.Resampling.LANCZOS);canvas=Image.new('RGBA',(256,256));canvas.alpha_composite(image,((256-image.width)//2,(256-image.height)//2))
        path=out/f'{i}.webp'
        if not path.exists(): canvas.save(path,'WEBP',quality=94,method=6)
        canvas.thumbnail((105,105));review.paste(canvas,((i%8)*120+7,(i//8)*135+4),canvas);draw.text(((i%8)*120+7,(i//8)*135+112),str(i),fill='#172337')
    (out/'manifest.json').write_text(json.dumps({'source':SOURCE,'assets':[f'/art/premium/fruit-merge/{i}.webp' for i in range(16)]},indent=2))
    review.save(ROOT/'scripts/art-originals/fruit-merge-review.jpg',quality=90)
    print('16 Fruit Merge sprites added.')
if __name__=='__main__':main()