import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return NextResponse.json({ orders });
}
