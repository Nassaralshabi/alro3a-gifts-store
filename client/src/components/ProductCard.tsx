import { useLocale } from "@/contexts/LocaleContext";
import { useRequestCart } from "@/contexts/RequestCartContext";
import { formatMoney } from "@/lib/format";
import type { CatalogProduct } from "@shared/store/types";
import { ArrowUpLeft, Heart, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

const FALLBACK_IMAGE = "/manus-storage/social-1_e277342a.jpg";

export default function ProductCard({ product: entry }: { product: CatalogProduct }) {
  const { isArabic, locale } = useLocale();
  const { addProduct } = useRequestCart();
  const product = entry.product;
  const title = isArabic ? product.titleAr : product.titleEn;
  const category = isArabic ? entry.categoryTitleAr : entry.categoryTitleEn;

  return <article className="group overflow-hidden rounded-2xl border border-[#ebe7df] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_-22px_rgba(42,32,54,0.38)]">
    <Link href={`/products/${product.slug}`} className="relative block aspect-[1/1.03] overflow-hidden bg-[#f3edf6]">
      <img src={product.imageUrl ?? FALLBACK_IMAGE} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <span className="absolute end-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#8c719c] shadow-sm"><Heart className="h-3.5 w-3.5" /></span>
    </Link>
    <div className="p-4"><p className="mb-1 line-clamp-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#a27ab2]">{category || (isArabic ? "مطبوعة حسب الطلب" : "Made to order")}</p><Link href={`/products/${product.slug}`} className="block min-h-11 line-clamp-2 text-sm font-bold leading-5 text-[#24233a] hover:text-[#7953a2]">{title}</Link><div className="mt-3 flex items-center justify-between gap-2">{product.price ? <strong className="text-sm text-[#24233a]">{formatMoney(product.price, locale)}</strong> : <span className="text-xs font-bold text-[#7953a2]">{isArabic ? "السعر حسب الطلب" : "Price on request"}</span>}<button onClick={() => addProduct(entry)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#b99cca] px-2.5 text-xs font-bold text-[#7953a2] transition hover:bg-[#7953a2] hover:text-white"><ShoppingBag className="h-3.5 w-3.5" />{isArabic ? "أضف للطلب" : "Add"}</button></div></div>
  </article>;
}
