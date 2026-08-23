import { readFileSync, writeFileSync } from "node:fs";

const basePath = "/home/ubuntu/webdev-static-assets/alrawhaa_ultimate_collection";
const mapPath = `${basePath}/product-image-map.tsv`;
const uploadsPath = `${basePath}/uploaded-product-images.txt`;
const outputPath = `${basePath}/weej-products-import.sql`;

const categoryMap = {
  "أوراق مراسلات": { id: 2, english: "Letterhead" },
  "اكريلك ستاندات ولوحات": { id: 5, english: "Acrylic Stand & Board" },
  "اكياس ورقية": { id: 30001, english: "Paper Bag" },
  "التغليف وملحقاته": { id: 3, english: "Packaging Accessory" },
  "بطاقات": { id: 2, english: "Card" },
  "بكجات و عروض": { id: 3, english: "Gift Package" },
  "بنرات ولوحات": { id: 5, english: "Banner & Board" },
  "بوكسات": { id: 3, english: "Gift Box" },
  "تاقات": { id: 60001, english: "Tag" },
  "تصميم": { id: 4, english: "Design Service" },
  "تصميمات  جاهزة": { id: 4, english: "Ready Design" },
  "ستيكر رول ( ورقي - بلاستيك )": { id: 60001, english: "Sticker Roll" },
  "ستيكرات": { id: 60001, english: "Sticker" },
  "ستيكرات شيت ورقي": { id: 60001, english: "Sticker Sheet" },
  "طباعة اكواب": { id: 1, english: "Printed Mug" },
  "مطبوعات  العيد": { id: 2, english: "Eid Print" },
  "مطبوعات التخرج": { id: 2, english: "Graduation Print" },
  "مطبوعات المناسبات": { id: 2, english: "Occasion Print" },
  "مطبوعات اليوم الوطني": { id: 2, english: "National Day Print" },
  "مطبوعات رمضان": { id: 2, english: "Ramadan Print" },
  "مطبوعات ورقية": { id: 4, english: "Paper Print" },
  "مطبوعات يوم التأسيس": { id: 2, english: "Founding Day Print" },
  "مفكرات ودفاتر": { id: 4, english: "Notebook & Planner" },
  "منتجات جاهزة": { id: 1, english: "Ready Product" },
};

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const rows = readFileSync(mapPath, "utf8").trim().split("\n").slice(1).map(line => {
  const [sequence, category, source, stagedFile] = line.split("\t");
  return { sequence: Number(sequence), category, source, stagedFile };
});
const uploadedPaths = readFileSync(uploadsPath, "utf8").match(/Storage Path: (\/manus-storage\/[^\s]+)/g)?.map(line => line.replace("Storage Path: ", "")) ?? [];
const imageUrls = ["/manus-storage/weej-product-001_483fc188.jpg", ...uploadedPaths];

if (rows.length !== 231) throw new Error(`Expected 231 product images, found ${rows.length}.`);
if (uploadedPaths.length !== 230) throw new Error(`Expected 230 uploaded storage paths, found ${uploadedPaths.length}.`);
if (imageUrls.length !== rows.length) throw new Error("The image mapping does not match the staged product count.");

const categoryCounters = new Map();
const values = rows.map((row, index) => {
  const mappedCategory = categoryMap[row.category];
  if (!mappedCategory) throw new Error(`No category mapping exists for: ${row.category}`);
  const categoryIndex = (categoryCounters.get(row.category) ?? 0) + 1;
  categoryCounters.set(row.category, categoryIndex);
  const titleAr = `${row.category} — نموذج ${String(categoryIndex).padStart(2, "0")}`;
  const titleEn = `${mappedCategory.english} — Design ${String(categoryIndex).padStart(2, "0")}`;
  const slug = `weej-import-${String(row.sequence).padStart(3, "0")}`;
  return `(${mappedCategory.id}, ${sql(slug)}, ${sql(titleAr)}, ${sql(titleEn)}, NULL, NULL, NULL, ${sql(imageUrls[index])}, 0, 1, ${row.sequence})`;
});

const output = `-- Generated from alrawhaa_ultimate_collection.zip.\n-- The archive provided images but no verified product titles, descriptions, or prices.\nINSERT IGNORE INTO products (categoryId, slug, titleAr, titleEn, descriptionAr, descriptionEn, price, imageUrl, isFeatured, isAvailable, sortOrder) VALUES\n${values.join(",\n")};\n`;
writeFileSync(outputPath, output, "utf8");
console.log(`Generated ${rows.length} import rows at ${outputPath}`);
