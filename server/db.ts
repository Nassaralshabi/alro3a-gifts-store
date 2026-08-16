import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  adminCredentials,
  categories,
  type Category,
  type InsertUser,
  orders,
  products,
  siteContent,
  type User,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db;
}

const LOCAL_ADMIN_OPEN_ID = "local-admin-console";
const DEFAULT_LOCAL_ADMIN_USERNAME = "admin";
const DEFAULT_LOCAL_ADMIN_PASSWORD = "admin";

function hashLocalPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function verifyLocalPassword(password: string, encoded: string) {
  const [algorithm, salt, stored] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !stored) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(stored, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export async function ensureLocalAdmin() {
  const db = await requireDb();
  let credential = (await db.select().from(adminCredentials).limit(1))[0];
  if (!credential) {
    const passwordHash = hashLocalPassword(DEFAULT_LOCAL_ADMIN_PASSWORD);
    const created = await db.insert(adminCredentials).values({ username: DEFAULT_LOCAL_ADMIN_USERNAME, passwordHash });
    credential = (await db.select().from(adminCredentials).where(eq(adminCredentials.id, Number(created[0].insertId))).limit(1))[0]!;
  }
  await db.insert(users).values({ openId: LOCAL_ADMIN_OPEN_ID, name: credential.username, loginMethod: "local", role: "admin", lastSignedIn: new Date() }).onDuplicateKeyUpdate({ set: { name: credential.username, loginMethod: "local", role: "admin", lastSignedIn: new Date() } });
  return credential;
}

export async function verifyLocalAdmin(username: string, password: string) {
  const credential = await ensureLocalAdmin();
  if (credential.username !== username || !verifyLocalPassword(password, credential.passwordHash)) return null;
  const user = await getUserByOpenId(LOCAL_ADMIN_OPEN_ID);
  if (!user) throw new Error("Local admin user was not created");
  return { user, username: credential.username };
}

export async function getLocalAdminProfile() {
  const credential = await ensureLocalAdmin();
  return { username: credential.username };
}

export async function updateLocalAdminCredentials(input: { currentPassword: string; username: string; password: string }) {
  const credential = await ensureLocalAdmin();
  if (!verifyLocalPassword(input.currentPassword, credential.passwordHash)) return false;
  const db = await requireDb();
  await db.update(adminCredentials).set({ username: input.username, passwordHash: hashLocalPassword(input.password) }).where(eq(adminCredentials.id, credential.id));
  await db.update(users).set({ name: input.username, lastSignedIn: new Date() }).where(eq(users.openId, LOCAL_ADMIN_OPEN_ID));
  return true;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();
  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await requireDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listPublicCategories() {
  const db = await requireDb();
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder), asc(categories.titleAr));
}

export async function listAllCategories() {
  const db = await requireDb();
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.titleAr));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const db = await requireDb();
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export type CategorySave = Pick<Category, "slug" | "titleAr" | "titleEn" | "icon" | "sortOrder" | "isActive"> & {
  descriptionAr?: string | null;
  descriptionEn?: string | null;
};

export async function saveCategory(input: CategorySave & { id?: number }) {
  const db = await requireDb();
  const values = {
    slug: input.slug,
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    descriptionAr: input.descriptionAr ?? null,
    descriptionEn: input.descriptionEn ?? null,
    icon: input.icon,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
  if (input.id) {
    await db.update(categories).set(values).where(eq(categories.id, input.id));
    return (await db.select().from(categories).where(eq(categories.id, input.id)).limit(1))[0];
  }
  await db.insert(categories).values(values);
  return (await db.select().from(categories).where(eq(categories.slug, input.slug)).limit(1))[0];
}

export async function listPublicProducts(categorySlug?: string, featuredOnly = false, limit?: number) {
  const db = await requireDb();
  const base = db
    .select({ product: products, categorySlug: categories.slug, categoryTitleAr: categories.titleAr, categoryTitleEn: categories.titleEn })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id));
  const filters = [eq(products.isAvailable, true)];
  if (categorySlug) filters.push(eq(categories.slug, categorySlug));
  if (featuredOnly) filters.push(eq(products.isFeatured, true));
  const query = base.where(and(...filters)).orderBy(desc(products.isFeatured), asc(products.sortOrder), desc(products.createdAt));
  return limit ? query.limit(limit) : query;
}

export async function listAdminProducts() {
  const db = await requireDb();
  return db
    .select({ product: products, categorySlug: categories.slug, categoryTitleAr: categories.titleAr, categoryTitleEn: categories.titleEn })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
}

