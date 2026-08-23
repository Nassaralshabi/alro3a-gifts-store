import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Public catalog bootstrap: categories + products + public settings. */
export async function GET() {
  try {
    const [categories, products, settingsRows] = await Promise.all([
      db.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      }),
      db.product.findMany({
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true, categoryId: true, slug: true,
          titleAr: true, titleEn: true, descAr: true, descEn: true,
          price: true, image: true, isFeatured: true, isAvailable: true,
        },
      }),
      db.setting.findMany(),
    ]);

    const settings: Record<string, { value: string; valueAr?: string | null; valueEn?: string | null }> = {};
    for (const s of settingsRows) {
      settings[s.key] = { value: s.value, valueAr: s.valueAr, valueEn: s.valueEn };
    }

    return NextResponse.json({ categories, products, settings });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
