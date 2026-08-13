import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  listPublicCategories: vi.fn(async () => [{ id: 1, slug: "stands-boards", titleAr: "ستاندات ولوحات", titleEn: "Stands & Boards" }]),
  listPublicProducts: vi.fn(async () => [{ product: { id: 1, titleAr: "لوحة تصوير", titleEn: "Photo board", isFeatured: true } }]),
  getProductBySlug: vi.fn(async () => ({ product: { id: 1, slug: "graduation-photo-board", isAvailable: true } })),
  createOrder: vi.fn(async input => ({ id: 41, ...input, status: "new" })),
  getDashboardStats: vi.fn(async () => ({ products: 1, orders: 1, newOrders: 1, categories: 1 })),
  listAllCategories: vi.fn(async () => []),
  saveCategory: vi.fn(),
  listAdminProducts: vi.fn(async () => []),
  saveProduct: vi.fn(),
  listOrders: vi.fn(async () => []),
  updateOrderStatus: vi.fn(),
  listContent: vi.fn(async () => []),
  saveContent: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function anonymousContext(): TrpcContext {
  return { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("internal store router", () => {
  it("returns public categories and featured catalog products", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    const categories = await caller.store.catalog.categories();
    const products = await caller.store.catalog.products({ featuredOnly: true });
    expect(categories[0]?.slug).toBe("stands-boards");
    expect(products).toHaveLength(1);
    expect(db.listPublicProducts).toHaveBeenCalledWith(undefined);
  });

  it("records a custom request with its selected language and quantity", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    const order = await caller.store.orders.create({ customerName: "أمل", customerPhone: "0521401021", quantity: 2, notes: "ألوان بنفسجية", language: "ar" });
    expect(order).toMatchObject({ id: 41, status: "new", quantity: 2, language: "ar" });
    expect(db.createOrder).toHaveBeenCalledWith(expect.objectContaining({ customerName: "أمل", quantity: 2, language: "ar" }));
  });
});
