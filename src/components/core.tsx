"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ================= Types ================= */
export type Lang = "ar" | "en";

export type Category = {
  id: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
};

export type Product = {
  id: number;
  categoryId: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  price: number | null;
  image: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
  sortOrder: number;
  category?: { titleAr: string; titleEn: string; slug: string };
};

export type OrderItem = {
  id: number;
  productId: number | null;
  title: string;
  image: string | null;
  price: number | null;
  qty: number;
};

export type Order = {
  id: number;
  ref: string;
  name: string;
  phone: string;
  notes: string;
  total: number | null;
  status: "new" | "confirmed" | "done";
  lang: string;
  items: OrderItem[];
  createdAt: string;
};

export type HeroSlide = {
  image: string | null;
  badgeAr: string; badgeEn: string;
  titleAr: string; titleEn: string;
  subAr: string; subEn: string;
};

export type Settings = {
  logo?: string;
  "contact.phone"?: string;
  "contact.whatsapp"?: string;
  "contact.instagram"?: string;
  "contact.address"?: { valueAr?: string | null; valueEn?: string | null };
  "site.name"?: { valueAr?: string | null; valueEn?: string | null };
  "site.tagline"?: { valueAr?: string | null; valueEn?: string | null };
  "promo.image"?: string;
  "promo.title"?: { valueAr?: string | null; valueEn?: string | null };
  "promo.body"?: { valueAr?: string | null; valueEn?: string | null };
  "hero.slides"?: { value: string };
  [k: string]: unknown;
};

export type Catalog = {
  categories: Category[];
  products: Product[];
  settings: Settings;
};

export type CartItem = { id: number; qty: number };

