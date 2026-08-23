from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

SOURCE = Path("/home/ubuntu/releases/alro3a-gifts-static-html-full/assets/published")
OUTPUT = Path("/home/ubuntu/screenshots/published-price-review")
CELL_W, CELL_H, LABEL_H, COLUMNS, ROWS = 250, 250, 30, 5, 5

def crop_label(name: str) -> str:
    return name[:31] + ("…" if len(name) > 31 else "")

def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    files = sorted(path for path in SOURCE.iterdir() if path.is_file())
    page_size = COLUMNS * ROWS
    for page_index, start in enumerate(range(0, len(files), page_size), 1):
        page_files = files[start:start + page_size]
        canvas = Image.new("RGB", (COLUMNS * CELL_W, ROWS * (CELL_H + LABEL_H)), "white")
        draw = ImageDraw.Draw(canvas)
        for item_index, path in enumerate(page_files):
            x = (item_index % COLUMNS) * CELL_W
            y = (item_index // COLUMNS) * (CELL_H + LABEL_H)
            with Image.open(path) as image:
                preview = ImageOps.contain(image.convert("RGB"), (CELL_W - 12, CELL_H - 12))
                tile = Image.new("RGB", (CELL_W, CELL_H), "#f3f6f6")
                tile.paste(preview, ((CELL_W - preview.width) // 2, (CELL_H - preview.height) // 2))
                canvas.paste(tile, (x, y))
            draw.text((x + 6, y + CELL_H + 7), f"{start + item_index + 1:03d} {crop_label(path.stem)}", fill="#17323b")
        target = OUTPUT / f"published-images-{page_index:02d}.jpg"
        canvas.save(target, "JPEG", quality=92)
        print(target)

if __name__ == "__main__":
    main()
