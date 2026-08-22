import { describe, expect, it } from "vitest";
import { shouldAutoLoadMobileCatalogPage } from "./mobileInfiniteBrowse";

describe("shouldAutoLoadMobileCatalogPage", () => {
  it("loads the next page only for an idle mobile catalogue with more results", () => {
    expect(shouldAutoLoadMobileCatalogPage({ isMobile: true, hasNextPage: true, isFetchingNextPage: false })).toBe(true);
    expect(shouldAutoLoadMobileCatalogPage({ isMobile: false, hasNextPage: true, isFetchingNextPage: false })).toBe(false);
    expect(shouldAutoLoadMobileCatalogPage({ isMobile: true, hasNextPage: false, isFetchingNextPage: false })).toBe(false);
    expect(shouldAutoLoadMobileCatalogPage({ isMobile: true, hasNextPage: true, isFetchingNextPage: true })).toBe(false);
  });
});
