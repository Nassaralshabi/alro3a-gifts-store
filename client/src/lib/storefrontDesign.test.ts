import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("storefront design refresh", () => {
  it("keeps responsive design hooks for the hero, navigation, catalogue filters, and product cards", () => {
    const css = source("client/src/index.css");
    const documentTemplate = source("client/index.html");
    const home = source("client/src/pages/Home.tsx");
    const shop = source("client/src/pages/Shop.tsx");
    const shell = source("client/src/components/StoreShell.tsx");
    const card = source("client/src/components/ProductCard.tsx");
    const smartSearch = source("client/src/components/SmartSearch.tsx");

    expect(documentTemplate).toContain("family=Alexandria");
    expect(documentTemplate).toContain("family=Marhey");
    expect(documentTemplate).toContain("display=swap");
    expect(home).toContain("hero-panel");
    expect(home).toContain("hero-brand-badge");
    expect(home).toContain("object-contain will-change-transform");
    expect(home).toContain('className="border-t border-[#dbe9eb] bg-white"');
    expect(home).not.toContain("raed-gradient-overlay");
    expect(home).not.toContain("Discover products");
    expect(shop).toContain("aria-pressed={category === \"all\"}");
    expect(shop).toContain("rounded-[1.25rem]");
    expect(shell).toContain("aria-label={isArabic ? \"فتح القائمة\"");
    expect(card).toContain("rounded-[1.15rem]");
    expect(smartSearch).toContain('role="combobox"');
    expect(smartSearch).toContain('"region" : "listbox"');
    expect(smartSearch).toContain('event.key !== "ArrowDown"');
    expect(smartSearch).toContain('event.key === "Escape"');
    expect(smartSearch).toContain("SEARCH_DEBOUNCE_MS");
    expect(smartSearch).toContain("closeOnOutsidePointer");
    expect(smartSearch).toContain("suggestions.isError");
    expect(shell).toContain("store.catalog.appearance.useQuery");
    expect(shell).toContain('footerBackground || "#102F39"');
    expect(shell).not.toContain("appearancePresets");
    expect(shell).not.toContain("data-preview-header");
  });
});
