import type { NextFunction, Request, RequestHandler, Response } from "express";

type RateLimitRule = {
  windowMs: number;
  max: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const DEFAULT_API_RULE: RateLimitRule = { windowMs: 60_000, max: 180 };
const LOGIN_RULE: RateLimitRule = { windowMs: 15 * 60_000, max: 6 };
const ORDER_RULE: RateLimitRule = { windowMs: 10 * 60_000, max: 12 };
const IMAGE_UPLOAD_RULE: RateLimitRule = { windowMs: 10 * 60_000, max: 24 };
const ARCHIVE_IMPORT_RULE: RateLimitRule = { windowMs: 10 * 60_000, max: 2 };
export const STANDARD_BODY_LIMIT = "2mb";
export const ARCHIVE_BODY_LIMIT = "70mb";
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://wa.me https://api.whatsapp.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Vite and the managed preview inject short inline bootstrap scripts. Sources remain allowlisted.
  "script-src 'self' 'unsafe-inline' https://manus-analytics.com https://plausible.io https://files.manuscdn.com",
  "connect-src 'self' ws: wss: https://api.manus.im https://manus-analytics.com https://plausible.io",
  "upgrade-insecure-requests",
].join("; ");

function getRequestBucket(requestUrl: string): "login" | "order" | "imageUpload" | "archiveImport" | "api" {
  if (requestUrl.includes("auth.localLogin")) return "login";
  if (requestUrl.includes("store.orders.create")) return "order";
  if (requestUrl.includes("store.admin.importImageArchive")) return "archiveImport";
  if (requestUrl.includes("store.admin.uploadImage")) return "imageUpload";
  return "api";
}

export function getJsonBodyLimit(requestUrl: string) {
  return requestUrl.includes("store.admin.importImageArchive") ? ARCHIVE_BODY_LIMIT : STANDARD_BODY_LIMIT;
}

function getRule(bucket: ReturnType<typeof getRequestBucket>): RateLimitRule {
  if (bucket === "login") return LOGIN_RULE;
  if (bucket === "order") return ORDER_RULE;
  if (bucket === "imageUpload") return IMAGE_UPLOAD_RULE;
  if (bucket === "archiveImport") return ARCHIVE_IMPORT_RULE;
  return DEFAULT_API_RULE;
}

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function applySecurityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  next();
}

export function createApiRateLimiter(now: () => number = Date.now): RequestHandler {
  const entries = new Map<string, RateLimitEntry>();

  return (req, res, next) => {
    const currentTime = now();
    const bucket = getRequestBucket(req.originalUrl || req.url);
    const rule = getRule(bucket);
    const key = `${bucket}:${getClientIp(req)}`;
    const current = entries.get(key);

    if (current && current.resetAt <= currentTime) entries.delete(key);
    entries.forEach((entry, entryKey) => {
      if (entry.resetAt <= currentTime) entries.delete(entryKey);
    });

    const entry = entries.get(key) ?? { count: 0, resetAt: currentTime + rule.windowMs };
    entry.count += 1;
    entries.set(key, entry);

    const remaining = Math.max(0, rule.max - entry.count);
    res.setHeader("X-RateLimit-Limit", String(rule.max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > rule.max) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - currentTime) / 1000))));
      res.status(429).json({ error: "Too many requests. Please try again shortly." });
      return;
    }

    next();
  };
}
