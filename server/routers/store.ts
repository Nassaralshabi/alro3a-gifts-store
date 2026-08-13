import { TRPCError } from "@trpc/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import * as db from "../db";
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
    products: publicProcedure.input(z.object({ categorySlug: z.string().min(2).optional(), featuredOnly: z.boolean().optional() }).optional()).query(async ({ input }) => {
      const products = await db.listPublicProducts(input?.categorySlug);
      return input?.featuredOnly ? products.filter(row => row.product.isFeatured) : products;
    }),
    productBySlug: publicProcedure.input(z.object({ slug: z.string().min(2) })).query(async ({ input }) => {
      const product = await db.getProductBySlug(input.slug);
      if (!product || !product.product.isAvailable) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),
  }),
  orders: router({
    create: publicProcedure.input(z.object({ productId: z.number().int().positive().nullable().optional(), customerName: z.string().trim().min(2).max(160), customerPhone: z.string().trim().min(7).max(32), quantity: z.number().int().min(1).max(999).default(1), notes: z.string().trim().max(5000).nullable().optional(), language: languageSchema })).mutation(({ input }) => db.createOrder(input)),
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
  }),
});
