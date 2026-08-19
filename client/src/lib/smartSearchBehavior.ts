export const SEARCH_DEBOUNCE_MS = 280;
export const SEARCH_MINIMUM_LENGTH = 2;

export function getNextSearchOptionIndex(currentIndex: number, optionCount: number, key: "ArrowDown" | "ArrowUp") {
  if (optionCount <= 0) return -1;
  if (key === "ArrowDown") return currentIndex < optionCount - 1 ? currentIndex + 1 : 0;
  return currentIndex > 0 ? currentIndex - 1 : optionCount - 1;
}

export function getCatalogueSearchHref(query: string) {
  return `/shop?search=${encodeURIComponent(query.trim())}`;
}
