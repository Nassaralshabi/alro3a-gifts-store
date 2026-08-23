import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "../route";

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const p = paramsSchema.safeParse(await params);
  if (!p.success) return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  const parsed = categorySchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  if (data.slug) {
    const dup = await db.category.findFirst({ where: { slug: data.slug, id: { not: p.data.id } } });
    if (dup) return NextResponse.json({ error: "SLUG_EXISTS" }, { status: 409 });
  }
  try {
    const category = await db.category.update({ where: { id: p.data.id }, data });
    return NextResponse.json({ ok: true, category });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const p = paramsSchema.safeParse(await params);
  if (!p.success) return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  // protect: prevent deleting non-empty categories? Cascade deletes products — confirm via force param
  const force = new URL(req.url).searchParams.get("force") === "1";
  const count = await db.product.count({ where: { categoryId: p.data.id } });
  if (count > 0 && !force) {
    return NextResponse.json({ error: "CATEGORY_NOT_EMPTY", count }, { status: 409 });
  }
  try {
    await db.category.delete({ where: { id: p.data.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}
