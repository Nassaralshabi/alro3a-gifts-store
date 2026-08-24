import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const DEFAULT_PREVIEW_BASE = "https://3000-i58cnep6q8ttrwnafmdzp-1b69fec6.us3.manus.computer";
const outputDir = path.resolve("reports");
const outputPath = path.join(outputDir, "legacy-image-brand-audit.json");
const limitArg = Number.parseInt(process.argv.find((value) => value.startsWith("--limit="))?.split("=")[1] ?? "0", 10);
const safeLimit = Number.isInteger(limitArg) && limitArg > 0 ? Math.min(limitArg, 500) : 0;
const previewBase = (process.env.WEBDEV_PREVIEW_BASE_URL ?? DEFAULT_PREVIEW_BASE).replace(/\/$/, "");

if (!process.env.DATABASE_URL || !process.env.OPENAI_API_BASE || !process.env.OPENAI_API_KEY) {
  throw new Error("DATABASE_URL وOPENAI_API_BASE وOPENAI_API_KEY مطلوبة لتشغيل جرد الصور.");
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute(
  `SELECT p.id, p.slug, p.titleAr, p.imageUrl, c.slug AS categorySlug
   FROM products p
   LEFT JOIN categories c ON c.id = p.categoryId
   WHERE (p.slug LIKE '%weej%' OR p.imageUrl LIKE '%weej%')
     AND p.imageUrl IS NOT NULL
     AND p.isAvailable = 1
   ORDER BY p.sortOrder ASC, p.id ASC${safeLimit > 0 ? ` LIMIT ${safeLimit}` : ""}`,
);

const assessmentProperties = {
  id: { type: "integer" },
  visible_weej_brand: { type: "boolean" },
  visible_alrawhaa_brand: { type: "boolean" },
  needs_semantic_edit: { type: "boolean" },
  confidence: { type: "integer", minimum: 0, maximum: 100 },
  evidence: { type: "string" },
  action: { type: "string", enum: ["edit", "keep", "manual_review"] },
};

const schema = {
  name: "legacy_brand_assessment_batch",
  strict: true,
  schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: assessmentProperties,
          required: ["id", "visible_weej_brand", "visible_alrawhaa_brand", "needs_semantic_edit", "confidence", "evidence", "action"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  },
};

async function assessBatch(rowsToAssess) {
  const itemsWithUrls = rowsToAssess.map((row) => ({
    ...row,
    publicImageUrl: row.imageUrl.startsWith("http") ? row.imageUrl : `${previewBase}${row.imageUrl}`,
  }));
  const labels = itemsWithUrls.map((row, index) => `${index + 1}. id=${row.id}; category=${row.categorySlug}; title=${row.titleAr}`).join("\n");
  const response = await fetch(`${process.env.OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      max_completion_tokens: 256,
      response_format: { type: "json_schema", json_schema: schema },
      messages: [
        {
          role: "system",
          content: "You are a careful ecommerce brand-audit visual inspector. Return only the requested JSON.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Inspect every product image listed below. Return one assessment per exact id. Flag semantic editing only when visible printed branding explicitly says Weej or ويج, or clearly uses the old Weej logo. Do not flag generic mockup text, unbranded product patterns, or visible Al Rawhaa branding. A product needs semantic editing only if a customer can see the old brand. Keep evidence concise in Arabic.\n\n${labels}`,
            },
            ...itemsWithUrls.map((row) => ({ type: "image_url", image_url: { url: row.publicImageUrl, detail: "low" } })),
          ],
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`فشل فحص ${row.id}: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  const rawContent = payload.choices?.[0]?.message?.content ?? "";
  const firstBrace = rawContent.indexOf("{");
  const lastBrace = rawContent.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new Error(`مخرج رؤية غير منظم: ${rawContent.slice(0, 180) || "فارغ"}`);
  }
  const parsed = JSON.parse(rawContent.slice(firstBrace, lastBrace + 1));
  const byId = new Map(parsed.items.map((item) => [item.id, item]));
  return itemsWithUrls.map(({ publicImageUrl, ...row }) => ({
    ...row,
    publicImageUrl,
    assessment: byId.get(row.id) ?? { action: "manual_review", error: "لم يُعد النموذج نتيجة لهذا المنتج." },
  }));
}

const imagesPerRequest = 8;
const requestConcurrency = 2;
const results = [];
for (let index = 0; index < rows.length; index += imagesPerRequest * requestConcurrency) {
  const groups = Array.from({ length: requestConcurrency }, (_, groupIndex) => rows.slice(index + groupIndex * imagesPerRequest, index + (groupIndex + 1) * imagesPerRequest)).filter((group) => group.length > 0);
  const groupResults = await Promise.all(groups.map(async (group) => {
    try {
      return await assessBatch(group);
    } catch (error) {
      return group.map((row) => ({ ...row, assessment: { action: "manual_review", error: error instanceof Error ? error.message : String(error) } }));
    }
  }));
  results.push(...groupResults.flat());
  console.log(`فُحصت ${Math.min(index + imagesPerRequest * requestConcurrency, rows.length)} من ${rows.length} صورة.`);
}

const summary = {
  inspected: results.length,
  edit: results.filter((entry) => entry.assessment.action === "edit").length,
  keep: results.filter((entry) => entry.assessment.action === "keep").length,
  manualReview: results.filter((entry) => entry.assessment.action === "manual_review").length,
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), previewBase, summary, results }, null, 2)}\n`, "utf8");
await connection.end();
console.log(JSON.stringify({ outputPath, summary }, null, 2));
