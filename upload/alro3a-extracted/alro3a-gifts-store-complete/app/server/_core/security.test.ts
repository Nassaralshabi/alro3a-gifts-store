import { describe, expect, it } from "vitest";
import type { Request, Response } from "express";
import { applySecurityHeaders, ARCHIVE_BODY_LIMIT, createApiRateLimiter, getJsonBodyLimit, STANDARD_BODY_LIMIT } from "./security";

function makeResponse() {
  const headers = new Map<string, string>();
  let statusCode = 200;
  let body: unknown;
  const response = {
    setHeader: (name: string, value: string) => headers.set(name, value),
    status: (code: number) => {
      statusCode = code;
      return response;
    },
    json: (value: unknown) => {
      body = value;
      return response;
    },
  } as unknown as Response;
  return { response, headers, getStatus: () => statusCode, getBody: () => body };
}

function makeRequest(originalUrl: string, ip = "203.0.113.10") {
  return {
    originalUrl,
    url: originalUrl,
    ip,
    headers: {},
    socket: { remoteAddress: ip },
  } as unknown as Request;
}

describe("security middleware", () => {
  it("sets baseline browser protection headers", () => {
    const { response, headers } = makeResponse();
    let advanced = false;

    applySecurityHeaders(makeRequest("/"), response, () => { advanced = true; });

    expect(advanced).toBe(true);
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("limits repeated local administrator login attempts more strictly than normal catalog reads", () => {
    let timestamp = 1_000;
    const limiter = createApiRateLimiter(() => timestamp);
    const loginRequest = makeRequest("/api/trpc/auth.localLogin?batch=1");

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const { response, getStatus } = makeResponse();
      let advanced = false;
      limiter(loginRequest, response, () => { advanced = true; });
      expect(getStatus()).toBe(200);
      expect(advanced).toBe(true);
    }

    const blocked = makeResponse();
    limiter(loginRequest, blocked.response, () => undefined);
    expect(blocked.getStatus()).toBe(429);
    expect(blocked.getBody()).toEqual({ error: "Too many requests. Please try again shortly." });
    expect(blocked.headers.get("Retry-After")).toBeDefined();

    timestamp += 15 * 60_000;
    const reset = makeResponse();
    let advanced = false;
    limiter(loginRequest, reset.response, () => { advanced = true; });
    expect(advanced).toBe(true);
  });

  it("applies a narrow request limit to archive imports", () => {
    const limiter = createApiRateLimiter(() => 1_000);
    const archiveRequest = makeRequest("/api/trpc/store.admin.importImageArchive?batch=1");

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const { response, getStatus } = makeResponse();
      limiter(archiveRequest, response, () => undefined);
      expect(getStatus()).toBe(200);
    }

    const blocked = makeResponse();
    limiter(archiveRequest, blocked.response, () => undefined);
    expect(blocked.getStatus()).toBe(429);
    expect(blocked.headers.get("X-RateLimit-Limit")).toBe("2");
  });

  it("keeps general request bodies small while allowing the bounded admin archive flow", () => {
    expect(getJsonBodyLimit("/api/trpc/store.catalog.products?batch=1")).toBe(STANDARD_BODY_LIMIT);
    expect(getJsonBodyLimit("/api/trpc/store.admin.importImageArchive?batch=1")).toBe(ARCHIVE_BODY_LIMIT);
  });
});
