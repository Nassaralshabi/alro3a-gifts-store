from pathlib import Path
from PIL import Image

ROOT = Path("/home/ubuntu/webdev-static-assets/price-marker-removal")
TARGETS = {
    "w03-price-marker-removed.png": (900, 900),
    "weej-bundle-003-price-removed.png": (900, 900),
    "law-offer-price-removed.png": (500, 500),
    "sticker-roll-w01-price-removed.png": (500, 500),
    "abaya-bundle-price-removed.png": (500, 500),
    "eid-bundle-price-removed.png": (900, 900),
    "business-cards-price-removed.png": (900, 900),
    "masabih-bundle-price-removed.png": (500, 500),
    "wedding-bundle-price-removed.png": (500, 500),
    "photo-stand-price-removed.png": (240, 320),
}

for source_name, dimensions in TARGETS.items():
    source = ROOT / source_name
    output = source.with_suffix(".webp")
    with Image.open(source) as image:
        image.convert("RGB").resize(dimensions, Image.Resampling.LANCZOS).save(output, "WEBP", quality=88, method=6)
    print(f"{source.name} -> {output.name} ({output.stat().st_size} bytes)")
