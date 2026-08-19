import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("storefront design refresh", () => {
  it("keeps responsive design hooks for the hero, navigation, catalogue filters, and product cards", () => {
    const css = source("client/src/index.css");
    const home = source("client/src/pages/Home.tsx");
    const shop = source("client/src/pages/Shop.tsx");
    const shell = source("client/src/components/StoreShell.tsx");
    const card = source("client/src/components/ProductCard.tsx");

    expect(css).toContain(".hero-panel .raed-gradient-overlay");
    expect(home).toContain("hero-panel");
    expect(home).toContain("hero-brand-badge");
    expect(shop).toContain("aria-pressed={category === \"all\"}");
    expect(shop).toContain("rounded-[1.25rem]");
    expect(shell).toContain("aria-label={isArabic ? \"فتح القائمة\"");
    expect(card).toContain("rounded-[1.15rem]");
  });
});
