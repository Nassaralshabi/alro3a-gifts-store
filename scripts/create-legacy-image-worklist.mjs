import fs from "node:fs/promises";
import path from "node:path";

const auditPath = path.resolve("reports/legacy-image-brand-audit.json");
const outputPath = path.resolve("reports/legacy-image-worklist.json");
const requestedBatchSize = Number.parseInt(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? "5", 10);
const limit = Number.isInteger(requestedBatchSize) && requestedBatchSize > 0 ? Math.min(requestedBatchSize, 10) : 5;
const processedIds = new Set([
  150007, 150008, 150010, 150011, 150012, 150013, 150016, 150018, 150020,
  150028, 150030, 150037, 150039, 150044, 150045, 150056, 150060, 150062,
]);

const audit = JSON.parse(await fs.readFile(auditPath, "utf8"));
const worklist = audit.results
  .filter((entry) => entry.assessment?.action === "edit" && !processedIds.has(entry.id))
  .slice(0, limit)
  .map(({ id, slug, titleAr, categorySlug, imageUrl, publicImageUrl, assessment }) => ({
    id,
    slug,
    titleAr,
    categorySlug,
    imageUrl,
    publicImageUrl,
    evidence: assessment.evidence,
  }));

await fs.writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), count: worklist.length, items: worklist }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, count: worklist.length, ids: worklist.map((entry) => entry.id) }, null, 2));
