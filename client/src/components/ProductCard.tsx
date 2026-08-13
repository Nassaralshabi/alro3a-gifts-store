import { useLocale } from "@/contexts/LocaleContext";
import { formatMoney } from "@/lib/format";
import type { CatalogProduct } from "@shared/store/types";
import { ArrowUpLeft, Tag } from "lucide-react";
import { Link } from "wouter";

const FALLBACK_IMAGE = "/manus-storage/social-1_e277342a.jpg";

export default function ProductCard({ product: entry }: { product: CatalogProduct }) {
  const { isArabic, locale } = useLocale();
  const product = entry.product;
  const title = isArabic ? product.titleAr : product.titleEn;
  const category = isArabic ? entry.categoryTitleAr : entry.categoryTitleEn;

  return <article className="group overflow-hidden rounded-[1.6rem] border border-[#e9e3d6] bg-white shadow-[0_12px_40px_-26px_rgba(42,32,54,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-25px_rgba(42,32,54,0.55)]">
    <Link href={`/products/${product.slug}`} className="relative block aspect-[1/1.03] overflow-hidden bg-[#f3edf6]">
      <img src={product.imageUrl ?? FALLBACK_IMAGE} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <span className="absolute inset-x-3 bottom-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#7953a2] backdrop-blur"><ArrowUpLeft className="h-3.5 w-3.5" />{isArabic ? "التفاصيل والطلب" : "Details & order"}</span>
    </Link>
    <div className="p-5"><p className="mb-1 line-clamp-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#a27ab2]">{category || (isArabic ? "مطبوعة حسب الطلب" : "Made to order")}</p><Link href={`/products/${product.slug}`} className="block line-clamp-1 font-display text-xl text-[#24233a] hover:text-[#7953a2]">{title}</Link><div className="mt-4 flex items-center justify-between gap-2">{product.price ? <strong className="text-sm text-[#7953a2]">{formatMoney(product.price, locale)}</strong> : <span className="text-xs font-bold text-[#7953a2]">{isArabic ? "السعر حسب الطلب" : "Price on request"}</span>}<span className="grid h-9 w-9 place-items-center rounded-full bg-[#24233a] text-white group-hover:bg-[#7953a2]"><Tag className="h-3.5 w-3.5" /></span></div></div>
  </article>;
}
