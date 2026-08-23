import { chromium } from "playwright-core";

const baseUrl = process.env.CATALOG_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
const browserErrors = [];
page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });

await page.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
const productCards = page.locator("article");
await productCards.first().waitFor({ state: "visible" });
const initialCount = await productCards.count();
await page.getByText("تابع التمرير لاستعراض جميع الصور والمنتجات").waitFor({ state: "visible" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForFunction(count => document.querySelectorAll("article").length > count, initialCount, { timeout: 10000 });
const loadedCount = await productCards.count();
await page.screenshot({ path: "/home/ubuntu/screenshots/mobile-catalog-auto-load.png", fullPage: true });
await context.close();
await browser.close();

if (browserErrors.length) throw new Error(`Browser console errors: ${browserErrors.join(" | ")}`);
console.log(JSON.stringify({ initialCount, loadedCount, automaticallyLoaded: loadedCount > initialCount }, null, 2));
