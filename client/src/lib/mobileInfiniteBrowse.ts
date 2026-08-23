export const MOBILE_CATALOG_PAGE_SIZE = 24;
export const DESKTOP_CATALOG_PAGE_SIZE = 12;

export function getCatalogPageSize(isMobile: boolean) {
  return isMobile ? MOBILE_CATALOG_PAGE_SIZE : DESKTOP_CATALOG_PAGE_SIZE;
}

export function shouldAutoLoadMobileCatalogPage({ isMobile, hasNextPage, isFetchingNextPage }: { isMobile: boolean; hasNextPage: boolean; isFetchingNextPage: boolean }) {
  return isMobile && hasNextPage && !isFetchingNextPage;
}
