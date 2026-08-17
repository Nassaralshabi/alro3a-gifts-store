import json
import re
from pathlib import Path

MAPPING_FILE = Path('/home/ubuntu/alro3a-gifts-store/docs/product_image_optimization_mapping.json')
UPLOADS_FILE = Path('/home/ubuntu/alro3a-gifts-store/docs/product_image_upload_urls.txt')
SQL_FILE = Path('/home/ubuntu/alro3a-gifts-store/docs/update_optimized_product_images.sql')
RESULT_FILE = Path('/home/ubuntu/alro3a-gifts-store/docs/product_image_optimization_result.json')

mapping = json.loads(MAPPING_FILE.read_text(encoding='utf-8'))
uploads = UPLOADS_FILE.read_text(encoding='utf-8')
paths = re.findall(r'Storage Path: (/manus-storage/([^\n/]+?)-900_[^\n/]+\.webp)', uploads)
by_slug = {slug: url for url, slug in paths}

records = []
for image in mapping['images']:
    slug = image['slug']
    if slug not in by_slug:
        raise RuntimeError(f'Missing uploaded image URL for {slug}')
    records.append({**image, 'optimizedUrl': by_slug[slug]})

if len(records) != len(mapping['images']):
    raise RuntimeError('Incomplete optimized image mapping')

statements = ['START TRANSACTION;']
for record in records:
    url = record['optimizedUrl'].replace("'", "''")
    slug = record['slug'].replace("'", "''")
    statements.append(f"UPDATE products SET imageUrl = '{url}' WHERE slug = '{slug}';")
statements.append('COMMIT;')
SQL_FILE.write_text('\n'.join(statements) + '\n', encoding='utf-8')
RESULT_FILE.write_text(json.dumps({'summary': mapping['summary'], 'images': records}, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'records': len(records), 'sql': str(SQL_FILE)}, ensure_ascii=False))
