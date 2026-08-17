import json
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin

import requests
from PIL import Image, ImageDraw, ImageFont

BASE_URL = 'http://127.0.0.1:3000'
MAPPING_FILE = Path('/home/ubuntu/alro3a-gifts-store/docs/product_image_optimization_mapping.json')
OUTPUT = Path('/home/ubuntu/webdev-static-assets/alro3a-product-optimized/quality-contact-sheet.png')
SAMPLES = ['paper-bag-portrait-40x28', 'custom-printing-service', 'custom-gift-boxes']

mapping = json.loads(MAPPING_FILE.read_text(encoding='utf-8'))['images']
by_slug = {item['slug']: item for item in mapping}
font = ImageFont.load_default()
tile_size = 280
label_height = 42
sheet = Image.new('RGB', (tile_size * 2, (tile_size + label_height) * len(SAMPLES)), 'white')

for row, slug in enumerate(SAMPLES):
    item = by_slug[slug]
    request_url = urljoin(f'{BASE_URL}/', item['originalUrl'].lstrip('/'))
    original = Image.open(BytesIO(requests.get(request_url, timeout=60).content)).convert('RGB')
    optimized = Image.open(item['optimizedPath']).convert('RGB')
    for column, (image, label) in enumerate(((original, f'Original {item["originalBytes"] // 1024} KB'), (optimized, f'WebP {item["optimizedBytes"] // 1024} KB'))):
        canvas = image.copy()
        canvas.thumbnail((tile_size, tile_size), Image.Resampling.LANCZOS)
        frame = Image.new('RGB', (tile_size, tile_size), '#f2f5f5')
        frame.paste(canvas, ((tile_size - canvas.width) // 2, (tile_size - canvas.height) // 2))
        top = row * (tile_size + label_height)
        left = column * tile_size
        sheet.paste(frame, (left, top))
        draw = ImageDraw.Draw(sheet)
        draw.text((left + 8, top + tile_size + 6), f'{slug}\n{label}', fill='#123844', font=font)

sheet.save(OUTPUT)
print(OUTPUT)
