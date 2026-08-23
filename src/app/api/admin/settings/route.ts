import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const bodySchema = z.record(z.string(), z.object({
  value: z.string().max(200000).optional(),
  valueAr: z.string().max(200000).nullable().optional(),
  valueEn: z.string().max(200000).nullable().optional(),
}));

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const settings = await db.setting.findMany();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }
  const entries = Object.entries(parsed.data);
  for (const [key, val] of entries) {
    const existing = await db.setting.findUnique({ where: { key } });
    if (existing) {
      await db.setting.update({
        where: { key },
        data: {
          value: val.value ?? existing.value,
          valueAr: val.valueAr !== undefined ? val.valueAr : existing.valueAr,
          valueEn: val.valueEn !== undefined ? val.valueEn : existing.valueEn,
        },
      });
    } else {
      await db.setting.create({
        data: {
          key,
          value: val.value ?? "",
          valueAr: val.valueAr ?? null,
          valueEn: val.valueEn ?? null,
        },
      });
    }
  }
  const settings = await db.setting.findMany();
  return NextResponse.json({ ok: true, settings });
}
