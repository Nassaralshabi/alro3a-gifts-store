import { chromium } from "playwright-core";

const root = process.env.STATIC_SITE_ROOT || "/home/ubuntu/releases/alro3a-gifts-static-html-full";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
await page.goto(`file://${root}/index.html`, { waitUntil: "load" });
await page.waitForTimeout(260);
const storeLoaderState = await page.locator("#boot-loader").getAttribute("data-loaded");
const before = await page.locator('#hero-dots [aria-selected="true"]').getAttribute("aria-label");
await page.waitForTimeout(2800);
const after = await page.locator('#hero-dots [aria-selected="true"]').getAttribute("aria-label");
const productCount = await page.locator("#product-grid .product").count();
const firstProduct = await page.locator("#product-grid .product img").first().evaluate(image => ({ src: image.getAttribute("src"), width: image.naturalWidth }));
await page.screenshot({ path: "/home/ubuntu/screenshots/static-html-full-store.png", fullPage: false });

await page.goto(`file://${root}/admin.html`, { waitUntil: "load" });
await page.waitForTimeout(260);
const adminLoaderState = await page.locator("#boot-loader").getAttribute("data-loaded");
const adminImageCount = await page.locator("#image-grid .image-card").count();
await page.locator("#store-name").fill("مطبعة الروعة - اختبار HTML");
await page.locator("#save-brand").click();
await page.screenshot({ path: "/home/ubuntu/screenshots/static-html-full-admin.png", fullPage: false });
await page.goto(`file://${root}/index.html`, { waitUntil: "load" });
const savedBrand = await page.locator("#brand-name").textContent();

const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
const mobilePage = await mobileContext.newPage();
const mobileErrors = [];
mobilePage.on("console", message => { if (message.type() === "error") mobileErrors.push(message.text()); });
await mobilePage.goto(`file://${root}/index.html`, { waitUntil: "load" });
await mobilePage.waitForTimeout(260);
const mobileStore = await mobilePage.evaluate(() => ({
  loaderState: document.querySelector("#boot-loader")?.getAttribute("data-loaded"),
  products: document.querySelectorAll("#product-grid .product").length,
  viewportWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
}));
await mobilePage.screenshot({ path: "/home/ubuntu/screenshots/static-html-full-store-mobile.png", fullPage: false });
await mobilePage.goto(`file://${root}/admin.html`, { waitUntil: "load" });
await mobilePage.waitForTimeout(260);
const mobileAdmin = await mobilePage.evaluate(() => ({
  loaderState: document.querySelector("#boot-loader")?.getAttribute("data-loaded"),
  images: document.querySelectorAll("#image-grid .image-card").length,
  viewportWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
}));
await mobilePage.screenshot({ path: "/home/ubuntu/screenshots/static-html-full-admin-mobile.png", fullPage: false });
await mobileContext.close();
await context.close();
await browser.close();

if (before === after || storeLoaderState !== "true" || adminLoaderState !== "true" || productCount !== 262 || adminImageCount !== 262 || !firstProduct.src?.startsWith("assets/published/") || !firstProduct.width || savedBrand !== "مطبعة الروعة - اختبار HTML" || mobileStore.loaderState !== "true" || mobileStore.products !== 262 || mobileStore.scrollWidth > mobileStore.viewportWidth || mobileAdmin.loaderState !== "true" || mobileAdmin.images !== 262 || mobileAdmin.scrollWidth > mobileAdmin.viewportWidth || consoleErrors.length || mobileErrors.length) {
  throw new Error(JSON.stringify({ before, after, storeLoaderState, adminLoaderState, productCount, adminImageCount, firstProduct, savedBrand, mobileStore, mobileAdmin, consoleErrors, mobileErrors }, null, 2));
}
console.log(JSON.stringify({ sliderAdvanced: before !== after, storeLoaderState, adminLoaderState, productCount, adminImageCount, firstProduct, savedBrand, mobileStore, mobileAdmin, consoleErrors, mobileErrors }, null, 2));
