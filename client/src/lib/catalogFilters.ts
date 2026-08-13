import type { CatalogProduct } from "@shared/store/types";

export type PriceOrder = "default" | "asc" | "desc";

export function filterCatalogProducts(products: CatalogProduct[], category: string, query: string, priceOrder: PriceOrder): CatalogProduct[] {
  const filtered = products.filter(entry => {
    const searchable = `${entry.product.titleAr} ${entry.product.titleEn} ${entry.categoryTitleAr || ""} ${entry.categoryTitleEn || ""}`.toLocaleLowerCase();
    return (category === "all" || entry.categorySlug === category) && (!query || searchable.includes(query));
  });
  if (priceOrder === "default") return filtered;
  return [...filtered].sort((first, second) => {
    const firstPrice = first.product.price === null ? null : Number(first.product.price);
    const secondPrice = second.product.price === null ? null : Number(second.product.price);
    if (firstPrice === null) return 1;
    if (secondPrice === null) return -1;
    return priceOrder === "asc" ? firstPrice - secondPrice : secondPrice - firstPrice;
  });
}

export function getCatalogPage<T>(items: T[], visibleCount: number): T[] {
  return items.slice(0, Math.max(0, visibleCount));
}
