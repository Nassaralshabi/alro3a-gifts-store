import ProductCard from "@/components/ProductCard";
import StoreShell from "@/components/StoreShell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { useContactInfo } from "@/hooks/useContactInfo";
import { filterCatalogProducts, getCatalogPage, getCatalogUrlFilters, type PriceOrder } from "@/lib/catalogFilters";
import { trpc } from "@/lib/trpc";
import { ArrowDownUp, Check, Filter, MessageCircleMore, PackageOpen, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const catalogQueryOptions = { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false };

export default function Shop() {
  const { isArabic } = useLocale();
  const contact = useContactInfo();
  const [location] = useLocation();
  const [category, setCategory] = useState("all");
  const [priceOrder, setPriceOrder] = useState<PriceOrder>("default");
  const [visibleCount, setVisibleCount] = useState(12);
  const urlFilters = useMemo(() => getCatalogUrlFilters(typeof window === "undefined" ? location.split("?")[1] || "" : window.location.search), [location]);
  const query = urlFilters.query;
  const { data: products = [], isLoading } = trpc.store.catalog.products.useQuery(undefined, catalogQueryOptions);
  const { data: categories = [] } = trpc.store.catalog.categories.useQuery(undefined, catalogQueryOptions);
  const requestedCategory = categories.some(item => item.slug === urlFilters.category) ? urlFilters.category : "all";
  const activeCategory = categories.find(item => item.slug === category);
  const catalogTitle = query ? (isArabic ? `نتائج البحث عن «${query}»` : `Search results for “${query}”`) : activeCategory ? (isArabic ? activeCategory.titleAr : activeCategory.titleEn) : (isArabic ? "كل المنتجات" : "All products");
  const visibleProducts = useMemo(() => filterCatalogProducts(products, category, query, priceOrder), [products, category, query, priceOrder]);
  useEffect(() => {
    setCategory(query ? "all" : requestedCategory);
  }, [query, requestedCategory]);
  useEffect(() => setVisibleCount(12), [category, query, priceOrder, products.length]);
  const displayedProducts = getCatalogPage(visibleProducts, visibleCount);

  return <StoreShell>
    <section className="relative overflow-hidden bg-[#102f39] text-white"><div className="absolute -end-24 -top-28 h-72 w-72 rounded-full border-[32px] border-[#f2bd66]/20" /><div className="absolute -start-20 bottom-[-9rem] h-72 w-72 rounded-full bg-[#1c7983]/35 blur-3xl" /><div className="raed-container relative py-12 sm:py-16"><p className="text-xs font-black uppercase tracking-[.2em] text-[#f2bd66]">{isArabic ? "كتالوج مطبعة الروعة" : "AL RAWAA CATALOGUE"}</p><div className="mt-4 flex flex-wrap items-end justify-between gap-5"><div><h1 className="font-display text-4xl sm:text-5xl">{catalogTitle}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{isArabic ? "اختاري منتجاتك، أضيفيها إلى سلة الطلب، ثم أرسلي التفاصيل للمطبعة مرة واحدة." : "Choose your products, add them to the request cart, then send every detail to the printing shop at once."}</p></div><span aria-live="polite" aria-atomic="true" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold"><Check className="h-4 w-4 text-[#f2bd66]" />{visibleProducts.length} {isArabic ? "منتج" : "product(s)"}</span></div></div></section>
    <section className="raed-section"><div className="raed-container py-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-2 overflow-x-auto pb-1"><span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#607a80]"><SlidersHorizontal className="h-4 w-4 text-[#16717d]" />{isArabic ? "الفئات" : "Categories"}</span><button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${category === "all" ? "bg-[#16717d] text-white" : "border border-[#dbe7e9] bg-white text-[#557078] hover:border-[#16717d]"}`}>{isArabic ? "الكل" : "All"}</button>{categories.map(item => <button type="button" aria-pressed={category === item.slug} key={item.slug} onClick={() => setCategory(item.slug)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${category === item.slug ? "bg-[#16717d] text-white" : "border border-[#dbe7e9] bg-white text-[#557078] hover:border-[#16717d]"}`}>{isArabic ? item.titleAr : item.titleEn}</button>)}</div><label className="flex w-full items-center gap-2 rounded-md border border-[#dbe7e9] bg-[#f9fcfc] px-3 py-2 text-xs font-bold text-[#557078] lg:w-auto"><ArrowDownUp className="h-4 w-4 text-[#16717d]" /><span className="shrink-0">{isArabic ? "الترتيب" : "Sort"}</span><select aria-label={isArabic ? "ترتيب المنتجات حسب السعر" : "Sort products by price"} value={priceOrder} onChange={event => setPriceOrder(event.target.value as PriceOrder)} className="min-w-0 flex-1 bg-transparent text-xs font-bold outline-none lg:w-44"><option value="default">{isArabic ? "الافتراضي" : "Default"}</option><option value="asc">{isArabic ? "السعر: من الأقل للأعلى" : "Price: low to high"}</option><option value="desc">{isArabic ? "السعر: من الأعلى للأقل" : "Price: high to low"}</option></select></label></div>{isLoading ? <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-md bg-[#e8f1f2]" />)}</div> : visibleProducts.length ? <><div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{displayedProducts.map(product => <ProductCard key={product.product.id} product={product} />)}</div>{visibleProducts.length > displayedProducts.length ? <div className="mt-10 text-center"><Button variant="outline" onClick={() => setVisibleCount(count => count + 12)} className="h-11 rounded-md border-[#a8cdd1] bg-white px-6 text-[#12616c] hover:bg-[#eff7f7]">{isArabic ? `عرض المزيد (${visibleProducts.length - displayedProducts.length})` : `Show more (${visibleProducts.length - displayedProducts.length})`}</Button></div> : null}</> : <div className="mx-auto mt-10 max-w-xl rounded-md border border-dashed border-[#c6dde0] bg-[#f7fbfb] px-7 py-14 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e5f3f4] text-[#16717d]">{query ? <Search className="h-7 w-7" /> : <PackageOpen className="h-7 w-7" />}</div><h2 className="mt-5 font-display text-2xl">{query ? (isArabic ? "لم نجد نتيجة مطابقة" : "No matching result") : (isArabic ? "المنتجات تتجدد باستمرار" : "New products are added regularly")}</h2><p className="mt-3 text-sm leading-7 text-[#617a80]">{isArabic ? "أرسلي فكرتك مباشرة وسنساعدك في تجهيزها حسب المناسبة والكمية." : "Send your idea directly and we will help create it around your occasion and quantity."}</p><Button asChild className="mt-6 h-11 rounded-md bg-[#16717d] hover:bg-[#105d67]"><a href={contact.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircleMore />{isArabic ? "مراسلة المطبعة" : "Message the printing shop"}</a></Button></div>}</div></section>
  </StoreShell>;
}
