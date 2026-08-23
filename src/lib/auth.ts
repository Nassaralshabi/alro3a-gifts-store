import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "alrawaa-dev-secret-change-in-production-2b8f4a"
);
export const SESSION_COOKIE = "alrawaa_session";

export type Session = { sub: string; username: string };

export async function signSession(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (typeof payload.sub === "string" && typeof payload.username === "string") {
      return { sub: payload.sub, username: payload.username };
    }
    return null;
  } catch {
    return null;
  }
}

/** Read session from request cookies (API routes). */
export async function getSession(req: Request): Promise<Session | null> {
  const token =
    req.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(SESSION_COOKIE + "="))
      ?.split("=")
      .slice(1)
      .join("=") ?? null;
  if (!token) return null;
  return verifySession(decodeURIComponent(token));
}

/** Require an authenticated admin; returns null if unauthorized. */
export async function requireAdmin(req: Request) {
  const session = await getSession(req);
  if (!session) return null;
  const admin = await db.admin.findUnique({ where: { id: session.sub } });
  return admin ? { admin, session } : null;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
