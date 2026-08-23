import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "../route";

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const p = paramsSchema.safeParse(await params);
  if (!p.success) return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  const parsed = productSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  if (data.slug) {
    const dup = await db.product.findFirst({ where: { slug: data.slug, id: { not: p.data.id } } });
    if (dup) return NextResponse.json({ error: "SLUG_EXISTS" }, { status: 409 });
  }
  try {
    const product = await db.product.update({ where: { id: p.data.id }, data });
    return NextResponse.json({ ok: true, product });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const p = paramsSchema.safeParse(await params);
  if (!p.success) return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  try {
    await db.product.delete({ where: { id: p.data.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}
