import { TRPCError } from "@trpc/server";
import { unzipSync } from "fflate";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import * as db from "../db";
import { notifyOwner } from "../_core/notification";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

const languageSchema = z.enum(["ar", "en"]);
const categoryInput = z.object({
  id: z.number().int().positive().optional(),
  slug: z.string().trim().min(2).max(96).regex(/^[a-z0-9-]+$/),
  titleAr: z.string().trim().min(2).max(160),
  titleEn: z.string().trim().min(2).max(160),
  descriptionAr: z.string().max(5000).nullable().optional(),
  descriptionEn: z.string().max(5000).nullable().optional(),
  icon: z.string().trim().min(2).max(64).default("Sparkles"),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
});
const productInput = z.object({
  id: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  slug: z.string().trim().min(2).max(128).regex(/^[a-z0-9-]+$/),
  titleAr: z.string().trim().min(2).max(180),
  titleEn: z.string().trim().min(2).max(180),
  descriptionAr: z.string().max(5000).nullable().optional(),
  descriptionEn: z.string().max(5000).nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
  imageUrl: z.string().max(2048).refine(value => value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Image URL must be a storage path or an absolute URL.").nullable().optional(),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});
const imageUploadInput = z.object({ dataUrl: z.string().min(32).max(6_000_000), fileName: z.string().trim().min(1).max(160).optional() });
const archiveUploadInput = z.object({ dataUrl: z.string().min(64).max(80_000_000), fileName: z.string().trim().min(1).max(180).optional(), previewOnly: z.boolean().default(false) });
const supportedArchiveImages = new Map([
  ["png", { mimeType: "image/png", extension: "png" }],
  ["jpg", { mimeType: "image/jpeg", extension: "jpg" }],
  ["jpeg", { mimeType: "image/jpeg", extension: "jpg" }],
  ["webp", { mimeType: "image/webp", extension: "webp" }],
  ["gif", { mimeType: "image/gif", extension: "gif" }],
]);

export function normalizeArchiveSlug(value: string) {
  return value.trim().toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[_\s]+/g, "-").replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function normalizeArabicKey(value: string) {
  return value.normalize("NFKC").replace(/\.[a-z0-9]+$/i, "").replace(/[—–-]/g, "-").replace(/[_\s]+/g, " ").replace(/\s+/g, " ").trim();
}

function decodeArchiveName(value: string) {
  return /[ÃÂØÙ]/.test(value) ? Buffer.from(value, "latin1").toString("utf8") : value;
}

function archiveArabicKey(entryName: string) {
  const parts = decodeArchiveName(entryName).split("/");
  const fileName = parts.pop() || entryName;
  const folder = parts.pop() || "";
  const index = fileName.match(/(\d+)(?:\.[a-z0-9]+)$/i)?.[1];
  return index ? `${normalizeArabicKey(folder)}-${Number(index)}` : "";
}

function decodeArchive(dataUrl: string) {
  const match = /^data:application\/(?:zip|x-zip-compressed);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Only ZIP archives are accepted." });
  const data = Buffer.from(match[1], "base64");
  if (data.byteLength > 50 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "ZIP archive must not exceed 50 MB." });
  try {
    return unzipSync(data);
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The ZIP archive could not be opened." });
  }
}

export function decodeImage(dataUrl: string) {
  const match = /^data:(image\/(?:png|jpe?g|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Only PNG, JPEG, WEBP and GIF images are accepted." });
  const mimeType = match[1];
  const data = Buffer.from(match[2], "base64");
  if (data.byteLength > 4 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Image must not exceed 4 MB." });
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
  return { data, mimeType, extension };
}

export const storeRouter = router({
  catalog: router({
    categories: publicProcedure.query(() => db.listPublicCategories()),
    contact: publicProcedure.query(() => db.getPublicContactInfo()),
    homeContent: publicProcedure.query(() => db.getPublicHomeContent()),
    homeCatalog: publicProcedure.query(() => db.getHomeCatalog()),
    products: publicProcedure.input(z.object({ categorySlug: z.string().min(2).optional(), featuredOnly: z.boolean().optional(), limit: z.number().int().positive().max(100).optional() }).optional()).query(({ input }) => db.listPublicProducts(input?.categorySlug, input?.featuredOnly, input?.limit)),
    productsPage: publicProcedure.input(z.object({ categorySlug: z.string().min(2).optional(), query: z.string().trim().min(1).max(120).optional(), priceOrder: z.enum(["default", "asc", "desc"]).optional(), cursor: z.number().int().min(0).optional(), limit: z.number().int().min(1).max(24).optional() })).query(({ input }) => db.getPublicProductsPage(input)),
    suggestions: publicProcedure.input(z.object({ query: z.string().trim().min(2).max(80) })).query(({ input }) => db.getPublicSearchSuggestions(input.query)),
    productBySlug: publicProcedure.input(z.object({ slug: z.string().min(2) })).query(async ({ input }) => {
      const product = await db.getProductBySlug(input.slug);
      if (!product || !product.product.isAvailable) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),
  }),
  orders: router({
    create: publicProcedure.input(z.object({ productId: z.number().int().positive().nullable().optional(), customerName: z.string().trim().min(2).max(160), customerPhone: z.string().trim().min(7).max(32), quantity: z.number().int().min(1).max(999).default(1), notes: z.string().trim().max(5000).nullable().optional(), language: languageSchema })).mutation(async ({ input }) => {
      const order = await db.createOrder(input);
      const productName = order.productTitle || (input.language === "ar" ? "طلب مخصص" : "Custom request");
      const content = [
        `العميل: ${order.customerName}`,
        `الهاتف: ${order.customerPhone}`,
        `المنتج: ${productName}`,
        `الكمية: ${order.quantity}`,
        order.notes ? `ملاحظات: ${order.notes}` : null,
      ].filter(Boolean).join("\n");

      try {
        await notifyOwner({ title: `طلب جديد #${order.id}`, content });
      } catch (error) {
        console.warn("[Orders] Owner notification failed after order creation:", error);
      }

      return order;
    }),
  }),
  admin: router({
    dashboard: adminProcedure.query(() => db.getDashboardStats()),
    categories: adminProcedure.query(() => db.listAllCategories()),
    saveCategory: adminProcedure.input(categoryInput).mutation(({ input }) => db.saveCategory(input)),
    products: adminProcedure.query(() => db.listAdminProducts()),
    saveProduct: adminProcedure.input(productInput).mutation(({ input }) => db.saveProduct(input)),
    orders: adminProcedure.query(() => db.listOrders()),
    updateOrderStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "contacted", "confirmed", "completed", "cancelled"]) })).mutation(({ input }) => db.updateOrderStatus(input.id, input.status)),
    content: adminProcedure.query(() => db.listContent()),
    saveContent: adminProcedure.input(z.object({ contentKey: z.string().trim().min(2).max(96), valueAr: z.string().max(5000).nullable().optional(), valueEn: z.string().max(5000).nullable().optional() })).mutation(({ input }) => db.saveContent(input)),
    uploadImage: adminProcedure.input(imageUploadInput).mutation(async ({ input, ctx }) => {
      const image = decodeImage(input.dataUrl);
      const baseName = (input.fileName || "image").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "image";
      return storagePut(`store-media/${ctx.user.id}/${baseName}-${randomUUID()}.${image.extension}`, image.data, image.mimeType);
    }),
    importImageArchive: adminProcedure.input(archiveUploadInput).mutation(async ({ input, ctx }) => {
      const archive = decodeArchive(input.dataUrl);
      const products = await db.listAdminProducts();
      const productBySlug = new Map(products.map(entry => [entry.product.slug, entry.product]));
      const productByArabicKey = new Map<string, typeof products[number]["product"]>();
      for (const entry of products) {
        const match = entry.product.titleAr.match(/^(.+?)\s*[—–-]\s*نموذج\s*(\d+)$/);
        if (match) productByArabicKey.set(`${normalizeArabicKey(match[1])}-${Number(match[2])}`, entry.product);
      }
      const matched: Array<{ fileName: string; slug: string; productId: number; imageUrl: string }> = [];
      const unmatched: string[] = [];
      const invalid: string[] = [];
      const duplicateSlugs = new Set<string>();
      const seenSlugs = new Set<string>();
      let imageCount = 0;
      let totalBytes = 0;
      for (const [entryName, bytes] of Object.entries(archive)) {
        const decodedEntryName = decodeArchiveName(entryName);
        if (decodedEntryName.endsWith("/") || decodedEntryName.startsWith("__MACOSX/")) continue;
        if (++imageCount > 300) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "The archive may contain at most 300 files." });
        totalBytes += bytes.byteLength;
        if (bytes.byteLength > 4 * 1024 * 1024 || totalBytes > 100 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Extracted images exceed the 100 MB safety limit." });
        const fileName = decodedEntryName.split("/").pop() || decodedEntryName;
        const extension = fileName.split(".").pop()?.toLowerCase() || "";
        const image = supportedArchiveImages.get(extension);
        if (!image) { invalid.push(fileName); continue; }
        const slug = normalizeArchiveSlug(fileName);
        const product = productBySlug.get(slug) || productByArabicKey.get(archiveArabicKey(entryName));
        if (!product) { unmatched.push(fileName); continue; }
        const productSlug = product.slug;
        if (seenSlugs.has(productSlug)) { duplicateSlugs.add(productSlug); continue; }
        seenSlugs.add(productSlug);
        let imageUrl = "";
        if (!input.previewOnly) {
          const stored = await storagePut(`store-media/${ctx.user.id}/bulk-${productSlug}-${randomUUID()}.${image.extension}`, Buffer.from(bytes), image.mimeType);
          await db.updateProductImageBySlug(productSlug, stored.url);
          imageUrl = stored.url;
        }
        matched.push({ fileName, slug: productSlug, productId: product.id, imageUrl });
      }
      return { fileName: input.fileName || "archive.zip", previewOnly: input.previewOnly, totalEntries: imageCount, matched, unmatched, invalid, duplicateSlugs: Array.from(duplicateSlugs) };
    }),
  }),
});
