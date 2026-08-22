import { chromium } from "playwright-core";

const baseUrl = process.env.HERO_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const reports = [];

for (const device of [{ name: "desktop", viewport: { width: 1280, height: 720 }, isMobile: false }, { name: "mobile", viewport: { width: 375, height: 812 }, isMobile: true }]) {
  const context = await browser.newContext({ viewport: device.viewport, isMobile: device.isMobile, hasTouch: device.isMobile });
  const page = await context.newPage();
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const activeBefore = await page.locator('[role="tab"][aria-selected="true"]').getAttribute("aria-label");
  await page.waitForTimeout(5600);
  const activeAfter = await page.locator('[role="tab"][aria-selected="true"]').getAttribute("aria-label");
  const heroResources = await page.evaluate(() => performance.getEntriesByType("resource").map(entry => ({ name: entry.name, transferSize: entry.transferSize })).filter(entry => /banner|hero/i.test(entry.name)));
  reports.push({ device: device.name, activeBefore, activeAfter, automaticallyAdvanced: activeBefore !== activeAfter, heroResources, consoleErrors: errors });
  await context.close();
}

await browser.close();
if (reports.some(report => !report.automaticallyAdvanced || report.consoleErrors.length)) throw new Error(JSON.stringify(reports, null, 2));
console.log(JSON.stringify(reports, null, 2));
