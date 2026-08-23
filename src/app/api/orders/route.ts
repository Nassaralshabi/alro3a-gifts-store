import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { notifyNewOrder } from "@/lib/mailer";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(32),
  notes: z.string().trim().max(5000).optional().default(""),
  lang: z.enum(["ar", "en"]).default("ar"),
  items: z
    .array(z.object({ productId: z.number().int().positive(), qty: z.number().int().min(1).max(999) }))
    .min(1)
    .max(60),
});

/** Public: create a real persistent order. */
export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
    }
    const { name, phone, notes, lang, items } = parsed.data;

    // resolve products + snapshot data
    const ids = items.map((i) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: ids } } });
    if (products.length === 0) {
      return NextResponse.json({ error: "PRODUCTS_NOT_FOUND" }, { status: 400 });
    }
    const byId = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const rows = items
      .filter((i) => byId.has(i.productId))
      .map((i) => {
        const p = byId.get(i.productId)!;
        if (p.price) total += p.price * i.qty;
        return {
          productId: p.id,
          title: lang === "ar" ? p.titleAr : p.titleEn,
          image: p.image,
          price: p.price,
          qty: i.qty,
        };
      });
    if (rows.length === 0) {
      return NextResponse.json({ error: "PRODUCTS_NOT_FOUND" }, { status: 400 });
    }

    const ref = "R" + Date.now().toString(36).toUpperCase().slice(-6);
    const order = await db.order.create({
      data: {
        ref,
        name,
        phone,
        notes,
        lang,
        total: total > 0 ? total : null,
        items: { create: rows },
      },
      include: { items: true },
    });
    // fire-and-forget email notification (never blocks the response)
    notifyNewOrder({ ref: order.ref, name, phone, notes, total: order.total, items: rows });
    return NextResponse.json({ ok: true, order: { id: order.id, ref: order.ref, total: order.total } });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
