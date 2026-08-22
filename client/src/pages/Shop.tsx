import ProductCard from "@/components/ProductCard";
import StoreShell from "@/components/StoreShell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useIsMobile } from "@/hooks/useMobile";
import { getCatalogUrlFilters, type PriceOrder } from "@/lib/catalogFilters";
import { shouldAutoLoadMobileCatalogPage } from "@/lib/mobileInfiniteBrowse";
import { trpc } from "@/lib/trpc";
import { ArrowDownUp, Check, Filter, MessageCircleMore, PackageOpen, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

const catalogQueryOptions = { staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000, refetchOnWindowFocus: false };

export default function Shop() {
  const { isArabic } = useLocale();
  const contact = useContactInfo();
  const isMobile = useIsMobile();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const urlFilters = useMemo(() => getCatalogUrlFilters(typeof window === "undefined" ? location.split("?")[1] || "" : window.location.search), [location]);
  const query = urlFilters.query;
  const [category, setCategory] = useState(() => query ? "all" : urlFilters.category);
  const [priceOrder, setPriceOrder] = useState<PriceOrder>("default");
  const { data: categories = [] } = trpc.store.catalog.categories.useQuery(undefined, catalogQueryOptions);
  const requestedCategory = categories.some(item => item.slug === urlFilters.category) ? urlFilters.category : "all";
  const activeCategory = categories.find(item => item.slug === category);
  const catalogTitle = query ? (isArabic ? `نتائج البحث عن «${query}»` : `Search results for “${query}”`) : activeCategory ? (isArabic ? activeCategory.titleAr : activeCategory.titleEn) : (isArabic ? "كل المنتجات" : "All products");
  const catalogInput = useMemo(() => ({ categorySlug: category === "all" ? undefined : category, query: query || undefined, priceOrder, limit: 12 }), [category, query, priceOrder]);
  const catalog = trpc.store.catalog.productsPage.useInfiniteQuery(catalogInput, { ...catalogQueryOptions, getNextPageParam: page => page.nextCursor });
  const displayedProducts = catalog.data?.pages.flatMap(page => page.items) ?? [];
  const totalProducts = catalog.data?.pages[0]?.total ?? 0;

  useEffect(() => {
    setCategory(query ? "all" : requestedCategory);
  }, [query, requestedCategory]);

  useEffect(() => {
    if (!shouldAutoLoadMobileCatalogPage({ isMobile, hasNextPage: Boolean(catalog.hasNextPage), isFetchingNextPage: catalog.isFetchingNextPage })) return;
    const target = loadMoreRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) void catalog.fetchNextPage();
    }, { rootMargin: "360px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [catalog.fetchNextPage, catalog.hasNextPage, catalog.isFetchingNextPage, isMobile]);

  return <StoreShell>
    <section className="relative overflow-hidden bg-[#102f39] text-white"><div className="absolute -end-24 -top-28 h-72 w-72 rounded-full border-[32px] border-[#f2bd66]/20" /><div className="absolute -start-20 bottom-[-9rem] h-72 w-72 rounded-full bg-[#1c7983]/35 blur-3xl" /><div className="raed-container relative py-12 sm:py-16"><p className="text-xs font-black uppercase tracking-[.2em] text-[#f2bd66]">{isArabic ? "كتالوج مطبعة الروعة" : "AL RAWAA CATALOGUE"}</p><div className="mt-4 flex flex-wrap items-end justify-between gap-5"><div><h1 className="font-display text-4xl sm:text-5xl">{catalogTitle}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{isArabic ? "اختيار المنتجات وإضافتها إلى سلة الطلب ثم إرسال التفاصيل للمطبعة بخطوة واحدة." : "Choose your products, add them to the request cart, then send every detail to the printing shop at once."}</p></div><span aria-live="polite" aria-atomic="true" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold"><Check className="h-4 w-4 text-[#f2bd66]" />{totalProducts} {isArabic ? "منتج" : "product(s)"}</span></div></div></section>
    <section className="raed-section"><div className="raed-container py-7 sm:py-9"><div className="rounded-[1.25rem] border border-[#dce9eb] bg-[#f8fbfb] p-3 shadow-[0_16px_30px_-28px_rgba(13,56,66,.82)] sm:p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]"><span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-[#3f646b] shadow-sm"><Filter className="h-3.5 w-3.5 text-[#16717d]" />{isArabic ? "الفئات" : "Categories"}</span><button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")} className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${category === "all" ? "bg-[#16717d] text-white shadow-[0_8px_16px_-12px_rgba(16,113,125,.9)]" : "border border-[#dbe7e9] bg-white text-[#557078] hover:border-[#16717d]"}`}>{isArabic ? "الكل" : "All"}</button>{categories.map(item => <button type="button" aria-pressed={category === item.slug} key={item.slug} onClick={() => setCategory(item.slug)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${category === item.slug ? "bg-[#16717d] text-white shadow-[0_8px_16px_-12px_rgba(16,113,125,.9)]" : "border border-[#dbe7e9] bg-white text-[#557078] hover:border-[#16717d]"}`}>{isArabic ? item.titleAr : item.titleEn}</button>)}</div><label className="flex w-full items-center gap-2 rounded-xl border border-[#dbe7e9] bg-white px-3 py-2.5 text-xs font-extrabold text-[#557078] shadow-sm lg:w-auto"><ArrowDownUp className="h-4 w-4 text-[#16717d]" /><span className="shrink-0">{isArabic ? "الترتيب" : "Sort"}</span><select aria-label={isArabic ? "ترتيب المنتجات حسب السعر" : "Sort products by price"} value={priceOrder} onChange={event => setPriceOrder(event.target.value as PriceOrder)} className="min-w-0 flex-1 bg-transparent text-xs font-bold outline-none lg:w-44"><option value="default">{isArabic ? "الافتراضي" : "Default"}</option><option value="asc">{isArabic ? "السعر: من الأقل للأعلى" : "Price: low to high"}</option><option value="desc">{isArabic ? "السعر: من الأعلى للأقل" : "Price: high to low"}</option></select><SlidersHorizontal className="hidden h-3.5 w-3.5 text-[#79aeb4] sm:block" /></label></div></div>{catalog.isLoading ? <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-[#e8f1f2]" />)}</div> : catalog.isError ? <div role="alert" className="mx-auto mt-10 max-w-xl rounded-2xl border border-[#e6caca] bg-[#fff8f8] px-7 py-12 text-center"><p className="text-sm leading-7 text-[#8b4b4b]">{isArabic ? "تعذر تحميل المنتجات. يرجى التحقق من الاتصال وإعادة المحاولة." : "Products could not be loaded. Check your connection and try again."}</p><Button onClick={() => catalog.refetch()} variant="outline" className="mt-5">{isArabic ? "إعادة المحاولة" : "Retry"}</Button></div> : displayedProducts.length ? <><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{displayedProducts.map(product => <ProductCard key={product.product.id} product={product} />)}</div>{catalog.hasNextPage ? <div ref={loadMoreRef} className="mt-10 text-center"><Button variant="outline" disabled={catalog.isFetchingNextPage} onClick={() => catalog.fetchNextPage()} className="h-11 rounded-full border-[#a8cdd1] bg-white px-6 text-[#12616c] hover:bg-[#eff7f7]">{catalog.isFetchingNextPage ? (isArabic ? "جارٍ تحميل المزيد..." : "Loading more...") : (isArabic ? `عرض المزيد (${Math.max(totalProducts - displayedProducts.length, 0)})` : `Show more (${Math.max(totalProducts - displayedProducts.length, 0)})`)}</Button>{isMobile ? <p className="mt-3 text-xs text-[#698188]" aria-live="polite">{catalog.isFetchingNextPage ? (isArabic ? "يُحمّل المزيد تلقائياً…" : "Loading more automatically…") : (isArabic ? "تابع التمرير لاستعراض جميع الصور والمنتجات" : "Keep scrolling to browse all products")}</p> : null}</div> : null}</> : <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-[#c6dde0] bg-[#f7fbfb] px-7 py-14 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e5f3f4] text-[#16717d]">{query ? <Search className="h-7 w-7" /> : <PackageOpen className="h-7 w-7" />}</div><h2 className="mt-5 font-display text-2xl">{query ? (isArabic ? "لم نجد نتيجة مطابقة" : "No matching result") : (isArabic ? "المنتجات تتجدد باستمرار" : "New products are added regularly")}</h2><p className="mt-3 text-sm leading-7 text-[#617a80]">{isArabic ? "يمكن مشاركة الفكرة مباشرة وسنساعد في تجهيزها حسب المناسبة والكمية." : "Send your idea directly and we will help create it around your occasion and quantity."}</p><Button asChild className="mt-6 h-11 rounded-xl bg-[#16717d] hover:bg-[#105d67]"><a href={contact.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircleMore />{isArabic ? "مراسلة المطبعة" : "Message the printing shop"}</a></Button></div>}</div></section>
  </StoreShell>;
}
