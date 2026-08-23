import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

/**
 * Magic-bytes signature validation — never trust client MIME type.
 * Returns the canonical extension, or null if the content is not a real image.
 */
function sniffImage(buf: Buffer): string | null {
  // JPEG: FF D8 FF
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length > 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return ".png";
  // GIF: GIF87a / GIF89a
  if (buf.length > 6 && buf.toString("ascii", 0, 3) === "GIF") return ".gif";
  // WEBP: RIFF....WEBP
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return ".webp";
  return null;
}

/** Admin: upload an image → validated by magic bytes → saved to public/uploads. */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "EMPTY_FILE" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Security: SVG intentionally rejected (scriptable → stored-XSS vector).
    // Content is verified by signature, not by the declared MIME type.
    const ext = sniffImage(bytes);
    if (!ext) {
      return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 415 });
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`;
    await writeFile(path.join(dir, name), bytes);
    return NextResponse.json({ ok: true, url: `/uploads/${name}` });
  } catch {
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
