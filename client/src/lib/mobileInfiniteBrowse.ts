export function shouldAutoLoadMobileCatalogPage({ isMobile, hasNextPage, isFetchingNextPage }: { isMobile: boolean; hasNextPage: boolean; isFetchingNextPage: boolean }) {
  return isMobile && hasNextPage && !isFetchingNextPage;
}
