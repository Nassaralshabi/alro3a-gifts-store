import { describe, expect, it } from "vitest";
import type { Request, Response } from "express";
import { applySecurityHeaders, createApiRateLimiter } from "./security";

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
});
