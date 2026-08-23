import { useLocale } from "@/contexts/LocaleContext";
import { useRequestCart } from "@/contexts/RequestCartContext";
import { formatMoney } from "@/lib/format";
import type { CatalogProduct } from "@shared/store/types";
import { ArrowUpLeft, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "wouter";

const FALLBACK_IMAGE = "/manus-storage/social-1_e277342a.jpg";

export default function ProductCard({ product: entry }: { product: CatalogProduct }) {
  const { isArabic, locale } = useLocale();
  const { addProduct } = useRequestCart();
  const product = entry.product;
  const title = isArabic ? product.titleAr : product.titleEn;
  const category = isArabic ? entry.categoryTitleAr : entry.categoryTitleEn;

  return <article className="group relative overflow-hidden rounded-[1.15rem] border border-[#dce9eb] bg-white shadow-[0_18px_34px_-30px_rgba(13,56,66,.9)] transition duration-300 hover:-translate-y-1 hover:border-[#9fcbd0] hover:shadow-[0_24px_38px_-28px_rgba(13,56,66,.48)]"><Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-[#eef5f5]"><img src={product.imageUrl ?? FALLBACK_IMAGE} alt={title} width={640} height={640} loading="lazy" decoding="async" fetchPriority="low" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]" /><span className="absolute end-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/95 text-[#2a7580] shadow-sm"><Heart className="h-3.5 w-3.5" /></span>{product.isFeatured ? <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#17323b]/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"><Sparkles className="h-3 w-3 text-[#f2bd66]" />{isArabic ? "مختار" : "Pick"}</span> : null}<span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#102f39]/35 to-transparent" /></Link><div className="p-3.5 sm:p-4"><p className="mb-1.5 line-clamp-1 text-[10px] font-black tracking-[0.08em] text-[#207783]">{category || (isArabic ? "مطبوعة حسب الطلب" : "Made to order")}</p><Link href={`/products/${product.slug}`} className="block min-h-11 line-clamp-2 text-sm font-extrabold leading-5 text-[#18333b] transition hover:text-[#12616c]">{title}</Link><div className="mt-3 flex items-center justify-between gap-2 border-t border-[#edf2f3] pt-3">{product.price ? <strong className="text-sm font-extrabold text-[#18333b]">{formatMoney(product.price, locale)}</strong> : <span className="text-xs font-bold text-[#2a7580]">{isArabic ? "حسب الطلب" : "Price on request"}</span>}<button onClick={() => addProduct(entry)} className="inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-full bg-[#e7f3f4] px-2.5 text-xs font-extrabold text-[#12616c] transition hover:bg-[#16717d] hover:text-white"><ShoppingBag className="h-3.5 w-3.5" /><span className="hidden sm:inline">{isArabic ? "أضف" : "Add"}</span><ArrowUpLeft className="h-3 w-3" /></button></div></div><span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-[#16717d] via-[#6ab4bb] to-[#f2bd66] opacity-0 transition-opacity duration-300 group-hover:opacity-100" /></article>;
}