/* ================= i18n dictionary ================= */
const DICT = {
  tagline: { ar: "هدايا بطابعك", en: "Gifts, your way" },
  policy: { ar: "سياسة الطلب", en: "Ordering policy" },
  account: { ar: "لوحة التحكم", en: "Admin panel" },
  cart: { ar: "سلة الطلب", en: "Cart" },
  allProducts: { ar: "كل المنتجات", en: "All products" },
  searchPh: { ar: "ابحث عن منتج، قسم، أو فكرة هدية…", en: "Search products, categories, gift ideas…" },
  noResults: { ar: "لا توجد نتائج مطابقة", en: "No matching results" },
  viewAll: { ar: "عرض الكل", en: "View all" },
  onRequest: { ar: "حسب الطلب", en: "Price on request" },
  onConfirm: { ar: "السعر عند التأكيد", en: "Price on confirmation" },
  add: { ar: "أضف", en: "Add" },
  added: { ar: "أُضيف إلى السلة", en: "Added to cart" },
  pick: { ar: "مختار", en: "Pick" },
  madeToOrder: { ar: "مطبوعة حسب الطلب", en: "Made to order" },
  shopNow: { ar: "تسوق الآن", en: "Shop now" },
  benefits: [
    { t: { ar: "توصيل لجميع الإمارات", en: "UAE-wide delivery" }, d: { ar: "نجهز طلبك بعناية ونوصله", en: "Prepared with care and delivered" } },
    { t: { ar: "تصاميم حسب الطلب", en: "Made to order" }, d: { ar: "تفاصيل ومقاسات حسب الطلب", en: "Choose the details and size" } },
    { t: { ar: "جودة في كل تفصيلة", en: "Care in every detail" }, d: { ar: "مطبوعات وتغليف بعناية", en: "Thoughtful printing and wrapping" } },
  ],
  fAbout: { ar: "مطبوعات وهدايا حسب الطلب تُنفذ بعناية في عجمان وتصل إلى كل الإمارات.", en: "Made-to-order printed gifts, crafted in Ajman and delivered across the UAE." },
  fExplore: { ar: "استكشاف المتجر", en: "Explore" },
  fHelp: { ar: "خدمة الطلب", en: "Ordering help" },
  fContact: { ar: "تواصل وزيارة", en: "Contact & visit" },
  fHome: { ar: "الرئيسية", en: "Home" },
  fDeliver: { ar: "توصيل متاح لجميع الإمارات", en: "Delivery available across the UAE" },
  fRights: { ar: "مطبعة الروعة. جميع الحقوق محفوظة.", en: "Al Rawaa Printing. All rights reserved." },
  cartTitle: { ar: "سلة الطلب", en: "Request cart" },
  sendTitle: { ar: "إرسال الطلب", en: "Send request" },
  itemsSel: { ar: "قطعة مختارة", en: "item(s) selected" },
  cartEmpty: { ar: "السلة ما زالت فارغة", en: "Your cart is still empty" },
  cartEmptySub: { ar: "أضف المنتجات ثم أرسلها كطلب واحد للمطبعة.", en: "Add products, then send them as one request." },
  browse: { ar: "عرض المنتجات", en: "Browse products" },
  estTotal: { ar: "الإجمالي التقريبي", en: "Estimated total" },
  cartFootNote: { ar: "يُحفظ الطلب في قاعدة البيانات ثم يفتح واتساب لتأكيد التفاصيل.", en: "Your request is saved to the database, then WhatsApp opens to confirm details." },
  continueSend: { ar: "متابعة وإرسال الطلب", en: "Continue & send request" },
  clearCart: { ar: "إفراغ السلة", en: "Clear cart" },
  prodSummary: { ar: "ملخص المنتجات", en: "Product summary" },
  namePh: { ar: "الاسم", en: "Your name" },
  phonePh: { ar: "رقم الهاتف", en: "Phone number" },
  notesPh: { ar: "تفاصيل الطلب أو المناسبة", en: "Occasion or request details" },
  submitBtn: { ar: "حفظ الطلب وفتح واتساب", en: "Save request & open WhatsApp" },
  sending: { ar: "جارٍ الإرسال…", en: "Sending…" },
  backCart: { ar: "العودة إلى السلة", en: "Back to cart" },
  submitted: { ar: "تم حفظ طلبك بنجاح", en: "Your request was saved" },
  submitErr: { ar: "تعذر حفظ الطلب. أعد المحاولة.", en: "Could not save your request." },
  sortDef: { ar: "الترتيب الافتراضي", en: "Default order" },
  sortPriceUp: { ar: "السعر: من الأقل", en: "Price: low to high" },
  sortPriceDown: { ar: "السعر: من الأعلى", en: "Price: high to low" },
  sortName: { ar: "الاسم", en: "Name" },
  loadMore: { ar: "عرض المزيد", en: "Load more" },
  shopNoFound: { ar: "لا توجد منتجات مطابقة", en: "No matching products" },
  shopNoFoundSub: { ar: "جرّب كلمة أخرى أو قسماً مختلفاً.", en: "Try another keyword or category." },
  qty: { ar: "الكمية", en: "Quantity" },
  addToCart: { ar: "إضافة إلى السلة", en: "Add to cart" },
  waOrder: { ar: "استفسار واتساب", en: "WhatsApp enquiry" },
  related: { ar: "قد يعجبك أيضاً", en: "You may also like" },
  pdNote: { ar: "معظم منتجاتنا تُنفذ حسب الطلب؛ يُتفق على المقاس والكمية والسعر عبر واتساب قبل التنفيذ.", en: "Most products are made to order; size, quantity and final price are confirmed on WhatsApp." },
  unavailable: { ar: "غير متوفر حالياً", en: "Currently unavailable" },
  home: { ar: "الرئيسية", en: "Home" },
  contactT: { ar: "تواصل معنا", en: "Contact us" },
  contactSub: { ar: "فريق مطبعة الروعة جاهز لمساعدتك في اختيار الأنسب لمناسبتك.", en: "The Al Rawaa team is ready to help you pick what suits your occasion." },
  policyT: { ar: "كيف يتم الطلب؟", en: "How ordering works" },
  steps: [
    { t: { ar: "أضف المنتجات إلى سلة الطلب", en: "Add products to the cart" }, d: { ar: "تصفح الأقسام وأضف ما يعجبك.", en: "Browse categories and add what you like." } },
    { t: { ar: "أرسل الطلب مع اسمك ورقمك", en: "Send the request with your details" }, d: { ar: "يُحفظ الطلب في قاعدة بيانات المتجر فوراً.", en: "It is saved to the store database instantly." } },
    { t: { ar: "نؤكد التفاصيل والسعر", en: "We confirm details and price" }, d: { ar: "نتفق على المقاس والكمية والسعر النهائي.", en: "We agree on size, quantity and final price." } },
    { t: { ar: "التنفيذ والتوصيل", en: "Production & delivery" }, d: { ar: "ننفذ طلبك بعناية ونوصله لجميع الإمارات.", en: "Crafted with care and delivered across the UAE." } },
  ],
  phone: { ar: "الهاتف / واتساب", en: "Phone / WhatsApp" },
  address: { ar: "العنوان", en: "Address" },
  follow: { ar: "تابعنا على إنستغرام", en: "Follow us on Instagram" },
  waCTA: { ar: "محادثة واتساب مباشرة", en: "Chat on WhatsApp now" },
  // admin
  admPanel: { ar: "لوحة التحكم", en: "Admin panel" },
  admLogin: { ar: "تسجيل الدخول", en: "Sign in" },
  admUser: { ar: "اسم المستخدم", en: "Username" },
  admPass: { ar: "كلمة المرور", en: "Password" },
  admWrong: { ar: "بيانات الدخول غير صحيحة", en: "Invalid credentials" },
  admDash: { ar: "الرئيسية", en: "Dashboard" },
  admProducts: { ar: "المنتجات", en: "Products" },
  admCategories: { ar: "الأقسام", en: "Categories" },
  admOrders: { ar: "الطلبات", en: "Orders" },
  admSettings: { ar: "إعدادات الموقع", en: "Site settings" },
  admExit: { ar: "تسجيل الخروج", en: "Sign out" },
  admWelcome: { ar: "مرحباً بك في لوحة تحكم مطبعة الروعة", en: "Welcome to the Al Rawaa admin panel" },
  admWelcomeSub: { ar: "تحكم كامل بالمنتجات والصور والأقسام والطلبات وإعدادات الموقع.", en: "Full control of products, images, categories, orders and site settings." },
  stProducts: { ar: "منتجاً", en: "Products" },
  stCats: { ar: "أقساماً", en: "Categories" },
  stOrders: { ar: "طلبات", en: "Orders" },
  stNew: { ar: "طلبات جديدة", en: "New requests" },
  recentOrders: { ar: "أحدث الطلبات", en: "Latest requests" },
  noOrders: { ar: "لا توجد طلبات بعد — ستظهر هنا فور وصولها.", en: "No requests yet — they will appear here once received." },
  searchProd: { ar: "ابحث في المنتجات…", en: "Search products…" },
  allCats: { ar: "كل الأقسام", en: "All categories" },
  colProd: { ar: "المنتج", en: "Product" },
  colCat: { ar: "القسم", en: "Category" },
  colPrice: { ar: "السعر", en: "Price" },
  colAvail: { ar: "الإتاحة", en: "Available" },
  colActions: { ar: "إجراءات", en: "Actions" },
  edit: { ar: "تعديل", en: "Edit" },
  del: { ar: "حذف", en: "Delete" },
  newProd: { ar: "منتج جديد", en: "New product" },
  newCat: { ar: "قسم جديد", en: "New category" },
  save: { ar: "حفظ", en: "Save" },
  saved: { ar: "تم الحفظ بنجاح", en: "Saved successfully" },
  deleted: { ar: "تم الحذف", en: "Deleted" },
  confirmDel: { ar: "هل أنت متأكد من الحذف؟", en: "Confirm delete?" },
  confirmDelProducts: { ar: "هذا القسم يحتوي منتجات — سيتم حذفها جميعاً. متابعة؟", en: "This category has products — they will all be deleted. Continue?" },
  priceReq: { ar: "حسب الطلب", en: "On request" },
  orderCustomer: { ar: "العميل", en: "Customer" },
  orderDate: { ar: "التاريخ", en: "Date" },
  orderItems: { ar: "المنتجات", en: "Items" },
  orderStatus: { ar: "الحالة", en: "Status" },
  stNewL: { ar: "جديد", en: "New" },
  stConfirmL: { ar: "مؤكد", en: "Confirmed" },
  stDoneL: { ar: "مكتمل", en: "Completed" },
  viewSite: { ar: "عرض المتجر", en: "View store" },
  uploadImg: { ar: "رفع صورة", en: "Upload image" },
  uploading: { ar: "جارٍ الرفع…", en: "Uploading…" },
  uploadOk: { ar: "رُفعت الصورة", en: "Image uploaded" },
  uploadErr: { ar: "فشل رفع الصورة", en: "Upload failed" },
  setContact: { ar: "معلومات التواصل", en: "Contact info" },
  setHero: { ar: "بانرات الصفحة الرئيسية", en: "Homepage banners" },
  setSite: { ar: "هوية الموقع", en: "Site identity" },
  setPromo: { ar: "البانر الترويجي", en: "Promotional banner" },
  heroImg: { ar: "الصورة", en: "Image" },
  badge: { ar: "الشارة", en: "Badge" },
  title: { ar: "العنوان", en: "Title" },
  subtitle: { ar: "الوصف", en: "Subtitle" },
  addSlide: { ar: "إضافة شريحة", en: "Add slide" },
  slug: { ar: "المعرّف (إنجليزي)", en: "Slug" },
  nameAr: { ar: "الاسم (عربي)", en: "Name (Arabic)" },
  nameEn: { ar: "الاسم (إنجليزي)", en: "Name (English)" },
  descAr: { ar: "الوصف (عربي)", en: "Description (Arabic)" },
  descEn: { ar: "الوصف (إنجليزي)", en: "Description (English)" },
  featured: { ar: "مميز", en: "Featured" },
  priceLbl: { ar: "السعر (اتركه فارغاً = حسب الطلب)", en: "Price (empty = on request)" },
  catLbl: { ar: "القسم", en: "Category" },
  sortBy: { ar: "الترتيب", en: "Sort order" },
  logo: { ar: "الشعار", en: "Logo" },
} as const;

