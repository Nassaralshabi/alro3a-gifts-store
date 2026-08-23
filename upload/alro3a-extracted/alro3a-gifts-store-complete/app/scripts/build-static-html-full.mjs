import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import mysql from "mysql2/promise";

const projectRoot = "/home/ubuntu/alro3a-gifts-store";
const templateRoot = path.join(projectRoot, "static-html");
const outputRoot = "/home/ubuntu/releases/alro3a-gifts-static-html-full";
const assetRoot = path.join(outputRoot, "assets");
const publishedRoot = path.join(assetRoot, "published");
const baseAssets = "/home/ubuntu/webdev-static-assets/alro3a-static-html";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to build the published static catalogue.");

const safeName = (value) => value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
const copy = async (from, to) => { await fs.mkdir(path.dirname(to), { recursive: true }); await fs.copyFile(from, to); };
await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(publishedRoot, { recursive: true });
for (const name of ["index.html", "admin.html", "admin.js", "README.md", "ASSET_MANIFEST.md"]) await copy(path.join(templateRoot, name), path.join(outputRoot, name));
for (const name of await fs.readdir(baseAssets)) await copy(path.join(baseAssets, name), path.join(assetRoot, name));

const connection = await mysql.createConnection(databaseUrl);
const [products] = await connection.execute("SELECT id, slug, titleAr, imageUrl FROM products WHERE isAvailable = TRUE AND imageUrl IS NOT NULL ORDER BY sortOrder, id");
await connection.end();
const imageMap = new Map();
const failures = [];
const withConcurrency = async (items, limit, worker) => { let index = 0; await Promise.all(Array.from({ length: limit }, async () => { while (index < items.length) { const current = items[index++]; await worker(current); } })); };
const urls = [...new Set(products.map(product => product.imageUrl))];
await withConcurrency(urls, 8, async (imageUrl) => {
  const fileBase = safeName(path.basename(new URL(imageUrl, "http://localhost").pathname));
  const key = crypto.createHash("sha1").update(imageUrl).digest("hex").slice(0, 10);
  const relative = `assets/published/${key}-${fileBase}`;
  try {
    const response = await fetch(`http://127.0.0.1:3000${imageUrl}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await fs.writeFile(path.join(outputRoot, relative), Buffer.from(await response.arrayBuffer()));
    imageMap.set(imageUrl, relative);
  } catch (error) { failures.push({ imageUrl, error: String(error) }); }
});
const catalogProducts = products.filter(product => imageMap.has(product.imageUrl)).map(product => ({ id: Number(product.id), slug: product.slug, title: product.titleAr, image: imageMap.get(product.imageUrl) }));
const assets = [...new Set(catalogProducts.map(product => product.image))];
const data = { generatedAt: new Date().toISOString(), products: catalogProducts, assets, defaults: { storeName: "مطبعة الروعة للهدايا", whatsapp: "https://wa.me/971521401021", heroBadge: "اليوم الوطني الإماراتي", heroTitle: "هدايا اليوم الوطني بطابع إماراتي", heroSubtitle: "أطقم وهدايا مميزة للاحتفال بفخر الإمارات." }, failures };
await fs.writeFile(path.join(outputRoot, "store-data.js"), `window.RAWAA_CATALOG = ${JSON.stringify(data)};\n`);
await fs.writeFile(path.join(outputRoot, "published-assets-manifest.json"), JSON.stringify(data, null, 2));
console.log(JSON.stringify({ products: products.length, downloaded: assets.length, failures: failures.length, outputRoot }, null, 2));
process.exit(0);
