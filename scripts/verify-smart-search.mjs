import { chromium } from "playwright-core";

const baseUrl = process.env.SMART_SEARCH_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

async function inspectSearch({ viewport, mobile }) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  const browserErrors = [];
  page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  if (mobile) await page.getByRole("button", { name: "البحث" }).click();
  const searchInput = page.locator('input[role="combobox"]:visible');
  await searchInput.fill("بوكسات");
  await page.waitForTimeout(360);
  const suggestionList = page.getByRole("listbox");
  await suggestionList.waitFor({ state: "visible" });
  const optionCount = await page.getByRole("option").count();
  if (optionCount < 2) throw new Error(`Expected product/category suggestions, found ${optionCount}.`);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/products\//);
  const productPath = new URL(page.url()).pathname;
  await context.close();
  return { viewport, productPath, suggestionCount: optionCount, browserErrors };
}

const desktop = await inspectSearch({ viewport: { width: 1280, height: 720 }, mobile: false });
const mobile = await inspectSearch({ viewport: { width: 375, height: 812 }, mobile: true });

const categoryContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const categoryPage = await categoryContext.newPage();
await categoryPage.goto(baseUrl, { waitUntil: "networkidle" });
const categoryInput = categoryPage.locator('input[role="combobox"]:visible');
await categoryInput.fill("بوكسات");
await categoryPage.waitForTimeout(360);
await categoryPage.getByRole("option", { name: /بوكسات وتغليف.*استعرض الفئة/ }).click();
await categoryPage.waitForURL(/\/shop\?category=boxes-packaging/);
const categoryPath = `${new URL(categoryPage.url()).pathname}${new URL(categoryPage.url()).search}`;
await categoryContext.close();
await browser.close();

if (desktop.browserErrors.length || mobile.browserErrors.length) throw new Error(`Browser console errors: ${[...desktop.browserErrors, ...mobile.browserErrors].join(" | ")}`);
console.log(JSON.stringify({ desktop: { suggestionCount: desktop.suggestionCount, productPath: desktop.productPath }, mobile: { suggestionCount: mobile.suggestionCount, productPath: mobile.productPath }, categoryPath }, null, 2));
