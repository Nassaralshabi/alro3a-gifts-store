import { describe, expect, it } from "vitest";
import { filterCatalogProducts, getCatalogPage } from "./catalogFilters";
import type { CatalogProduct } from "@shared/store/types";

const catalog: CatalogProduct[] = [
  { product: { id: 1, categoryId: 1, slug: "gift", titleAr: "هدية", titleEn: "Gift", descriptionAr: null, descriptionEn: null, price: "80", imageUrl: null, isFeatured: false, isAvailable: true, sortOrder: 1 }, categorySlug: "gifts", categoryTitleAr: "هدايا", categoryTitleEn: "Gifts" },
  { product: { id: 2, categoryId: 2, slug: "board", titleAr: "لوحة", titleEn: "Board", descriptionAr: null, descriptionEn: null, price: "45", imageUrl: null, isFeatured: false, isAvailable: true, sortOrder: 2 }, categorySlug: "boards", categoryTitleAr: "لوحات", categoryTitleEn: "Boards" },
  { product: { id: 3, categoryId: 1, slug: "custom", titleAr: "طلب مخصص", titleEn: "Custom", descriptionAr: null, descriptionEn: null, price: null, imageUrl: null, isFeatured: false, isAvailable: true, sortOrder: 3 }, categorySlug: "gifts", categoryTitleAr: "هدايا", categoryTitleEn: "Gifts" },
];

describe("filterCatalogProducts", () => {
  it("filters products by category and search phrase", () => {
    expect(filterCatalogProducts(catalog, "gifts", "", "default").map(item => item.product.slug)).toEqual(["gift", "custom"]);
    expect(filterCatalogProducts(catalog, "all", "لوحة", "default").map(item => item.product.slug)).toEqual(["board"]);
  });

  it("sorts priced products while keeping price-on-request products last", () => {
    expect(filterCatalogProducts(catalog, "all", "", "asc").map(item => item.product.slug)).toEqual(["board", "gift", "custom"]);
    expect(filterCatalogProducts(catalog, "all", "", "desc").map(item => item.product.slug)).toEqual(["gift", "board", "custom"]);
  });

  it("returns only the requested first page of products", () => {
    expect(getCatalogPage(catalog, 2).map(item => item.product.slug)).toEqual(["gift", "board"]);
    expect(getCatalogPage(catalog, 0)).toEqual([]);
  });
});
