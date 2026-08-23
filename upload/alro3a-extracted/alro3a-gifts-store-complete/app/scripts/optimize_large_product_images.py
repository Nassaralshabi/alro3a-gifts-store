import json
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin

import requests
from PIL import Image

BASE_URL = 'http://127.0.0.1:3000'
AUDIT_FILE = Path('/home/ubuntu/alro3a-gifts-store/docs/product_image_audit.json')
OUTPUT_DIR = Path('/home/ubuntu/webdev-static-assets/alro3a-product-optimized')
MAPPING_FILE = Path('/home/ubuntu/alro3a-gifts-store/docs/product_image_optimization_mapping.json')
MAX_DIMENSION = 900
QUALITY = 80

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
audit = json.loads(AUDIT_FILE.read_text(encoding='utf-8'))
targets = [
    image for image in audit['images']
    if image['status'] == 'ok' and (max(image['width'], image['height']) > 1200 or image['bytes'] > 150 * 1024)
]

results = []
for image in targets:
    source_url = image['imageUrl']
    request_url = urljoin(f'{BASE_URL}/', source_url.lstrip('/')) if source_url.startswith('/') else source_url
    response = requests.get(request_url, timeout=60)
    response.raise_for_status()
    destination = OUTPUT_DIR / f"{image['slug']}-900.webp"
    with Image.open(BytesIO(response.content)) as source:
        source = source.convert('RGB')
        source.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)
        source.save(destination, 'WEBP', quality=QUALITY, method=6)
    results.append({
        'slug': image['slug'],
        'originalUrl': source_url,
        'originalBytes': image['bytes'],
        'originalWidth': image['width'],
        'originalHeight': image['height'],
        'optimizedPath': str(destination),
        'optimizedBytes': destination.stat().st_size,
    })

summary = {
    'selected': len(results),
    'originalBytes': sum(item['originalBytes'] for item in results),
    'optimizedBytes': sum(item['optimizedBytes'] for item in results),
}
summary['savedBytes'] = summary['originalBytes'] - summary['optimizedBytes']
summary['savedPercent'] = round(summary['savedBytes'] * 100 / summary['originalBytes'], 2) if summary['originalBytes'] else 0
MAPPING_FILE.write_text(json.dumps({'summary': summary, 'images': results}, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False))
