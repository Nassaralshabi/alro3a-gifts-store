import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  const admin = await db.admin.findUnique({
    where: { id: session.sub },
    select: { username: true, name: true },
  });
  if (!admin) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: admin });
}
