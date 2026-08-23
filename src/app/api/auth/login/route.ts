import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, recordFailure, resetFailures } from "@/lib/rateLimit";

const bodySchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(128),
});

function clientKey(req: Request, username: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${ip}:${username.toLowerCase()}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }
    const { username, password } = parsed.data;
    const key = clientKey(req, username);

    // brute-force protection
    const rl = checkRateLimit(key);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "TOO_MANY_ATTEMPTS", retryAfterSec: rl.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 900) } }
      );
    }

    const admin = await db.admin.findUnique({ where: { username } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      recordFailure(key);
      // generic message — do not reveal whether the user exists
      return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    resetFailures(key);
    const token = await signSession({ sub: admin.id, username: admin.username });
    await setSessionCookie(token);
    return NextResponse.json({ ok: true, user: { username: admin.username, name: admin.name } });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
