import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const outputDir = process.env.ASSET_EXPORT_DIR || path.resolve("../alro3a-gifts-store-complete/assets/media");
const siteOrigin = process.env.ASSET_EXPORT_ORIGIN || "https://alro3agift-v6dgouz7.manus.space";
const concurrency = 6;

function toSourceUrl(value) {
  return value.startsWith("/") ? `${siteOrigin}${value}` : value;
}

async function getStorageFallbackUrl(sourceUrl) {
  const pathname = new URL(toSourceUrl(sourceUrl)).pathname;
  const match = /^\/manus-storage\/(.+)$/.exec(pathname);
  if (!match || !process.env.BUILT_IN_FORGE_API_URL || !process.env.BUILT_IN_FORGE_API_KEY) return null;
  const presignUrl = new URL("v1/storage/presign/get", `${process.env.BUILT_IN_FORGE_API_URL.replace(/\/+$/, "")}/`);
  presignUrl.searchParams.set("path", match[1]);
  const response = await fetch(presignUrl, { headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` } });
  if (!response.ok) return null;
  const payload = await response.json();
  return typeof payload?.url === "string" ? payload.url : null;
}

async function downloadAsset(sourceUrl) {
  const primary = await fetch(toSourceUrl(sourceUrl));
  if (primary.ok) return primary;
  const fallbackUrl = await getStorageFallbackUrl(sourceUrl);
  if (!fallbackUrl) throw new Error(`HTTP ${primary.status}`);
  const fallback = await fetch(fallbackUrl);
  if (!fallback.ok) throw new Error(`Fallback HTTP ${fallback.status}`);
  return fallback;
}

function safeName(value, fallbackIndex) {
  const pathname = new URL(toSourceUrl(value)).pathname;
  const original = path.basename(pathname).replace(/[^a-zA-Z0-9._-]+/g, "-");
  return `${String(fallbackIndex).padStart(3, "0")}-${original || "asset"}`;
}

function collectUrls(rows) {
  const urls = new Set();
  for (const row of rows) {
    for (const value of [row.valueAr, row.valueEn]) {
      if (!value) continue;
      for (const match of value.matchAll(/(?:https?:\/\/[^\s"']+|\/manus-storage\/[^\s"']+)/g)) urls.add(match[0]);
    }
  }
  return urls;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to export the catalog assets.");
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [products] = await connection.query("SELECT slug, imageUrl FROM products WHERE imageUrl IS NOT NULL AND imageUrl <> '' ORDER BY id");
  const [content] = await connection.query("SELECT contentKey, valueAr, valueEn FROM siteContent");
  await connection.end();

  const productEntries = products.map(row => ({ sourceUrl: row.imageUrl, productSlug: row.slug, source: "product" }));
  const contentEntries = [...collectUrls(content)].map(sourceUrl => ({ sourceUrl, productSlug: null, source: "site-content" }));
  const seen = new Set();
  const entries = [...productEntries, ...contentEntries].filter(entry => {
    const key = `${entry.source}:${entry.sourceUrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  await mkdir(outputDir, { recursive: true });
  const manifest = [];
  const failures = [];
  let cursor = 0;

  async function worker() {
    while (cursor < entries.length) {
      const index = cursor++;
      const entry = entries[index];
      const filename = safeName(entry.sourceUrl, index + 1);
      try {
        const response = await downloadAsset(entry.sourceUrl);
        const bytes = Buffer.from(await response.arrayBuffer());
        await writeFile(path.join(outputDir, filename), bytes);
        manifest.push({ ...entry, sourceUrl: toSourceUrl(entry.sourceUrl), relativePath: `assets/media/${filename}`, bytes: bytes.length });
        process.stdout.write(`✓ ${index + 1}/${entries.length} ${filename}\n`);
      } catch (error) {
        failures.push({ ...entry, sourceUrl: toSourceUrl(entry.sourceUrl), error: error instanceof Error ? error.message : String(error) });
        process.stderr.write(`✗ ${index + 1}/${entries.length} ${entry.sourceUrl}\n`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  manifest.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  await writeFile(path.resolve(outputDir, "..", "asset-manifest.json"), `${JSON.stringify({ exportedAt: new Date().toISOString(), siteOrigin, assets: manifest, failures }, null, 2)}\n`);
  console.log(JSON.stringify({ requested: entries.length, downloaded: manifest.length, failed: failures.length, outputDir }, null, 2));
  if (failures.length) process.exitCode = 2;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
