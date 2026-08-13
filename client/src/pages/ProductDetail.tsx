import OrderForm from "@/components/OrderForm";
import StoreShell from "@/components/StoreShell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { formatMoney } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { ArrowRight } from "lucide-react";
import { Link, useRoute } from "wouter";

const FALLBACK_IMAGE = "/manus-storage/social-1_e277342a.jpg";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:handle");
  const handle = params?.handle ?? "";
  const { data: record, isLoading, error, refetch } = trpc.store.catalog.productBySlug.useQuery(
    { slug: handle },
    { enabled: Boolean(handle), staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
  );
  const { isArabic, locale, direction } = useLocale();

  if (isLoading) return <StoreShell><section aria-busy="true" className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:py-16"><div><div className="mb-5 h-5 w-32 animate-pulse rounded bg-[#f0eaf5]" /><div className="aspect-square animate-pulse rounded-[2rem] bg-[#f0eaf5]" /></div><div className="self-center"><div className="h-4 w-28 animate-pulse rounded bg-[#f0eaf5]" /><div className="mt-4 h-14 max-w-lg animate-pulse rounded bg-[#f0eaf5]" /><div className="mt-6 h-5 w-24 animate-pulse rounded bg-[#f0eaf5]" /><div className="mt-6 space-y-3"><div className="h-4 max-w-xl animate-pulse rounded bg-[#f0eaf5]" /><div className="h-4 max-w-lg animate-pulse rounded bg-[#f0eaf5]" /><div className="h-4 max-w-md animate-pulse rounded bg-[#f0eaf5]" /></div><div className="mt-8 h-32 animate-pulse rounded-xl bg-[#f0eaf5]" /></div></section></StoreShell>;
  if (error) return <StoreShell><div role="alert" className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-5 text-center"><div><h1 className="font-display text-3xl">{isArabic ? "تعذر تحميل المنتج" : "This product could not be loaded"}</h1><p className="mt-3 text-sm leading-7 text-[#766f69]">{isArabic ? "تحققي من الاتصال وحاولي مرة أخرى." : "Check your connection and try again."}</p><div className="mt-5 flex justify-center gap-3"><Button onClick={() => refetch()} variant="outline" className="rounded-xl border-[#cdbbd6]">{isArabic ? "إعادة المحاولة" : "Retry"}</Button><Button asChild className="rounded-xl bg-[#7953a2]"><Link href="/shop">{isArabic ? "العودة للمتجر" : "Back to shop"}</Link></Button></div></div></div></StoreShell>;
  if (!record) return <StoreShell><div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-5 text-center"><div><h1 className="font-display text-3xl">{isArabic ? "لم نجد هذا المنتج" : "We couldn't find this product"}</h1><Button asChild className="mt-5 rounded-xl bg-[#7953a2]"><Link href="/shop">{isArabic ? "العودة للمتجر" : "Back to shop"}</Link></Button></div></div></StoreShell>;

  const product = record.product;
  const title = isArabic ? product.titleAr : product.titleEn;
  const description = isArabic ? product.descriptionAr : product.descriptionEn;
  return <StoreShell><section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:py-16"><div><Link href="/shop" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#7953a2]"><ArrowRight className={`h-4 w-4 ${direction === "ltr" ? "rotate-180" : ""}`} />{isArabic ? "العودة إلى المتجر" : "Back to shop"}</Link><div className="overflow-hidden rounded-[2rem] bg-[#f0eaf5]"><img src={product.imageUrl ?? FALLBACK_IMAGE} alt={title} width={960} height={960} decoding="async" fetchPriority="high" className="aspect-square h-full w-full object-cover" /></div></div><div className="self-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#a27ab2]">{isArabic ? record.categoryTitleAr : record.categoryTitleEn}</p><h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{title}</h1>{product.price ? <strong className="mt-5 block text-2xl text-[#7953a2]">{formatMoney(product.price, locale)}</strong> : <span className="mt-5 block text-sm font-bold text-[#7953a2]">{isArabic ? "السعر حسب التفاصيل المطلوبة" : "Pricing depends on your requested details"}</span>}<p className="mt-6 whitespace-pre-line text-sm leading-8 text-[#6d6561]">{description || (isArabic ? "منتج مميز يمكن تخصيصه وفق تفاصيل مناسبتك." : "A signature piece that can be customised around your occasion.")}</p><div className="mt-8"><OrderForm product={product} /></div></div></section></StoreShell>;
}
