import { chromium } from "playwright-core";

const baseUrl = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const browserPath = process.env.E2E_CHROMIUM_PATH || "/usr/bin/chromium";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "كل المنتجات" }).waitFor();

  for (let attempt = 0; attempt < 28; attempt += 1) {
    const hasMore = await page.getByRole("button", { name: /عرض المزيد/ }).count() > 0;
    if (!hasMore) break;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  }

  const links = await page.locator('a[href^="/products/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("href")).filter(Boolean));
  const productSlugs = new Set(links);
  const remainingButtonCount = await page.getByRole("button", { name: /عرض المزيد/ }).count();
  const viewport = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));

  assert(remainingButtonCount === 0, "ظل كتالوج الجوال متوقفاً قبل الوصول إلى آخر صفحة.");
  assert(productSlugs.size > 24, `لم يتجاوز كتالوج الجوال الدفعة الأولى: ${productSlugs.size} منتجاً.`);
  assert(productSlugs.size * 2 === links.length, "تكررت روابط المنتجات بصورة غير متوقعة عند التحميل المتدرج.");
  assert(viewport.scrollWidth <= viewport.width, `ظهر تمرير أفقي في كتالوج الجوال: ${JSON.stringify(viewport)}`);
  assert(consoleErrors.length === 0, `ظهرت أخطاء متصفح: ${consoleErrors.join(" | ")}`);
  console.log(JSON.stringify({ products: productSlugs.size, remainingButtonCount, viewport, consoleErrors }, null, 2));
  await context.close();
} finally {
  await browser.close();
}