export async function getProductBySlug(slug: string) {
  const db = await requireDb();
  const rows = await db
    .select({ product: products, categorySlug: categories.slug, categoryTitleAr: categories.titleAr, categoryTitleEn: categories.titleEn })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  return rows[0];
}

export async function getProductById(id: number) {
  const db = await requireDb();
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function updateProductImageBySlug(slug: string, imageUrl: string) {
  const db = await requireDb();
  const result = await db.update(products).set({ imageUrl }).where(eq(products.slug, slug));
  return result[0]?.affectedRows === 1;
}

export type ProductSave = {
  id?: number;
  categoryId?: number | null;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
  sortOrder: number;
};

export async function saveProduct(input: ProductSave) {
  const db = await requireDb();
  const values = {
    categoryId: input.categoryId ?? null,
    slug: input.slug,
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    descriptionAr: input.descriptionAr ?? null,
    descriptionEn: input.descriptionEn ?? null,
    price: input.price ?? null,
    imageUrl: input.imageUrl ?? null,
    isFeatured: input.isFeatured,
    isAvailable: input.isAvailable,
    sortOrder: input.sortOrder,
  };
  if (input.id) {
    await db.update(products).set(values).where(eq(products.id, input.id));
    return (await db.select().from(products).where(eq(products.id, input.id)).limit(1))[0];
  }
  await db.insert(products).values(values);
  return (await db.select().from(products).where(eq(products.slug, input.slug)).limit(1))[0];
}

export async function createOrder(input: { productId?: number | null; customerName: string; customerPhone: string; quantity: number; notes?: string | null; language: "ar" | "en" }) {
  const db = await requireDb();
  const product = input.productId ? await getProductById(input.productId) : undefined;
  const orderValues = {
    productId: product?.id ?? null,
    productTitle: product ? (input.language === "ar" ? product.titleAr : product.titleEn) : null,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    quantity: input.quantity,
    requestedPrice: product?.price ?? null,
    notes: input.notes ?? null,
    language: input.language,
  } as const;
  const result = await db.insert(orders).values(orderValues);
  const id = Number(result[0].insertId);
  return (await db.select().from(orders).where(eq(orders.id, id)).limit(1))[0];
}

export async function listOrders() {
  const db = await requireDb();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: "new" | "contacted" | "confirmed" | "completed" | "cancelled") {
  const db = await requireDb();
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  return (await db.select().from(orders).where(eq(orders.id, id)).limit(1))[0];
}

export async function getDashboardStats() {
  const [allProducts, allOrders, allCategories] = await Promise.all([listAdminProducts(), listOrders(), listAllCategories()]);
  return {
    products: allProducts.length,
    orders: allOrders.length,
    newOrders: allOrders.filter(order => order.status === "new").length,
    categories: allCategories.length,
  };
}

export async function listContent() {
  const db = await requireDb();
  return db.select().from(siteContent).orderBy(asc(siteContent.contentKey));
}

export async function getPublicContactInfo() {
  const content = await listContent();
  const value = Object.fromEntries(content.map(item => [item.contentKey, item.valueAr || item.valueEn || ""]));
  const phone = value.contact_phone || "0521401021";
  const whatsappNumber = value.contact_whatsapp || "971521401021";
  const instagram = value.contact_instagram || "alro3a.gifts";
  return {
    phone,
    whatsappUrl: `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`,
    addressAr: value.contact_address_ar || "عجمان، الروضة 3",
    addressEn: value.contact_address_en || "Al Rawda 3, Ajman",
    instagram,
    instagramUrl: `https://www.instagram.com/${instagram.replace(/^@/, "")}/`,
  };
}

export async function getPublicHomeContent() {
  const content = await listContent();
  const value = Object.fromEntries(content.map(item => [item.contentKey, item.valueAr || item.valueEn || ""]));
  return {
    logoImage: value.brand_logo_image || null,
    heroImage: value.home_hero_image || null,
    promoImage: value.home_promo_image || null,
    heroTitleAr: value.home_hero_title_ar || null,
    heroTitleEn: value.home_hero_title_en || null,
    heroSubtitleAr: value.home_hero_subtitle_ar || null,
    heroSubtitleEn: value.home_hero_subtitle_en || null,
  };
}

export async function saveContent(input: { contentKey: string; valueAr?: string | null; valueEn?: string | null }) {
  const db = await requireDb();
  await db.insert(siteContent).values(input).onDuplicateKeyUpdate({ set: { valueAr: input.valueAr ?? null, valueEn: input.valueEn ?? null } });
  return (await db.select().from(siteContent).where(eq(siteContent.contentKey, input.contentKey)).limit(1))[0];
}
