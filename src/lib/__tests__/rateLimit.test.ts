import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Unit tests for the login rate limiter (src/lib/rateLimit.ts).
 * These run in isolation — no Next.js server required.
 */
vi.mock("next/headers", () => ({ cookies: () => ({}) }));

describe("rateLimit", () => {
  let checkRateLimit: typeof import("../rateLimit").checkRateLimit;
  let recordFailure: typeof import("../rateLimit").recordFailure;
  let resetFailures: typeof import("../rateLimit").resetFailures;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../rateLimit");
    checkRateLimit = mod.checkRateLimit;
    recordFailure = mod.recordFailure;
    resetFailures = mod.resetFailures;
  });

  it("allows requests under the threshold", () => {
    const key = "test-ip:user1";
    for (let i = 0; i < 4; i++) {
      recordFailure(key);
    }
    expect(checkRateLimit(key).allowed).toBe(true);
  });

  it("blocks after 5 failures", () => {
    const key = "test-ip:user2";
    for (let i = 0; i < 5; i++) {
      recordFailure(key);
    }
    const res = checkRateLimit(key);
    expect(res.allowed).toBe(false);
    expect(res.retryAfterSec).toBeGreaterThan(0);
    expect(res.retryAfterSec).toBeLessThanOrEqual(900);
  });

  it("blocks even the 6th+ attempts", () => {
    const key = "test-ip:user3";
    for (let i = 0; i < 8; i++) {
      recordFailure(key);
    }
    expect(checkRateLimit(key).allowed).toBe(false);
  });

  it("resets after successful login (resetFailures)", () => {
    const key = "test-ip:user4";
    for (let i = 0; i < 4; i++) {
      recordFailure(key);
    }
    resetFailures(key);
    for (let i = 0; i < 4; i++) {
      recordFailure(key);
    }
    expect(checkRateLimit(key).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const a = "ip1:admin";
    const b = "ip2:admin";
    for (let i = 0; i < 5; i++) recordFailure(a);
    expect(checkRateLimit(a).allowed).toBe(false);
    expect(checkRateLimit(b).allowed).toBe(true);
  });
});
