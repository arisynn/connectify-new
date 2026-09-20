"""Generate the Fruit Merge basket skin sheet (Nano Banana) and split it into sprites. Never overwrites old art."""
import asyncio, base64, json, os, sys
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / '.env')
SKINS = ['rattan', 'candy', 'frost', 'night', 'pixel', 'meadow']
PROMPT = (
    "A single flat sprite sheet on a pure white background, exactly 3 columns x 2 rows grid, six cells of equal size, "
    "each cell containing ONE tall rectangular display container seen straight from the front, filling about 92% of the cell height and 70% of the cell width. "
    "The FRONT of every container is a large clear glass panel: perfectly transparent, showing a plain pale cream interior back wall, with only a faint diagonal glass highlight in the top-left corner. "
    "NOTHING inside the container: no fruit, no objects, no text. The themed decoration is ONLY on the frame: a thick decorated top rim, thin side posts, and a sturdy decorated base. "
    "Cute cozy 3D-rendered kawaii toy style, soft studio lighting, matching glossy kawaii fruit game art. "
    "Row 1: (1) frame made of hand-woven natural rattan wicker, warm brown, (2) frame in pink and cream candy stripes with tiny strawberry charms on the rim, "
    "(3) frame of frosted light-blue ice with snowflake sparkles on the rim. "
    "Row 2: (4) midnight navy frame with tiny gold stars and a crescent moon on the rim, (5) retro pixel-art frame in bright blue and yellow blocky pixels, "
    "(6) spring meadow frame in soft green wood with small daisies on the rim. "
    "No labels, no shadows outside cells, generous white margin between cells."
)
async def generate(target: Path):
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    chat = LlmChat(api_key=os.getenv('EMERGENT_LLM_KEY'), session_id='fruit-basket-skins', system_message='You are an expert game asset illustrator.')
    chat.with_model('gemini', 'gemini-3.1-flash-image-preview').with_params(modalities=['image', 'text'])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images: raise SystemExit(f'No image returned: {text[:200]}')
    target.write_bytes(base64.b64decode(images[0]['data']))
    print('sheet saved', target, images[0]['mime_type'])
def split(sheet_path: Path):
    sheet = Image.open(sheet_path).convert('RGB'); w, h = sheet.size; cw, ch = w // 3, h // 2
    out = ROOT / 'public/art/premium/baskets'; out.mkdir(parents=True, exist_ok=True)
    review = Image.new('RGB', (6 * 130, 190), '#f4ecdf')
    for i, key in enumerate(SKINS):
        col, row = i % 3, i // 3
        cell = sheet.crop((col * cw + 8, row * ch + 8, (col + 1) * cw - 8, (row + 1) * ch - 8))
        # trim white margins
        bg = Image.new('RGB', cell.size, (255, 255, 255)); diff = Image.eval(Image.merge('L', [Image.eval(c, lambda v: 255 - v) for c in [cell.convert('L')]]), lambda v: 255 if v > 18 else 0)
        box = diff.getbbox() or (0, 0, *cell.size); cell = cell.crop(box)
        canvas = Image.new('RGB', (360, 500), (255, 255, 255)); fit = cell.copy(); fit.thumbnail((360, 500), Image.Resampling.LANCZOS)
        canvas.paste(fit, ((360 - fit.width) // 2, (500 - fit.height) // 2))
        path = out / f'{key}.webp'
        if not path.exists(): canvas.save(path, 'WEBP', quality=90, method=6)
        thumb = canvas.copy(); thumb.thumbnail((120, 170)); review.paste(thumb, (i * 130 + 5, 8))
    (out / 'manifest.json').write_text(json.dumps({'source': str(sheet_path.name), 'assets': [f'/art/premium/baskets/{k}.webp' for k in SKINS]}, indent=2))
    review.save(ROOT / 'scripts/art-originals/baskets-review.jpg', quality=88); print('6 basket sprites written')
if __name__ == '__main__':
    sheet = ROOT / 'scripts/art-originals/baskets.png'
    if not sheet.exists() or '--regen' in sys.argv: asyncio.run(generate(sheet))
    split(sheet)
