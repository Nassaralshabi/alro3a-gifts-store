import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const outputPath = process.env.CATALOG_EXPORT_PATH || path.resolve("../alro3a-gifts-store-complete/data/catalog-content.json");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to export catalog content.");
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [categories] = await connection.query("SELECT id, slug, titleAr, titleEn, descriptionAr, descriptionEn, icon, sortOrder, isActive FROM categories ORDER BY sortOrder, id");
  const [products] = await connection.query("SELECT id, categoryId, slug, titleAr, titleEn, descriptionAr, descriptionEn, price, imageUrl, isFeatured, isAvailable, sortOrder FROM products ORDER BY sortOrder, id");
  const [siteContent] = await connection.query("SELECT contentKey, valueAr, valueEn FROM siteContent ORDER BY contentKey");
  await connection.end();
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify({ exportedAt: new Date().toISOString(), categories, products, siteContent }, null, 2)}\n`);
  console.log(JSON.stringify({ categories: categories.length, products: products.length, siteContent: siteContent.length, outputPath }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
