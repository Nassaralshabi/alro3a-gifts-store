import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://alrawaa.example.com";
const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23eef1f3'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: "كل المنتجات | مطبعة الروعة — هدايا ومطبوعات حسب الطلب",
  description: "تصفح 262 منتجاً من مطبوعات وهدايا وتغليف حسب الطلب — أكياس ورقية، بوكسات، ستيكرات، مطبوعات مناسبات. توصيل لجميع الإمارات.",
  alternates: { canonical: `${SITE}/shop` },
  openGraph: { title: "متجر مطبعة الروعة", description: "مطبوعات وهدايا حسب الطلب — توصيل لجميع الإمارات", type: "website" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const [categories, products] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.product.findMany({
      where: { isAvailable: true, ...(cat ? { category: { slug: cat } } : {}) },
      orderBy: { sortOrder: "asc" },
      include: { category: { select: { titleAr: true } } },
    }),
  ]);
  const active = categories.find((c) => c.slug === cat);

  return (
    <div className="min-h-screen bg-white text-[#33393e]">
      <header className="border-b border-[#e4e7e9] bg-white sticky top-0 z-40">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between min-h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/uploads/processed-logo-al-rawhaa-png-93d69af7-40c8-4396-8959-4d4b1cc612d7_4c62e8cc.png" alt="شعار مطبعة الروعة" width={44} height={44} className="rounded-xl object-cover" />
            <b className="text-lg">مطبعة الروعة</b>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-br from-[#45505a] to-[#5d6a74] text-white text-[13px] font-extrabold">الدخول إلى المتجر</Link>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 sm:px-6">
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] text-[#6c767d] pt-6">
          <Link href="/" className="hover:text-[#33393e]">الرئيسية</Link>
          <span>›</span>
          <span className="text-[#454f57] font-bold">{active ? active.titleAr : "كل المنتجات"}</span>
        </nav>
        <h1 className="mt-3 text-2xl sm:text-3xl">{active ? active.titleAr : "كل المنتجات"}</h1>
        <p className="text-[13px] text-[#727c83] mt-2">{active ? active.descAr : "مطبوعات وهدايا حسب الطلب — توصيل لجميع الإمارات."}</p>

        {/* category chips (real links → crawlable) */}
        <div className="flex flex-wrap gap-2 mt-6">
          <Link href="/shop" className={`chip-style ${!cat ? "chip-on" : ""}`}>الكل</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/shop?cat=${c.slug}`} className={`chip-style ${cat === c.slug ? "chip-on" : ""}`}>{c.titleAr}</Link>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
          {products.map((p) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="group bg-white border border-[#e1e5e8] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[#ccd3d7] hover:shadow-lg transition-all">
              <div className="relative aspect-square bg-[#f0f2f3]">
                <Image src={p.image ?? FALLBACK} alt={p.titleAr} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-[1.05] transition-transform duration-500" />
              </div>
              <div className="p-3.5">
                <p className="text-[10px] font-black tracking-wider text-[#5c6870]">{p.category.titleAr}</p>
                <p className="text-[13px] font-extrabold line-clamp-2 leading-relaxed mt-1">{p.titleAr}</p>
                <p className="text-[13px] font-extrabold text-[#33393e] mt-2">{p.price ? `${p.price.toLocaleString("en-US")} د.إ` : "حسب الطلب"}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="mt-6 bg-gradient-to-b from-[#23282d] to-[#181d21] text-[#a7b1b8] relative">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-l from-[#45505a] via-[#8a959c] to-[#f2bd66]" />
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-[12px]">
          <p>© {new Date().getFullYear()} مطبعة الروعة — عجمان، الإمارات العربية المتحدة</p>
          <p className="text-[#f2bd66] font-bold" dir="ltr">0521401021</p>
        </div>
      </footer>
    </div>
  );
}
