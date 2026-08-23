import { describe, expect, it } from "vitest";
import { isStaleDynamicImportError, reserveStaleChunkRetry } from "./dynamicImportRecovery";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("dynamic import recovery", () => {
  it("recognises hashed chunk failures after a deployment", () => {
    expect(isStaleDynamicImportError(new TypeError("Failed to fetch dynamically imported module: /assets/ProductDetail-old.js"))).toBe(true);
    expect(isStaleDynamicImportError(new Error("Network unavailable"))).toBe(false);
  });

  it("allows one automatic reload per cooldown window", () => {
    const storage = memoryStorage();
    expect(reserveStaleChunkRetry(storage, 1_000)).toBe(true);
    expect(reserveStaleChunkRetry(storage, 2_000)).toBe(false);
    expect(reserveStaleChunkRetry(storage, 301_001)).toBe(true);
  });
});
