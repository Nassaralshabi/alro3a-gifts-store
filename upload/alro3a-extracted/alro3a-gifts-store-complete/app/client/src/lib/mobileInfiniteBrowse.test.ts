import { describe, expect, it } from "vitest";
import { DESKTOP_CATALOG_PAGE_SIZE, getCatalogPageSize, MOBILE_CATALOG_PAGE_SIZE, shouldAutoLoadMobileCatalogPage } from "./mobileInfiniteBrowse";

describe("shouldAutoLoadMobileCatalogPage", () => {
  it("uses larger mobile batches while preserving cursor pagination without a global product cap", () => {
    expect(getCatalogPageSize(true)).toBe(MOBILE_CATALOG_PAGE_SIZE);
    expect(getCatalogPageSize(false)).toBe(DESKTOP_CATALOG_PAGE_SIZE);
    expect(MOBILE_CATALOG_PAGE_SIZE).toBe(24);
  });

  it("loads the next page only for an idle mobile catalogue with more results", () => {
    expect(shouldAutoLoadMobileCatalogPage({ isMobile: true, hasNextPage: true, isFetchingNextPage: false })).toBe(true);
    expect(shouldAutoLoadMobileCatalogPage({ isMobile: false, hasNextPage: true, isFetchingNextPage: false })).toBe(false);
    expect(shouldAutoLoadMobileCatalogPage({ isMobile: true, hasNextPage: false, isFetchingNextPage: false })).toBe(false);
    expect(shouldAutoLoadMobileCatalogPage({ isMobile: true, hasNextPage: true, isFetchingNextPage: true })).toBe(false);
  });
});
