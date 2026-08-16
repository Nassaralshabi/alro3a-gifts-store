import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  listPublicCategories: vi.fn(async () => [{ id: 1, slug: "stands-boards", titleAr: "ستاندات ولوحات", titleEn: "Stands & Boards" }]),
  listPublicProducts: vi.fn(async () => [{ product: { id: 1, titleAr: "لوحة تصوير", titleEn: "Photo board", imageUrl: "/manus-storage/imported-photo-board_1234.jpg", price: null, isFeatured: true } }]),
  getPublicHomeContent: vi.fn(async () => ({
    logoImage: null,
    heroImage: "/manus-storage/Banners_Homepage_001_bbd0c9fe.webp",
    heroImages: [
      "/manus-storage/Banners_Homepage_001_bbd0c9fe.webp",
      "/manus-storage/Banners_Homepage_002_f4bcf24d.webp",
      "/manus-storage/Banners_Homepage_003_0deaabac.webp",
      "/manus-storage/Banners_Homepage_004_4a5b9a38.webp",
      "/manus-storage/Banners_Homepage_005_acd24f42.jpg",
    ],
    promoImage: null,
    heroTitleAr: null,
    heroTitleEn: null,
    heroSubtitleAr: null,
    heroSubtitleEn: null,
  })),
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

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { appRouter } from "./routers";
import { decodeImage, normalizeArchiveSlug } from "./routers/store";
import type { TrpcContext } from "./_core/context";

function anonymousContext(): TrpcContext {
  return { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

function localAdminContext(): TrpcContext {
  return {
    user: null,
    adminUser: {
      id: 1,
      openId: "local-admin-console",
      name: "admin",
      email: null,
      loginMethod: "local",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("internal store router", () => {
  it("returns public categories and catalog products with a storage image when pricing is confirmed later", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    const categories = await caller.store.catalog.categories();
    const products = await caller.store.catalog.products({ featuredOnly: true });
    expect(categories[0]?.slug).toBe("stands-boards");
    expect(products).toHaveLength(1);
    expect(products[0]?.product).toMatchObject({ imageUrl: "/manus-storage/imported-photo-board_1234.jpg", price: null });
    expect(db.listPublicProducts).toHaveBeenCalledWith(undefined, true, undefined);
  });

  it("provides the archive banner set through the public homepage content route", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    const content = await caller.store.catalog.homeContent();

    expect(content.heroImages).toHaveLength(5);
    expect(content.heroImages).toEqual([
      "/manus-storage/Banners_Homepage_001_bbd0c9fe.webp",
      "/manus-storage/Banners_Homepage_002_f4bcf24d.webp",
      "/manus-storage/Banners_Homepage_003_0deaabac.webp",
      "/manus-storage/Banners_Homepage_004_4a5b9a38.webp",
      "/manus-storage/Banners_Homepage_005_acd24f42.jpg",
    ]);
    expect(db.getPublicHomeContent).toHaveBeenCalledTimes(1);
  });

  it("records a custom request with its selected language and quantity", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    const order = await caller.store.orders.create({ customerName: "أمل", customerPhone: "0521401021", quantity: 2, notes: "ألوان بنفسجية", language: "ar" });
    expect(order).toMatchObject({ id: 41, status: "new", quantity: 2, language: "ar" });
    expect(db.createOrder).toHaveBeenCalledWith(expect.objectContaining({ customerName: "أمل", quantity: 2, language: "ar" }));
    expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({
      title: "طلب جديد #41",
      content: expect.stringContaining("العميل: أمل"),
    }));
  });

  it("normalizes bulk archive filenames into product slugs", () => {
    expect(normalizeArchiveSlug("Al_Rawaa Gift Box 30x20.JPG")).toBe("al-rawaa-gift-box-30x20");
    expect(normalizeArchiveSlug("  sticker-pack__01.webp ")).toBe("sticker-pack-01");
  });

  it("accepts supported image data and rejects unsupported uploads before storage", () => {
    const image = decodeImage("data:image/png;base64,aGVsbG8=");
    expect(image.mimeType).toBe("image/png");
    expect(image.extension).toBe("png");
    expect(() => decodeImage("data:application/pdf;base64,aGVsbG8=")).toThrow("Only PNG, JPEG, WEBP and GIF images are accepted.");
  });

  it("allows the local admin to save an editable product price and media path", async () => {
    const caller = appRouter.createCaller(localAdminContext());
    await caller.store.admin.saveProduct({
      id: 7,
      categoryId: 3,
      slug: "sliding-gift-box-30x20",
      titleAr: "بوكس سحاب 30 × 20 × 6 سم",
      titleEn: "Sliding Gift Box 30 × 20 × 6 cm",
      descriptionAr: "وصف اختبار",
      descriptionEn: "Test description",
      price: "89.50",
      imageUrl: "/manus-storage/alrawaa-sliding-box-reference_286aefc0.png",
      isFeatured: true,
      isAvailable: true,
      sortOrder: 10,
    });
    expect(db.saveProduct).toHaveBeenCalledWith(expect.objectContaining({
      id: 7,
      price: "89.50",
      imageUrl: "/manus-storage/alrawaa-sliding-box-reference_286aefc0.png",
    }));
  });
});
