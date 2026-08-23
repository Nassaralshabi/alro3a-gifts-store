from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/approved-source-products/paper-cup-8oz-source.png")
TARGET = Path("/home/ubuntu/webdev-static-assets/approved-source-products/paper-cup-8oz-source-optimized.webp")


with Image.open(SOURCE) as image:
    image.convert("RGB").save(TARGET, "WEBP", quality=82, method=6)

print(TARGET)