export type DictKey = keyof typeof DICT;
export const tr = (key: DictKey, lang: Lang): string => {
  const entry = DICT[key];
  if (typeof entry === "object" && "ar" in (entry as Record<string, string>)) {
    return (entry as { ar: string; en: string })[lang];
  }
  return String(entry);
};
export const trArr = (key: "benefits" | "steps", lang: Lang) =>
  (DICT[key] as Array<{ t: { ar: string; en: string }; d: { ar: string; en: string } }>).map((x) => ({
    t: x.t[lang],
    d: x.d[lang],
  }));

export function money(v: number | null | undefined, lang: Lang): string | null {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return null;
  const n = Number(v);
  return lang === "ar" ? `${n.toLocaleString("en-US")} د.إ` : `AED ${n.toLocaleString("en-US")}`;
}

/* ================= Contexts ================= */
type AppCtx = {
  lang: Lang;
  isAr: boolean;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
  T: (k: DictKey) => string;
  catalog: Catalog | null;
  reloadCatalog: () => Promise<void>;
  catalogLoading: boolean;
  cart: CartItem[];
  cartAdd: (id: number, qty?: number) => void;
  cartSet: (id: number, qty: number) => void;
  cartRemove: (id: number) => void;
  cartClear: () => void;
  cartCount: number;
  cartTotal: number;
  settingsVal: (key: string, field?: "value" | "valueAr" | "valueEn") => string;
  heroSlides: HeroSlide[];
  whatsapp: string;
  logo: string;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  // hydrate lang + cart from localStorage
  useEffect(() => {
    try {
      const l = localStorage.getItem("alrawaa_lang");
      if (l === "ar" || l === "en") setLangState(l);
      const c = localStorage.getItem("alrawaa_cart");
      if (c) setCart(JSON.parse(c));
    } catch { /* ignore */ }
  }, []);

  // sync lang → <html> + storage
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("alrawaa_lang", lang); } catch { /* ignore */ }
  }, [lang]);

  // sync cart → storage
  useEffect(() => {
    try { localStorage.setItem("alrawaa_cart", JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  const reloadCatalog = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog", { cache: "no-store" });
      if (res.ok) setCatalog(await res.json());
    } catch { /* ignore */ } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => { reloadCatalog(); }, [reloadCatalog]);

  const T = useCallback((k: DictKey) => tr(k, lang), [lang]);

  const settingsVal = useCallback(
    (key: string, field: "value" | "valueAr" | "valueEn" = "value"): string => {
      const s = catalog?.settings?.[key] as Record<string, unknown> | undefined;
      if (!s) return "";
      const v = s[field];
      if (field === "value" && (key === "contact.address" || key.startsWith("promo.") || key.startsWith("site."))) {
        // bilingual keys: use valueAr/valueEn by lang
        return (lang === "ar" ? (s.valueAr as string) : (s.valueEn as string)) ?? (s.value as string) ?? "";
      }
      return typeof v === "string" ? v : "";
    },
    [catalog, lang]
  );

  const heroSlides: HeroSlide[] = useMemo(() => {
    const raw = (catalog?.settings?.["hero.slides"] as { value?: string } | undefined)?.value;
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw) as HeroSlide[];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }, [catalog]);

  const whatsapp = settingsVal("contact.whatsapp") || "971521401021";
  const logo = settingsVal("logo") || "/uploads/processed-logo-al-rawhaa-png-93d69af7-40c8-4396-8959-4d4b1cc612d7_4c62e8cc.png";

  const byId = useMemo(() => new Map((catalog?.products ?? []).map((p) => [p.id, p])), [catalog]);
  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + (byId.get(i.id)?.price ?? 0) * i.qty, 0),
    [cart, byId]
  );

  const value: AppCtx = {
    lang,
    isAr: lang === "ar",
    toggleLang: () => setLangState((l) => (l === "ar" ? "en" : "ar")),
    setLang: (l) => setLangState(l),
    T,
    catalog,
    reloadCatalog,
    catalogLoading,
    cart,
    cartAdd: (id, qty = 1) =>
      setCart((c) => {
        const found = c.find((i) => i.id === id);
        if (found) return c.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
        return [...c, { id, qty }];
      }),
    cartSet: (id, qty) =>
      setCart((c) => (qty < 1 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty } : i)))),
    cartRemove: (id) => setCart((c) => c.filter((i) => i.id !== id)),
    cartClear: () => setCart([]),
    cartCount: cart.reduce((s, i) => s + i.qty, 0),
    cartTotal,
    settingsVal,
    heroSlides,
    whatsapp,
    logo,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/* ================= API client (admin) ================= */
