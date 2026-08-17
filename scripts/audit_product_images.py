import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin

import requests
from PIL import Image

BASE_URL = 'http://127.0.0.1:3000'
CATALOG_API = f'{BASE_URL}/api/trpc/store.catalog.productsPage'
OUTPUT = Path('/home/ubuntu/alro3a-gifts-store/docs/product_image_audit.json')


def fetch_catalog_page(cursor):
    payload = {'0': {'json': {'limit': 24, 'cursor': cursor, 'priceOrder': 'default'}}}
    response = requests.get(CATALOG_API, params={'batch': '1', 'input': json.dumps(payload)}, timeout=30)
    response.raise_for_status()
    body = response.json()
    return body[0]['result']['data']['json']


def list_products():
    cursor = 0
    products = []
    while cursor is not None:
        page = fetch_catalog_page(cursor)
        products.extend(item['product'] for item in page['items'])
        cursor = page.get('nextCursor')
    return products


def inspect_product(product):
    image_url = product.get('imageUrl')
    if not image_url:
        return {'slug': product['slug'], 'imageUrl': None, 'status': 'missing'}
    request_url = urljoin(f'{BASE_URL}/', image_url.lstrip('/')) if image_url.startswith('/') else image_url
    try:
        response = requests.get(request_url, timeout=45)
        response.raise_for_status()
        content = response.content
        with Image.open(BytesIO(content)) as image:
            return {
                'slug': product['slug'],
                'imageUrl': image_url,
                'status': 'ok',
                'bytes': len(content),
                'format': image.format,
                'width': image.width,
                'height': image.height,
                'mode': image.mode,
            }
    except Exception as error:
        return {'slug': product['slug'], 'imageUrl': image_url, 'status': 'error', 'error': str(error)}


products = list_products()
with ThreadPoolExecutor(max_workers=8) as executor:
    futures = [executor.submit(inspect_product, product) for product in products]
    images = [future.result() for future in as_completed(futures)]

images.sort(key=lambda item: item['slug'])
successful = [item for item in images if item['status'] == 'ok']
summary = {
    'products': len(products),
    'inspected': len(images),
    'successful': len(successful),
    'errors': len(images) - len(successful),
    'totalBytes': sum(item['bytes'] for item in successful),
    'over150KB': sum(1 for item in successful if item['bytes'] > 150 * 1024),
    'over1200px': sum(1 for item in successful if max(item['width'], item['height']) > 1200),
}
OUTPUT.write_text(json.dumps({'summary': summary, 'images': images}, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False))
