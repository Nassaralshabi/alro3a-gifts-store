#!/usr/bin/env python3
"""Create web-friendly WebP derivatives for processed product images."""

from pathlib import Path
from PIL import Image
import sys


def optimize(source: Path, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    destination = output_dir / f"{source.stem}.webp"
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=82, method=6)
    return destination


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: optimize_processed_images.py OUTPUT_DIR IMAGE [IMAGE ...]", file=sys.stderr)
        return 2

    output_dir = Path(sys.argv[1]).resolve()
    for raw_path in sys.argv[2:]:
        source = Path(raw_path).resolve()
        if not source.is_file():
            print(f"Missing source image: {source}", file=sys.stderr)
            return 1
        destination = optimize(source, output_dir)
        print(destination)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
