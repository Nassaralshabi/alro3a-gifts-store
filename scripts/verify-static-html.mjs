import { chromium } from "playwright-core";

const siteRoot = process.env.STATIC_SITE_ROOT || "/home/ubuntu/releases/alro3a-gifts-static-html";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const reports = [];
for (const device of [{ name: "desktop", viewport: { width: 1280, height: 720 }, isMobile: false }, { name: "mobile", viewport: { width: 375, height: 812 }, isMobile: true }]) {
  const context = await browser.newContext({ viewport: device.viewport, isMobile: device.isMobile, hasTouch: device.isMobile });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto(`file://${siteRoot}/index.html`, { waitUntil: "load" });
  const before = await page.locator('#hero-dots [aria-selected="true"]').getAttribute("aria-label");
  await page.waitForTimeout(2800);
  const after = await page.locator('#hero-dots [aria-selected="true"]').getAttribute("aria-label");
  await page.screenshot({ path: `/home/ubuntu/screenshots/static-html-${device.name}.png`, fullPage: false });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const images = await page.locator("img").evaluateAll(nodes => nodes.map(node => ({ src: node.getAttribute("src"), complete: node.complete, naturalWidth: node.naturalWidth })));
  reports.push({ device: device.name, before, after, imageCount: images.length, localAssets: images.every(image => image.src?.startsWith("assets/")), validImages: images.every(image => image.complete && image.naturalWidth > 0), consoleErrors });
  await context.close();
}
await browser.close();

if (reports.some(report => report.before === report.after || !report.validImages || report.consoleErrors.length || !report.localAssets)) {
  throw new Error(JSON.stringify(reports, null, 2));
}

console.log(JSON.stringify(reports, null, 2));
