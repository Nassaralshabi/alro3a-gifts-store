import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const productSchema = z.object({
  categoryId: z.number().int().positive(),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "slug must be lowercase/hyphens"),
  titleAr: z.string().trim().min(1).max(240),
  titleEn: z.string().trim().min(1).max(240),
  descAr: z.string().max(4000).optional().default(""),
  descEn: z.string().max(4000).optional().default(""),
  price: z.number().nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  isFeatured: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

/** Admin: list all products (with category). */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const products = await db.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { category: { select: { titleAr: true, titleEn: true, slug: true } } },
  });
  return NextResponse.json({ products });
}

/** Admin: create product. */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = productSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }
  const exists = await db.product.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) return NextResponse.json({ error: "SLUG_EXISTS" }, { status: 409 });
  const product = await db.product.create({ data: parsed.data });
  return NextResponse.json({ ok: true, product });
}
