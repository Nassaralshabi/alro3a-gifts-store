import { chromium } from "playwright-core";

const baseUrl = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const browserPath = process.env.E2E_CHROMIUM_PATH || "/usr/bin/chromium";

const categories = [{ id: 910001, slug: "promotional-gifts", titleAr: "هدايا إعلانية", titleEn: "Promotional Gifts", icon: "Gift" }];
const product = { id: 910001, categoryId: 910001, slug: "isolated-gift-box", titleAr: "منتج تجريبي معزول", titleEn: "Isolated Test Gift", descriptionAr: "منتج داخل اختبار المتصفح فقط.", descriptionEn: "Browser-only test product.", price: "42.00", imageUrl: "/manus-storage/alrawhaa-logo_cfae3a03.webp", isFeatured: true, isAvailable: true, sortOrder: 1 };
const catalogEntries = Array.from({ length: 73 }, (_, index) => {
  const number = index + 1;
  return { product: { ...product, id: 910000 + number, slug: `isolated-gift-${number}`, titleAr: number === 1 ? product.titleAr : `منتج تجريبي ${number}`, titleEn: `Isolated Test Product ${number}` }, categorySlug: "promotional-gifts", categoryTitleAr: "هدايا إعلانية", categoryTitleEn: "Promotional Gifts" };
});
const contact = { phone: "0500000000", whatsappUrl: "https://wa.me/971500000000", whatsappDefaultMessageAr: "رسالة اختبار", whatsappDefaultMessageEn: "Test message", addressAr: "عنوان اختبار معزول", addressEn: "Isolated test address", instagram: "alrawhaa.test" };

const assert = (condition, message) => { if (!condition) throw new Error(message); };

function responseFor(procedure, input = {}) {
  if (procedure === "store.catalog.categories") return categories;
  if (procedure === "store.catalog.contact") return contact;
  if (procedure === "store.catalog.homeContent") return { heroImages: [product.imageUrl] };
  if (procedure === "store.catalog.productsPage") {
    const cursor = typeof input.cursor === "number" ? input.cursor : 0;
    const limit = typeof input.limit === "number" ? input.limit : 24;
    return { items: catalogEntries.slice(cursor, cursor + limit), total: catalogEntries.length, nextCursor: cursor + limit < catalogEntries.length ? cursor + limit : null };
  }
  if (procedure === "store.catalog.productBySlug") return { product };
  return null;
}

async function installIsolatedApi(page, writes) {
  await page.route("**/api/trpc/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    const procedure = decodeURIComponent(url.pathname.replace("/api/trpc/", ""));
    if (request.method() !== "GET") {
      writes.push(procedure);
      await route.abort();
      return;
    }
    const rawInput = JSON.parse(url.searchParams.get("input") || "{}");
    const input = rawInput.json || rawInput["0"]?.json || {};
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ result: { data: { json: responseFor(procedure, input) } } }) });
  });
}

const browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  const writes = [];
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await installIsolatedApi(page, writes);
  await page.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "كل المنتجات" }).waitFor();
  await page.getByRole("button", { name: /منتج تجريبي معزول/ }).waitFor();
  await page.getByRole("button", { name: "هدايا إعلانية", exact: true }).click();
  await page.getByRole("heading", { name: "هدايا إعلانية" }).waitFor();
  const search = page.getByPlaceholder("ابحث عن هدية أو مطبوعة…");
  await search.fill("تجريبي");
  await search.press("Enter");
  await page.getByRole("button", { name: /منتج تجريبي معزول/ }).waitFor();
  assert(writes.length === 0, `اختبار العزل حاول الكتابة: ${writes.join(", ")}`);
  assert(consoleErrors.length === 0, `ظهرت أخطاء المتصفح: ${consoleErrors.join(" | ")}`);

  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const mobilePage = await mobileContext.newPage();
  await installIsolatedApi(mobilePage, writes);
  await mobilePage.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  await mobilePage.locator("[data-product]").first().waitFor();
  const firstBatch = await mobilePage.locator("[data-product]").count();
  assert(firstBatch === 9, `دفعة الهاتف الأولى ليست تسعة منتجات: ${firstBatch}`);
  for (let attempt = 0; attempt < 16 && await mobilePage.locator("[data-product]").count() < catalogEntries.length; attempt += 1) {
    await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await mobilePage.waitForTimeout(360);
  }
  const productCount = await mobilePage.locator("[data-product]").count();
  const dimensions = await mobilePage.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert(productCount === catalogEntries.length, `لم يصل تمرير الهاتف إلى آخر منتج: ${productCount}/${catalogEntries.length}`);
  assert(dimensions.scrollWidth <= dimensions.width, `ظهر تمرير أفقي في الهاتف: ${JSON.stringify(dimensions)}`);
  await mobileContext.close();
  await context.close();
  console.log(JSON.stringify({ isolatedCategories: categories.length, isolatedProducts: productCount, firstBatch, interceptedWrites: writes, consoleErrors }, null, 2));
} finally {
  await browser.close();
}
