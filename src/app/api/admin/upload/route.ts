import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";
import { sniffImage } from "@/lib/imageSniff";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

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
    // Content verified by signature, not by the declared MIME type.
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
