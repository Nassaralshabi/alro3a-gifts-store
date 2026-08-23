import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });
const bodySchema = z.object({
  status: z.enum(["new", "confirmed", "done"]).optional(),
  notes: z.string().max(5000).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const p = paramsSchema.safeParse(await params);
  if (!p.success) return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  try {
    const order = await db.order.update({
      where: { id: p.data.id },
      data: parsed.data,
      include: { items: true },
    });
    return NextResponse.json({ ok: true, order });
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
    await db.order.delete({ where: { id: p.data.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}
