import { chromium } from "playwright-core";

const baseUrl = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const browserPath = process.env.E2E_CHROMIUM_PATH || "/usr/bin/chromium";
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  await page.locator("[data-product]").first().waitFor();
  const firstBatch = await page.locator("[data-product]").count();
  assert(firstBatch === 9, `دفعة الهاتف الأولى يجب أن تكون 9 منتجات، وظهرت ${firstBatch}.`);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForFunction(() => document.querySelectorAll("[data-product]").length > 9, null, { timeout: 5000 });
  const secondBatch = await page.locator("[data-product]").count();
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert(secondBatch === 18, `دفعة التمرير الثانية يجب أن تضيف 9 منتجات، وظهر ${secondBatch}.`);
  assert(dimensions.scrollWidth <= dimensions.width, `ظهر تمرير أفقي في الهاتف: ${JSON.stringify(dimensions)}`);
  assert(consoleErrors.length === 0, `ظهرت أخطاء في المتصفح: ${consoleErrors.join(" | ")}`);
  console.log(JSON.stringify({ firstBatch, secondBatch, dimensions, consoleErrors }, null, 2));
  await context.close();
} finally {
  await browser.close();
}
