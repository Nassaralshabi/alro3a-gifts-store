import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AddToCart from "./AddToCart";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://alrawaa.example.com";
const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23eef1f3'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.35em' fill='%23a6b0b6' font-family='sans-serif' font-size='24'%3EAl Rawaa%3C/text%3E%3C/svg%3E";

/** SSG: pre-render all products at build time. */
export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { category: { select: { slug: true, titleAr: true, titleEn: true } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "منتج غير موجود | مطبعة الروعة" };
  const title = `${p.titleAr} | مطبعة الروعة`;
  const desc = (p.descAr || `${p.titleAr} — مطبوعات وهدايا حسب الطلب من مطبعة الروعة، توصيل لجميع الإمارات.`).slice(0, 160);
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE}/product/${p.slug}` },
    openGraph: {
      title,
      description: desc,
      type: "website",
      siteName: "مطبعة الروعة — Al Rawaa Printing",
      images: p.image ? [{ url: p.image, width: 900, height: 900, alt: p.titleAr }] : undefined,
    },
    twitter: { card: "summary", title, description: desc },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p || !p.isAvailable === undefined) notFound();
  if (!p) notFound();

  const related = p
    ? await db.product.findMany({
        where: { categoryId: p.categoryId, id: { not: p.id }, isAvailable: true },
        take: 4,
        orderBy: { sortOrder: "asc" },
      })
    : [];

  const priceText = p.price ? `${p.price.toLocaleString("en-US")} د.إ` : "السعر حسب الطلب";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.titleAr,
    alternateName: p.titleEn,
    description: p.descAr || p.titleAr,
    image: p.image ? `${SITE}${p.image}` : undefined,
    category: p.category.titleAr,
    brand: { "@type": "Brand", name: "مطبعة الروعة" },
    offers: {
      "@type": "Offer",
      priceCurrency: "AED",
      ...(p.price ? { price: p.price } : { priceSpecification: { "@type": "PriceSpecification", priceCurrency: "AED", valueAddedTaxIncluded: false } }),
      availability: p.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE}/product/${p.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-white text-[#33393e]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* header */}
      <header className="border-b border-[#e4e7e9] bg-white sticky top-0 z-40">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between min-h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/uploads/processed-logo-al-rawhaa-png-93d69af7-40c8-4396-8959-4d4b1cc612d7_4c62e8cc.png" alt="شعار مطبعة الروعة" width={44} height={44} className="rounded-xl object-cover" />
            <div className="leading-tight">
              <b className="block text-lg">مطبعة الروعة</b>
              <span className="block text-[9px] font-extrabold tracking-[.14em] uppercase text-[#6a757d]">هدايا بطابعك</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-br from-[#45505a] to-[#5d6a74] text-white text-[13px] font-extrabold">الدخول إلى المتجر</Link>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] text-[#6c767d] pt-6">
          <Link href="/" className="hover:text-[#33393e]">الرئيسية</Link>
          <span>›</span>
          <Link href={`/shop?cat=${p.category.slug}`} className="hover:text-[#33393e]">{p.category.titleAr}</Link>
          <span>›</span>
          <span className="text-[#454f57] font-bold">{p.titleAr}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 py-8">
          <div className="relative rounded-3xl border border-[#e1e5e8] overflow-hidden bg-[#f0f2f3] aspect-square self-start">
            <Image
              src={p.image ?? FALLBACK}
              alt={p.titleAr}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <p className="text-[11px] font-extrabold tracking-[.12em] uppercase text-[#5c6870]">{p.category.titleAr}</p>
            <h1 className="mt-2.5 text-2xl sm:text-4xl leading-snug font-bold">{p.titleAr}</h1>
            <p className="mt-1 text-[13px] text-[#8a949b]" dir="ltr">{p.titleEn}</p>
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              <span className="text-3xl font-bold">{priceText}</span>
              {p.isFeatured && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-br from-[#e8912d] to-[#f2bd66] text-[#17323b] rounded-full px-3 py-1.5 text-[10px] font-black">مختار</span>
              )}
            </div>
            {p.descAr && <p className="mt-5 text-sm leading-loose text-[#566169] border-t border-dashed border-[#e4e7e9] pt-5">{p.descAr}</p>}
            <AddToCart productId={p.id} isAvailable={p.isAvailable} lang="ar" />
            <div className="flex gap-2.5 items-start bg-[#f4f6f7] rounded-xl p-4 text-[12px] leading-relaxed text-[#727c83] mt-6">
              <span className="text-[#45505a] font-black">ℹ</span>
              <span>معظم منتجاتنا تُنفذ حسب الطلب؛ يُتفق على المقاس والكمية والسعر عبر واتساب قبل التنفيذ. توصيل لجميع الإمارات.</span>
            </div>
            <a href="https://wa.me/971521401021" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-[13px] font-extrabold text-[#45505a] hover:underline">استفسار سريع عبر واتساب ←</a>
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <section className="py-8 pb-14">
            <h2 className="text-xl mb-5">قد يعجبك أيضاً</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/product/${r.slug}`} className="group bg-white border border-[#e1e5e8] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[#ccd3d7] transition-all">
                  <div className="relative aspect-square bg-[#f0f2f3]">
                    <Image src={r.image ?? FALLBACK} alt={r.titleAr} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                  </div>
                  <div className="p-3.5">
                    <p className="text-[13px] font-extrabold line-clamp-2 leading-relaxed">{r.titleAr}</p>
                    <p className="text-[13px] font-extrabold text-[#33393e] mt-2">{r.price ? `${r.price.toLocaleString("en-US")} د.إ` : "حسب الطلب"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
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
