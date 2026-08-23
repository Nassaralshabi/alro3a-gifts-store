import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const categorySchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/),
  titleAr: z.string().trim().min(1).max(160),
  titleEn: z.string().trim().min(1).max(160),
  descAr: z.string().max(1000).optional().default(""),
  descEn: z.string().max(1000).optional().default(""),
  icon: z.string().max(40).optional().default("Package"),
  image: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = categorySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }
  const exists = await db.category.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) return NextResponse.json({ error: "SLUG_EXISTS" }, { status: 409 });
  const category = await db.category.create({ data: parsed.data });
  return NextResponse.json({ ok: true, category });
}
