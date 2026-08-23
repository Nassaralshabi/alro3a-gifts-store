import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
await page.goto("http://127.0.0.1:3000/admin", { waitUntil: "networkidle" });
const layout = await page.evaluate(() => {
  const card = document.querySelector("form")?.parentElement;
  const root = document.querySelector("#root");
  const rect = card?.getBoundingClientRect();
  return {
    viewportWidth: window.innerWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    rootScrollWidth: root?.scrollWidth,
    card: rect ? { left: rect.left, right: rect.right, width: rect.width } : null,
    rootDirection: getComputedStyle(document.documentElement).direction,
  };
});
await context.close();
await browser.close();
console.log(JSON.stringify(layout, null, 2));
