import { chromium } from "playwright-core";

const baseUrl = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const browserPath = process.env.E2E_CHROMIUM_PATH || "/usr/bin/chromium";

const categories = [
  {
    id: 910001,
    slug: "promotional-gifts",
    titleAr: "هدايا إعلانية",
    titleEn: "Promotional Gifts",
    descriptionAr: "فئة اختبار معزولة.",
    descriptionEn: "Isolated test category.",
    icon: "Gift",
    sortOrder: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const product = {
  id: 910001,
  categoryId: 910001,
  slug: "isolated-gift-box",
  titleAr: "منتج تجريبي معزول",
  titleEn: "Isolated Test Gift",
  descriptionAr: "هذا المنتج موجود داخل اختبار المتصفح فقط.",
  descriptionEn: "This product exists only in browser testing.",
  price: "42.00",
  imageUrl: "/manus-storage/alrawhaa-logo_cfae3a03.webp",
  isFeatured: true,
  isAvailable: true,
  sortOrder: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const productEntry = { product, categorySlug: "promotional-gifts", categoryTitleAr: "هدايا إعلانية", categoryTitleEn: "Promotional Gifts" };
const catalogEntries = Array.from({ length: 73 }, (_, index) => {
  if (index === 0) return productEntry;
  const number = index + 1;
  return {
    ...productEntry,
    product: {
      ...product,
      id: 910000 + number,
      slug: `isolated-gift-${number}`,
      titleAr: `منتج تجريبي ${number}`,
      titleEn: `Isolated Test Product ${number}`,
    },
  };
});
const contact = {
  phone: "0500000000",
  whatsappUrl: "https://wa.me/971500000000",
  addressAr: "عنوان اختبار معزول",
  addressEn: "Isolated test address",
  instagram: "alrawhaa.test",
  instagramUrl: "https://www.instagram.com/alrawhaa.test/",
};

const liveSettings = {
  contact: { phone: "0500000000", whatsapp: "971500000000", addressAr: "عنوان اختبار حي", instagram: "alrawhaa.test" },
  hero: { badgeAr: "شارة اختبار حية", titleAr: "عنوان حي معزول", subtitleAr: "وصف حي معزول" },
};
const appearance = { headerBackground: "#FFFEFC", headerText: "#17323B", footerBackground: "#102F39", footerText: "#EDF8F8" };

function resultFor(procedure, authenticatedAdmin = null, input = {}) {
  if (procedure === "store.catalog.categories") return categories;
  if (procedure === "store.catalog.productsPage") {
    const cursor = typeof input.cursor === "number" ? input.cursor : 0;
    const limit = typeof input.limit === "number" ? input.limit : 12;
    const items = catalogEntries.slice(cursor, cursor + limit);
    return { items, total: catalogEntries.length, nextCursor: cursor + limit < catalogEntries.length ? cursor + limit : null };
  }
  if (procedure === "store.catalog.suggestions") return { products: [productEntry], categories };
  if (procedure === "store.catalog.contact") return contact;
  if (procedure === "store.catalog.appearance" || procedure === "store.admin.appearance") return appearance;
  if (procedure === "auth.adminMe") return authenticatedAdmin;
  if (procedure === "auth.me") return null;
  if (procedure === "store.admin.liveSettings") return liveSettings;
  return null;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installIsolatedApi(page, writes, authenticatedAdmin = null) {
  await page.route("**/api/trpc/**", async route => {
    const url = new URL(route.request().url());
    const path = decodeURIComponent(url.pathname.replace("/api/trpc/", ""));
    const procedures = path.split(",");
    const inputs = JSON.parse(url.searchParams.get("input") || "{}");
    const writeProcedure = route.request().method() === "GET" ? undefined : procedures.find(procedure => procedure === "auth.localLogin" || procedure === "auth.adminLogout" || procedure.startsWith("store.orders.") || procedure.startsWith("store.admin."));

    if (writeProcedure) {
      if (authenticatedAdmin && (writeProcedure === "store.admin.saveLiveSettings" || writeProcedure === "store.admin.saveAppearance")) {
        writes.push(`${writeProcedure}:isolated`);
        await route.fulfill({ contentType: "application/json", body: JSON.stringify([{ result: { data: { json: { success: true } } } }]) });
        return;
      }
      writes.push(writeProcedure);
      await route.abort();
      return;
    }

    const payload = procedures.map((procedure, index) => ({ result: { data: { json: resultFor(procedure, authenticatedAdmin, inputs[String(index)]?.json) } } }));
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(payload) });
  });
}

async function run() {
  const health = await fetch(`${baseUrl}/`).catch(() => null);
  assert(health?.ok, `تعذر الوصول إلى خادم الاختبار عند ${baseUrl}. شغّل pnpm dev أو عيّن E2E_BASE_URL.`);

  const browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    const writes = [];
    const consoleErrors = [];
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await installIsolatedApi(page, writes);

    await page.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "كل المنتجات" }).waitFor();
    await page.getByRole("link", { name: "منتج تجريبي معزول", exact: true }).first().waitFor();

    await page.getByRole("button", { name: "هدايا إعلانية", exact: true }).first().click();
    await page.getByRole("heading", { name: "هدايا إعلانية" }).waitFor();
    await page.getByRole("link", { name: "منتج تجريبي معزول", exact: true }).first().waitFor();

    const search = page.getByPlaceholder("ابحث عن هدية أو مطبوعة...");
    await search.fill("تجريبي");
    await page.waitForTimeout(360);
    assert(await page.getByText("منتج تجريبي معزول", { exact: true }).count() >= 1, "فشل البحث الفوري ضمن بيانات الاختبار المعزولة.");

    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "دخول لوحة التحكم" }).waitFor();
    assert(await page.getByPlaceholder("اسم المستخدم").count() === 1, "لم تظهر بوابة المدير عند غياب جلسة الإدارة.");
    await page.goto(`${baseUrl}/admin-live.html`, { waitUntil: "networkidle" });
    assert(await page.getByRole("heading", { name: "دخول المدير" }).count() === 1, "لم تحجب لوحة HTML الحية حقول الإدارة عند غياب الجلسة.");
    assert(writes.length === 0, `اختبار End-to-End حاول مسار كتابة محظور: ${writes.join(", ")}`);
    assert(consoleErrors.length === 0, `ظهرت أخطاء وحدة التحكم: ${consoleErrors.join(" | ")}`);

    const authenticatedPage = await context.newPage();
    const authenticatedErrors = [];
    authenticatedPage.on("console", message => {
      if (message.type() === "error") authenticatedErrors.push(message.text());
    });
    const isolatedAdmin = { id: 910001, name: "مدير اختبار معزول", role: "admin" };
    await installIsolatedApi(authenticatedPage, writes, isolatedAdmin);
    await authenticatedPage.goto(`${baseUrl}/admin-live.html`, { waitUntil: "networkidle" });
    await authenticatedPage.getByRole("heading", { name: "إعدادات المتجر الحية" }).waitFor();
    assert(await authenticatedPage.locator("#hero-title").inputValue() === "عنوان حي معزول", "لم تُحمّل بيانات المدير التجريبية داخل لوحة HTML الحية.");
    await authenticatedPage.locator("#hero-title").fill("عنوان محفوظ ضمن عزل الاختبار");
    await authenticatedPage.getByRole("button", { name: "حفظ التغييرات الحية" }).click();
    await authenticatedPage.getByText("تم حفظ التغييرات الحية بنجاح.").waitFor();
    assert(writes.includes("store.admin.saveLiveSettings:isolated"), "لم يمر حفظ الإدارة الحية عبر اعتراض البيانات التجريبية المعزول.");
    assert(authenticatedErrors.length === 0, `ظهرت أخطاء في لوحة الإدارة الحية: ${authenticatedErrors.join(" | ")}`);

    const appearancePage = await context.newPage();
    const appearanceErrors = [];
    const appearanceFailures = [];
    appearancePage.on("console", message => { if (message.type() === "error") appearanceErrors.push(message.text()); });
    appearancePage.on("requestfailed", request => appearanceFailures.push(`${request.method()} ${request.url()}`));
    await installIsolatedApi(appearancePage, writes, isolatedAdmin);
    await appearancePage.goto(`${baseUrl}/admin/appearance`, { waitUntil: "networkidle" });
    await appearancePage.getByRole("heading", { name: "ألوان الرأس والتذييل" }).waitFor();
    const colorInputs = appearancePage.locator('input[type="color"]');
    assert(await colorInputs.count() === 4, "لم تظهر حقول التحكم اليدوي الأربعة بألوان الرأس والتذييل.");
    await colorInputs.nth(0).evaluate(input => { input.value = "#102F39"; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); });
    await appearancePage.getByRole("button", { name: "حفظ الألوان" }).click();
    await appearancePage.getByText("تم حفظ ألوان الرأس والتذييل").waitFor();
    assert(writes.includes("store.admin.saveAppearance:isolated"), "لم يمر حفظ ألوان الرأس والتذييل عبر الإجراء الإداري المعزول.");
    assert(await appearancePage.getByText("لوحات ألوان مقترحة").count() === 0, "عاد إلى لوحة الإدارة عنصر لوحات الألوان غير المطلوب.");
    assert(appearanceErrors.length === 0, `ظهرت أخطاء في صفحة ألوان المتجر: ${appearanceErrors.join(" | ")} | طلبات فاشلة: ${appearanceFailures.join(" | ")}`);
    await appearancePage.close();

    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
    const mobilePage = await mobileContext.newPage();
    await installIsolatedApi(mobilePage, writes, isolatedAdmin);
    await mobilePage.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
    for (let attempt = 0; attempt < 12 && await mobilePage.getByRole("link", { name: "منتج تجريبي 73", exact: true }).count() === 0; attempt += 1) {
      await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await mobilePage.waitForTimeout(450);
    }
    await mobilePage.getByRole("link", { name: "منتج تجريبي 73", exact: true }).waitFor({ timeout: 3000 });
    const mobileProductLinks = await mobilePage.locator('a[href^="/products/"]').evaluateAll(links => links.map(link => link.getAttribute("href")));
    const mobileProductSlugs = new Set(mobileProductLinks);
    assert(mobileProductSlugs.size === catalogEntries.length, `لم يُحمّل كتالوج الجوال كاملاً: ${mobileProductSlugs.size}/${catalogEntries.length}`);
    await mobilePage.goto(`${baseUrl}/admin-live.html`, { waitUntil: "networkidle" });
    await mobilePage.getByRole("heading", { name: "إعدادات المتجر الحية" }).waitFor();
    const mobileDimensions = await mobilePage.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    assert(mobileDimensions.scroll <= mobileDimensions.viewport, `لوحة الإدارة الحية تجاوزت عرض الجوال: ${JSON.stringify(mobileDimensions)}`);
    await mobileContext.close();

    await context.close();
    console.log(JSON.stringify({ baseUrl, isolatedCategories: categories.length, isolatedProducts: catalogEntries.length, interceptedMutations: writes, mobileDimensions, consoleErrors }, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
