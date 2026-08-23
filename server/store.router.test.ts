import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  listPublicCategories: vi.fn(async () => [{ id: 1, slug: "stands-boards", titleAr: "ستاندات ولوحات", titleEn: "Stands & Boards" }]),
  listPublicProducts: vi.fn(async () => [{ product: { id: 1, titleAr: "لوحة تصوير", titleEn: "Photo board", imageUrl: "/manus-storage/imported-photo-board_1234.jpg", price: null, isFeatured: true } }]),
  getPublicProductsPage: vi.fn(async () => ({ items: [{ product: { id: 1, titleAr: "لوحة تصوير", titleEn: "Photo board", imageUrl: "/manus-storage/imported-photo-board_1234.jpg", price: null, isFeatured: true } }], total: 1, nextCursor: null })),
  getPublicSearchSuggestions: vi.fn(async () => ({ products: [{ product: { id: 1, slug: "photo-board", titleAr: "لوحة تصوير", titleEn: "Photo board", imageUrl: "/manus-storage/imported-photo-board_1234.jpg", price: null, isFeatured: true }, categorySlug: "stands-boards", categoryTitleAr: "ستاندات ولوحات", categoryTitleEn: "Stands & Boards" }], categories: [{ id: 1, slug: "stands-boards", titleAr: "ستاندات ولوحات", titleEn: "Stands & Boards", icon: "PanelsTopLeft" }] })),
  getHomeCatalog: vi.fn(async () => ({
    categories: [{ id: 1, slug: "boxes-packaging", titleAr: "بوكسات وتغليف", titleEn: "Boxes & Packaging", icon: "Boxes" }],
    featured: [{ product: { id: 1, slug: "gift-box", titleAr: "بوكس هدايا", titleEn: "Gift box", imageUrl: "/manus-storage/gift-box.jpg", price: null, isFeatured: true } }],
    bundles: [{ product: { id: 2, slug: "gift-package", titleAr: "بكج هدية", titleEn: "Gift package", imageUrl: "/manus-storage/gift-package.jpg", price: null, isFeatured: false } }],
    sections: [{ slug: "boxes-packaging", products: [{ product: { id: 1, slug: "gift-box", titleAr: "بوكس هدايا", titleEn: "Gift box", imageUrl: "/manus-storage/gift-box.jpg", price: null, isFeatured: true } }]}],
  })),
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
    heroSlides: [
      { image: "/manus-storage/Banners_Homepage_001_bbd0c9fe.webp", badgeAr: "هديتك تحكي الكثير", badgeEn: "EVERY GIFT TELLS A STORY", titleAr: "هديتك تبدأ بتفصيلة لا تُنسى", titleEn: "Start with an unforgettable detail", subtitleAr: "اختاري هدية مصممة لمناسبتك.", subtitleEn: "Choose a gift made for your occasion." },
      { image: "/manus-storage/Banners_Homepage_002_f4bcf24d.webp", badgeAr: "أفكارك تُطبع بإتقان", badgeEn: "IDEAS, PRINTED BEAUTIFULLY", titleAr: "حوّلي فكرتك إلى هدية ملموسة", titleEn: "Turn your idea into something tangible", subtitleAr: "من التصميم إلى التغليف، نرتّب لك التفاصيل.", subtitleEn: "From design to wrapping, we bring the details together." },
      { image: "/manus-storage/Banners_Homepage_003_0deaabac.webp", badgeAr: "لكل مناسبة لمستها", badgeEn: "A TOUCH FOR EVERY OCCASION", titleAr: "لحظاتك تستحق أن تُحفظ", titleEn: "Make your moments last", subtitleAr: "توزيعات وبطاقات تترك ذكرى جميلة.", subtitleEn: "Favors and cards made to leave a beautiful memory." },
      { image: "/manus-storage/Banners_Homepage_004_4a5b9a38.webp", badgeAr: "لمن يعني لك الكثير", badgeEn: "FOR SOMEONE SPECIAL", titleAr: "تفاصيل خاصة لمن تحبين", titleEn: "A special touch for someone you love", subtitleAr: "هدايا وتغليف حسب الطلب، جاهزة لتصل بأجمل صورة.", subtitleEn: "Custom gifts and wrapping, prepared to arrive beautifully." },
      { image: "/manus-storage/Banners_Homepage_005_acd24f42.jpg", badgeAr: "احتفال أجمل يبدأ من هنا", badgeEn: "A BRIGHTER CELEBRATION STARTS HERE", titleAr: "اجعلي كل مناسبة أجمل", titleEn: "Make every celebration brighter", subtitleAr: "اكتشفي تصاميم وهدايا تضيف الفرح إلى كل احتفال.", subtitleEn: "Discover designs and gifts that bring more joy to every celebration." },
    ],
    promoImage: null,
    heroTitleAr: null,
    heroTitleEn: null,
    heroSubtitleAr: null,
    heroSubtitleEn: null,
  })),
  getPublicAppearance: vi.fn(async () => ({ headerBackground: "#FFFEFC", headerText: "#17323B", footerBackground: "#102F39", footerText: "#EDF8F8" })),
  getProductBySlug: vi.fn(async () => ({ product: { id: 1, slug: "graduation-photo-board", isAvailable: true } })),
  createOrder: vi.fn(async input => ({ id: 41, ...input, status: "new" })),
  getDashboardStats: vi.fn(async () => ({ products: 1, orders: 1, newOrders: 1, categories: 1 })),
  getAdminOperationsOverview: vi.fn(async () => ({
    summary: { products: 1, availableProducts: 1, hiddenProducts: 0, categories: 1, orders: 1, newOrders: 1, activeOrders: 1 },
    statusCounts: { new: 1, contacted: 0, confirmed: 0, completed: 0, cancelled: 0 },
    awaitingOrders: [{ id: 1, customerName: "عميل اختبار", customerPhone: "0521401021", productTitle: "بوكس اختبار", quantity: 1, status: "new", createdAt: new Date() }],
    recentOrders: [{ id: 1, customerName: "عميل اختبار", customerPhone: "0521401021", productTitle: "بوكس اختبار", quantity: 1, status: "new", createdAt: new Date() }],
  })),
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

  it("returns one compact catalog page instead of the complete catalog payload", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    const page = await caller.store.catalog.productsPage({ categorySlug: "stands-boards", query: "لوحة", priceOrder: "default", limit: 12 });

    expect(page).toMatchObject({ total: 1, nextCursor: null });
    expect(page.items).toHaveLength(1);
    expect(db.getPublicProductsPage).toHaveBeenCalledWith({ categorySlug: "stands-boards", query: "لوحة", priceOrder: "default", limit: 12 });
  });

  it("returns compact product and category suggestions for a short public search query", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    const suggestions = await caller.store.catalog.suggestions({ query: "لوحة" });

    expect(suggestions.products[0]?.product.slug).toBe("photo-board");
    expect(suggestions.categories[0]?.slug).toBe("stands-boards");
    expect(db.getPublicSearchSuggestions).toHaveBeenCalledWith("لوحة");
  });

  it("surfaces a temporary catalog-page failure so the interface can offer a retry action", async () => {
    vi.mocked(db.getPublicProductsPage).mockRejectedValueOnce(new Error("temporary catalog outage"));
    const caller = appRouter.createCaller(anonymousContext());

    await expect(caller.store.catalog.productsPage({ limit: 12, priceOrder: "default" })).rejects.toThrow("temporary catalog outage");
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
    expect(content.heroSlides).toHaveLength(5);
    expect(content.heroSlides[1]).toMatchObject({
      titleAr: "حوّلي فكرتك إلى هدية ملموسة",
      subtitleEn: "From design to wrapping, we bring the details together.",
    });
    expect(db.getPublicHomeContent).toHaveBeenCalledTimes(1);
  });

  it("provides a compact catalogue payload for homepage product discovery", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    const catalog = await caller.store.catalog.homeCatalog();

    expect(catalog.categories[0]).toMatchObject({ slug: "boxes-packaging", icon: "Boxes" });
    expect(catalog.featured).toHaveLength(1);
    expect(catalog.bundles[0]?.product.titleAr).toBe("بكج هدية");
    expect(catalog.sections[0]).toMatchObject({ slug: "boxes-packaging" });
    expect(db.getHomeCatalog).toHaveBeenCalledTimes(1);
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

  it("rejects the focused live-settings contract without an administrator session", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.store.admin.liveSettings()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.store.admin.saveLiveSettings({
      contact: { phone: "0521401021", whatsapp: "971521401021", addressAr: "عجمان، الروضة 3", instagram: "alro3a.gifts" },
      hero: { badgeAr: "شارة اختبار", titleAr: "عنوان اختبار", subtitleAr: "وصف اختبار" },
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns and saves only the allowlisted live settings for a local administrator", async () => {
    vi.mocked(db.listContent).mockResolvedValueOnce([
      { contentKey: "contact_phone", valueAr: "0500000000", valueEn: null },
      { contentKey: "home_hero_title_ar_1", valueAr: "عنوان محفوظ", valueEn: null },
    ] as never);
    const caller = appRouter.createCaller(localAdminContext());
    const settings = await caller.store.admin.liveSettings();
    expect(settings.contact.phone).toBe("0500000000");
    expect(settings.hero.titleAr).toBe("عنوان محفوظ");

    await caller.store.admin.saveLiveSettings({
      contact: { phone: "0521401021", whatsapp: "971521401021", addressAr: "عجمان، الروضة 3", instagram: "alro3a.gifts" },
      hero: { badgeAr: "تفاصيل الروعة", titleAr: "عنوان مباشر", subtitleAr: "وصف مباشر" },
    });
    expect(db.saveContent).toHaveBeenCalledTimes(7);
    expect(db.saveContent).toHaveBeenCalledWith({ contentKey: "home_hero_title_ar_1", valueAr: "عنوان مباشر", valueEn: null });
    expect(db.saveContent).not.toHaveBeenCalledWith(expect.objectContaining({ contentKey: "unapproved_key" }));
  });

  it("keeps the restored design colors by default and allows only high-contrast admin color changes", async () => {
    const publicCaller = appRouter.createCaller(anonymousContext());
    await expect(publicCaller.store.admin.appearance()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(await publicCaller.store.catalog.appearance()).toEqual({ headerBackground: "#FFFEFC", headerText: "#17323B", footerBackground: "#102F39", footerText: "#EDF8F8" });

    const adminCaller = appRouter.createCaller(localAdminContext());
    await adminCaller.store.admin.saveAppearance({ headerBackground: "#FFFEFC", headerText: "#17323B", footerBackground: "#102F39", footerText: "#EDF8F8" });
    expect(db.saveContent).toHaveBeenCalledWith({ contentKey: "appearance_header_background", valueAr: "#FFFEFC", valueEn: null });
    expect(db.saveContent).toHaveBeenCalledWith({ contentKey: "appearance_footer_text", valueAr: "#EDF8F8", valueEn: null });
    await expect(adminCaller.store.admin.saveAppearance({ headerBackground: "#FFFFFF", headerText: "#FFFFFF", footerBackground: "#102F39", footerText: "#EDF8F8" })).rejects.toThrow();
  });

  it("exposes real operational summaries only to an administrator", async () => {
    const anonymousCaller = appRouter.createCaller(anonymousContext());
    await expect(anonymousCaller.store.admin.operationsOverview()).rejects.toMatchObject({ code: "FORBIDDEN" });

    const adminCaller = appRouter.createCaller(localAdminContext());
    const overview = await adminCaller.store.admin.operationsOverview();
    expect(overview.summary).toMatchObject({ products: 1, activeOrders: 1, newOrders: 1 });
    expect(overview.awaitingOrders[0]).toMatchObject({ customerName: "عميل اختبار", status: "new" });
    expect(db.getAdminOperationsOverview).toHaveBeenCalledTimes(1);
  });
});