export const api = {
  async login(username: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  },
  async logout() {
    await fetch("/api/auth/logout", { method: "POST" });
  },
  async me() {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    return d.user as { username: string; name: string } | null;
  },
  async getProducts() {
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()).products as Product[]) ?? null;
  },
  async saveProduct(data: Record<string, unknown>, id?: number) {
    const url = id ? `/api/admin/products/${id}` : "/api/admin/products";
    const res = await fetch(url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  },
  async deleteProduct(id: number) {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    return res.ok;
  },
  async getCategories() {
    const res = await fetch("/api/admin/categories", { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()).categories as Category[]) ?? null;
  },
  async saveCategory(data: Record<string, unknown>, id?: number) {
    const url = id ? `/api/admin/categories/${id}` : "/api/admin/categories";
    const res = await fetch(url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  },
  async deleteCategory(id: number, force = false) {
    const res = await fetch(`/api/admin/categories/${id}${force ? "?force=1" : ""}`, { method: "DELETE" });
    if (res.status === 409) return "not-empty" as const;
    return res.ok ? ("ok" as const) : ("error" as const);
  },
  async getOrders() {
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()).orders as Order[]) ?? null;
  },
  async updateOrder(id: number, data: { status?: string }) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  },
  async deleteOrder(id: number) {
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    return res.ok;
  },
  async getSettings() {
    const res = await fetch("/api/admin/settings", { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()).settings as Array<{ key: string; value: string; valueAr: string | null; valueEn: string | null }>) ?? null;
  },
  async saveSettings(data: Record<string, { value?: string; valueAr?: string | null; valueEn?: string | null }>) {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  },
  async createOrder(payload: { name: string; phone: string; notes: string; lang: Lang; items: CartItem[] }) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as { ok: boolean; order: { id: number; ref: string; total: number | null } };
  },
  async uploadImage(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!res.ok) return null;
    return ((await res.json()).url as string) ?? null;
  },
};

/* ================= Hash router hook ================= */
export type Route = { seg: string[]; params: Record<string, string> };

export function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, "");
  const [path, qs] = h.split("?");
  const params: Record<string, string> = {};
  if (qs)
    for (const kv of qs.split("&")) {
      const [k, v] = kv.split("=");
      if (k) params[k] = decodeURIComponent(v ?? "").replace(/\+/g, " ");
    }
  return { seg: path.split("/").filter(Boolean), params };
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>({ seg: [], params: {} });
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    onChange();
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export const go = (hash: string) => { window.location.hash = hash; };
