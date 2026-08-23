import { execFileSync } from "node:child_process";
import mysql from "mysql2/promise";

const archivePath = "/home/ubuntu/projects/project-afa6d974/alrawhaa_all_236_final.zip";
const imagePattern = /\.(?:jpe?g|png|webp)$/i;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to audit image mappings.");

const archiveEntries = execFileSync("unzip", ["-Z1", archivePath], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter(entry => imagePattern.test(entry));

const bannerFiles = archiveEntries.filter(entry => entry.startsWith("products/Banners_Homepage/"));
const productFiles = archiveEntries.filter(entry => entry.startsWith("products/") && !entry.startsWith("products/Banners_Homepage/"));
const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [productRows] = await connection.query("SELECT slug, titleAr, imageUrl FROM products WHERE slug LIKE 'weej-import-%'");
  const [heroRows] = await connection.query("SELECT contentKey, valueAr FROM siteContent WHERE contentKey LIKE 'home_hero_image_%' ORDER BY contentKey");
  const productByTitle = new Map(productRows.map(row => [row.titleAr, row]));
  const unmatchedProducts = [];
  const matchedProducts = [];

  for (const sourceFile of productFiles) {
    const [, category, filename] = sourceFile.split("/");
    const match = filename.match(/_(\d+)\.[^.]+$/);
    const designNumber = match ? Number(match[1]) : NaN;
    const expectedTitle = Number.isFinite(designNumber) ? `${category} — نموذج ${String(designNumber).padStart(2, "0")}` : null;
    const product = expectedTitle ? productByTitle.get(expectedTitle) : undefined;
    if (product?.imageUrl) {
      matchedProducts.push({ sourceFile, slug: product.slug, imageUrl: product.imageUrl });
    } else {
      unmatchedProducts.push({ sourceFile, expectedTitle, reason: product ? "missing-image-url" : "no-matching-product" });
    }
  }

  const expectedHeroStems = bannerFiles.map(file => file.split("/").at(-1)?.replace(/\.[^.]+$/, ""));
  const matchedBanners = heroRows.filter(row => expectedHeroStems.some(stem => stem && row.valueAr?.includes(stem)));
  const unmatchedBanners = bannerFiles.filter(file => {
    const stem = file.split("/").at(-1)?.replace(/\.[^.]+$/, "");
    return !heroRows.some(row => stem && row.valueAr?.includes(stem));
  });

  console.log(JSON.stringify({
    archive: { totalImages: archiveEntries.length, productImages: productFiles.length, bannerImages: bannerFiles.length },
    products: { matched: matchedProducts.length, unmatched: unmatchedProducts },
    banners: { matched: matchedBanners.length, unmatched: unmatchedBanners, mappings: matchedBanners },
    pass: unmatchedProducts.length === 0 && unmatchedBanners.length === 0,
  }, null, 2));
} finally {
  connection.destroy();
}
