import ProductCard from "@/components/ProductCard";
import StoreShell from "@/components/StoreShell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { useContactInfo } from "@/hooks/useContactInfo";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowUpLeft, Award, Boxes, Check, ChevronLeft, ChevronRight, Gift, LayoutPanelTop, Package, Paintbrush, Pause, Play, Sparkles, Stamp, Tag, Truck, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";

const HERO_GRADUATION_IMAGE = "/manus-storage/hero-graduation-uae_bc00c190.jpg";
const HERO_EID_IMAGE = "/manus-storage/hero-eid-uae_e516e79a.jpg";
const PACKAGING_IMAGE = "/manus-storage/product-eid-gift-box_9f081a80.jpg";

type HomeCategory = { slug: string; ar: string; en: string; Icon: LucideIcon };
type HeroSlide = { src: string; altAr: string; altEn: string; badgeAr: string; badgeEn: string; titleAr: string; titleEn: string };

const fallbackCategories: HomeCategory[] = [
  { slug: "promotional-gifts", Icon: Gift, ar: "هدايا إعلانية", en: "Promo gifts" },
  { slug: "occasion-stationery", Icon: Stamp, ar: "بطاقات ومناسبات", en: "Occasions" },
  { slug: "boxes-packaging", Icon: Boxes, ar: "بوكسات", en: "Boxes" },
  { slug: "custom-printing", Icon: Paintbrush, ar: "طباعة حسب الطلب", en: "Custom print" },
  { slug: "stands-boards", Icon: LayoutPanelTop, ar: "لوحات وستاندات", en: "Boards & stands" },
  { slug: "engraving-details", Icon: Sparkles, ar: "حفر وتفاصيل", en: "Engraving" },
];

const categoryIcons: Record<string, LucideIcon> = { Gift, Stamp, Boxes, Paintbrush, LayoutPanelTop, Sparkles };
const queryOptions = { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false };

function SectionTitle({ eyebrow, title, href = "/shop", action }: { eyebrow: string; title: string; href?: string; action: string }) {
  return <div className="flex items-end justify-between gap-4"><div><p className="raed-kicker">{eyebrow}</p><h2 className="mt-2 font-display text-2xl text-[#17323b] sm:text-3xl">{title}</h2></div><Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#12616c] hover:text-[#0d4f58]">{action}<ArrowUpLeft className="h-4 w-4" /></Link></div>;
}

function HeroCarousel({ slides, isArabic, children }: { slides: HeroSlide[]; isArabic: boolean; children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);
  useEffect(() => setActiveIndex(index => slides.length ? index % slides.length : 0), [slides.length]);
  useEffect(() => {
    if (slides.length < 2 || isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(() => setActiveIndex(index => (index + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion, slides.length]);

  if (!slides.length) return null;
  const activeSlide = slides[activeIndex] ?? slides[0];
  const goTo = (index: number) => setActiveIndex((index + slides.length) % slides.length);
  const toggleLabel = isPaused ? (isArabic ? "تشغيل العرض" : "Play slideshow") : (isArabic ? "إيقاف العرض" : "Pause slideshow");

  return <div className="relative min-h-[420px] overflow-hidden bg-[#102f39] sm:min-h-[520px]" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsPaused(false); }}>
    {slides.map((slide, index) => <img key={`${slide.src}-${index}`} src={slide.src} alt={isArabic ? slide.altAr : slide.altEn} width={1920} height={880} loading={index === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "high" : "low"} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"}`} />)}
    <div className="raed-gradient-overlay absolute inset-0" />
    <div className="relative z-10 flex min-h-[420px] items-center sm:min-h-[520px]">{children}</div>
    <div className="absolute inset-x-0 bottom-0 z-20"><div className="raed-container flex items-end justify-between pb-6"><div className="flex items-center gap-2" role="tablist" aria-label={isArabic ? "صور الغلاف" : "Hero images"}>{slides.map((slide, index) => <button key={`${slide.src}-dot`} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`${isArabic ? "الصورة" : "Image"} ${index + 1}`} onClick={() => goTo(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-9 bg-[#f2bd66]" : "w-4 bg-white/70 hover:bg-white"}`} />)}</div><div className="flex items-center gap-1.5"><span className="hidden rounded-md bg-[#102f39]/80 px-3 py-2 text-[10px] font-bold tracking-[.14em] text-[#f2bd66] sm:block">{isArabic ? activeSlide.badgeAr : activeSlide.badgeEn}</span><button type="button" onClick={() => goTo(activeIndex - 1)} aria-label={isArabic ? "الصورة السابقة" : "Previous image"} className="grid h-9 w-9 place-items-center rounded-md bg-white/95 text-[#17323b]"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => goTo(activeIndex + 1)} aria-label={isArabic ? "الصورة التالية" : "Next image"} className="grid h-9 w-9 place-items-center rounded-md bg-white/95 text-[#17323b]"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => setIsPaused(paused => !paused)} aria-label={toggleLabel} className="grid h-9 w-9 place-items-center rounded-md bg-white/95 text-[#17323b]">{isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}</button></div></div></div>
  </div>;
}

export default function Home() {
  const { isArabic } = useLocale();
  const contact = useContactInfo();
  const { data: products = [], isLoading, isError, refetch } = trpc.store.catalog.products.useQuery({ featuredOnly: true, limit: 8 }, queryOptions);
  const { data: boardsProducts = [] } = trpc.store.catalog.products.useQuery({ categorySlug: "stands-boards" }, queryOptions);
  const { data: siteCategories = [] } = trpc.store.catalog.categories.useQuery(undefined, queryOptions);
  const { data: homeContent } = trpc.store.catalog.homeContent.useQuery(undefined, queryOptions);
  const title = isArabic ? homeContent?.heroTitleAr || "هدايا ومطبوعات تليق بتفاصيلك" : homeContent?.heroTitleEn || "Gifts and printing made for your details";
  const subtitle = isArabic ? homeContent?.heroSubtitleAr || "من اللوحات والتوزيعات إلى البوكسات والهدايا، نصمّم تفاصيل مناسبتك بعناية." : homeContent?.heroSubtitleEn || "From boards and favors to gift boxes, we craft every detail of your occasion.";
  const promoImage = homeContent?.promoImage || HERO_EID_IMAGE;
  const displayCategories: HomeCategory[] = siteCategories.length ? siteCategories.map(category => ({ slug: category.slug, ar: category.titleAr, en: category.titleEn, Icon: categoryIcons[category.icon] || Sparkles })) : fallbackCategories;
  const configuredHeroImages = homeContent?.heroImages?.length ? homeContent.heroImages : [HERO_GRADUATION_IMAGE, HERO_EID_IMAGE];
  const heroSlides: HeroSlide[] = configuredHeroImages.map((src, index) => ({
    src,
    altAr: `بانر مطبعة الروعة ${index + 1}`,
    altEn: `Al Rawaa printing banner ${index + 1}`,
    badgeAr: index === 0 ? "اختيارات الروعة" : "تصاميم حسب الطلب",
    badgeEn: index === 0 ? "AL RAWAA PICKS" : "MADE TO ORDER",
    titleAr: title,
    titleEn: homeContent?.heroTitleEn || "Gifts and printing made for your details",
  }));
  const featuredProduct = products[0];
  const featuredProductTitle = featuredProduct ? (isArabic ? featuredProduct.product.titleAr : featuredProduct.product.titleEn) : "";
  const featuredProductImage = featuredProduct?.product.imageUrl || HERO_GRADUATION_IMAGE;
  const squareBanners = [
    { href: "/services/occasion-stationery", image: promoImage, eyebrow: isArabic ? "مناسباتك" : "OCCASIONS", title: isArabic ? "اطبعي فرحتك بطابعك" : "Print your celebration your way" },
    { href: "/services/boxes-packaging", image: PACKAGING_IMAGE, eyebrow: isArabic ? "تغليف وهدايا" : "PACKAGING", title: isArabic ? "بوكسات تُكمل شكل الهدية" : "Boxes that complete the gift" },
    { href: "/services/stands-boards", image: boardsProducts[0]?.product.imageUrl || HERO_GRADUATION_IMAGE, eyebrow: isArabic ? "بنرات ولوحات" : "BOARDS & BANNERS", title: isArabic ? "لوحات تليق بلحظاتك الكبيرة" : "Boards for your big moments" },
  ];

  return <StoreShell logoUrl={homeContent?.logoImage}>
    <section><HeroCarousel slides={heroSlides} isArabic={isArabic}><div className="raed-container"><div className="max-w-xl text-white"><span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-sm"><Tag className="h-3.5 w-3.5 text-[#f2bd66]" />{isArabic ? "تفاصيل تُصنع خصيصًا لك" : "MADE JUST FOR YOU"}</span><h1 className="mt-5 font-display text-4xl leading-tight sm:text-6xl">{title}</h1><p className="mt-5 max-w-lg text-sm leading-7 text-white/85 sm:text-base">{subtitle}</p><div className="mt-7 flex flex-wrap gap-3"><Button asChild className="h-11 rounded-md bg-[#f2bd66] px-5 text-[#17323b] hover:bg-[#ffd282]"><Link href="/shop">{isArabic ? "تصفحي المنتجات" : "Browse products"}<ArrowLeft className="h-4 w-4" /></Link></Button><Button asChild variant="outline" className="h-11 rounded-md border-white/50 bg-white/10 px-5 text-white hover:bg-white hover:text-[#17323b]"><a href={contact.whatsappUrl} target="_blank" rel="noreferrer">{isArabic ? "طلب مخصص" : "Custom request"}</a></Button></div></div></div></HeroCarousel></section>

    <section className="raed-section"><div className="raed-container grid gap-0 sm:grid-cols-3"><div className="flex items-center gap-3 border-b border-[#e5edef] py-5 sm:border-b-0 sm:border-e"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e5f3f4] text-[#16717d]"><Truck className="h-5 w-5" /></span><div><p className="text-sm font-bold">{isArabic ? "توصيل لجميع الإمارات" : "UAE-wide delivery"}</p><p className="mt-1 text-xs text-[#6e858a]">{isArabic ? "نجهز طلبك بعناية ونوصله" : "Carefully prepared and delivered"}</p></div></div><div className="flex items-center gap-3 border-b border-[#e5edef] py-5 sm:border-b-0 sm:border-e sm:px-7"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e5f3f4] text-[#16717d]"><Sparkles className="h-5 w-5" /></span><div><p className="text-sm font-bold">{isArabic ? "تصاميم حسب الطلب" : "Made-to-order designs"}</p><p className="mt-1 text-xs text-[#6e858a]">{isArabic ? "اختاري المقاس والتفاصيل" : "Choose every size and detail"}</p></div></div><div className="flex items-center gap-3 py-5 sm:px-7"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e5f3f4] text-[#16717d]"><Check className="h-5 w-5" /></span><div><p className="text-sm font-bold">{isArabic ? "جودة في كل تفصيلة" : "Quality in every detail"}</p><p className="mt-1 text-xs text-[#6e858a]">{isArabic ? "مطبوعات وتغليف بعناية" : "Thoughtful print and packaging"}</p></div></div></div></section>

    <section className="raed-section-muted print-paper"><div className="raed-container py-10"><div className="flex items-center justify-between"><div><p className="raed-kicker">{isArabic ? "ابدئي من هنا" : "START HERE"}</p><h2 className="mt-2 font-display text-2xl text-[#17323b]">{isArabic ? "تسوّقي حسب الفئة" : "Shop by category"}</h2></div><Link href="/shop" className="text-sm font-bold text-[#12616c]">{isArabic ? "عرض الكل" : "View all"}</Link></div><div className="mt-7 flex gap-5 overflow-x-auto pb-2">{displayCategories.map(category => <Link key={category.slug} href={`/services/${category.slug}`} className="group flex min-w-[106px] flex-col items-center gap-3 text-center"><span className="grid h-20 w-20 place-items-center rounded-full border border-[#d9e8ea] bg-white text-[#16717d] shadow-[0_10px_18px_-16px_rgba(13,56,66,.72)] transition group-hover:-translate-y-1 group-hover:border-[#16717d] group-hover:bg-[#16717d] group-hover:text-white"><category.Icon className="h-7 w-7" /></span><span className="text-xs font-bold text-[#38565d]">{isArabic ? category.ar : category.en}</span></Link>)}</div></div></section>

    <section className="raed-container py-10"><div className="grid gap-4 md:grid-cols-3">{squareBanners.map(banner => <Link key={banner.href} href={banner.href} className="group relative min-h-64 overflow-hidden rounded-md bg-[#102f39]"><img src={banner.image} alt="" width={960} height={640} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#102f39]/90 via-[#102f39]/35 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#f2bd66]">{banner.eyebrow}</p><h2 className="mt-2 font-display text-2xl leading-tight">{banner.title}</h2><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">{isArabic ? "اكتشفي المزيد" : "Discover more"}<ArrowUpLeft className="h-4 w-4" /></span></div></Link>)}</div></section>

    <section className="raed-section"><div className="raed-container py-12"><SectionTitle eyebrow={isArabic ? "مختارات الروعة" : "AL RAWAA PICKS"} title={isArabic ? "منتجات جاهزة لتُضاف لطلبك" : "Products ready for your request"} action={isArabic ? "عرض كل المنتجات" : "View all products"} />{isLoading ? <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-md bg-[#e8f1f2]" />)}</div> : isError ? <div role="alert" className="mt-8 rounded-md border border-[#e6caca] bg-[#fff8f8] p-8 text-center"><p className="text-sm text-[#8b4b4b]">{isArabic ? "تعذر تحميل المنتجات. تحققي من الاتصال وحاولي مرة أخرى." : "Products could not be loaded. Check your connection and try again."}</p><Button onClick={() => refetch()} variant="outline" className="mt-4 rounded-md border-[#cfa5a5] text-[#8b4b4b]">{isArabic ? "إعادة المحاولة" : "Retry"}</Button></div> : products.length ? <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_1.95fr]"><Link href={`/products/${featuredProduct?.product.slug}`} className="group relative min-h-[420px] overflow-hidden rounded-md bg-[#102f39]"><img src={featuredProductImage} alt={featuredProductTitle} width={900} height={900} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#102f39]/95 via-[#102f39]/24 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-7 text-white"><span className="text-[10px] font-black uppercase tracking-[.18em] text-[#f2bd66]">{isArabic ? "اختيار مميز" : "FEATURED PICK"}</span><h3 className="mt-3 font-display text-3xl leading-tight">{featuredProductTitle}</h3><span className="mt-5 inline-flex items-center gap-1 text-sm font-bold">{isArabic ? "اكتشفي التفاصيل" : "Discover details"}<ArrowUpLeft className="h-4 w-4" /></span></div></Link><div className="grid grid-cols-2 gap-4 sm:grid-cols-2">{products.slice(1, 5).map(product => <ProductCard key={product.product.id} product={product} />)}</div></div> : <div className="mt-8 rounded-md border border-dashed border-[#cddfe2] bg-[#f7fbfb] p-8 text-center"><Award className="mx-auto h-7 w-7 text-[#16717d]" /><p className="mt-3 text-sm text-[#617a80]">{isArabic ? "لا توجد منتجات منشورة بعد. أرسلي فكرتك وسنحوّلها إلى طلب خاص." : "There are no published products yet. Share your idea and we will turn it into a custom request."}</p></div>}</div></section>

    {boardsProducts.length > 0 && <section className="raed-section-muted"><div className="raed-container py-12"><SectionTitle eyebrow={isArabic ? "تفاصيل كبيرة لمناسباتك" : "BIG MOMENTS, BEAUTIFULLY MADE"} title={isArabic ? "بنرات ولوحات تُلفت الأنظار" : "Banners & boards that stand out"} href="/services/stands-boards" action={isArabic ? "عرض كل اللوحات" : "View all boards"} /><div className="mt-8 grid gap-5 md:grid-cols-2">{boardsProducts.slice(0, 2).map(({ product }) => <Link key={product.id} href={`/products/${product.slug}`} className="group relative min-h-72 overflow-hidden rounded-md bg-[#102f39]"><img src={product.imageUrl || HERO_GRADUATION_IMAGE} alt={isArabic ? product.titleAr : product.titleEn} width={960} height={640} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#102f39]/90 via-[#102f39]/18 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-7 text-white"><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#f2bd66]"><LayoutPanelTop className="h-3.5 w-3.5" />{isArabic ? "حسب الطلب" : "MADE TO ORDER"}</span><h3 className="mt-3 font-display text-3xl">{isArabic ? product.titleAr : product.titleEn}</h3><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">{isArabic ? "شاهدي التفاصيل" : "View details"}<ArrowUpLeft className="h-4 w-4" /></span></div></Link>)}</div></div></section>}

    <section className="raed-section"><div className="raed-container py-12"><SectionTitle eyebrow={isArabic ? "كيف يتم الطلب؟" : "HOW IT WORKS"} title={isArabic ? "اختاري، أضيفي، ثم أرسلي" : "Choose, add, then send"} href="/shop" action={isArabic ? "ابدئي التسوق" : "Start shopping"} /><div className="mt-8 grid gap-4 md:grid-cols-3">{(isArabic ? [["01", "تصفحي الفئات", "ابحثي عن المنتج أو الخدمة المناسبة."], ["02", "أضيفي إلى سلة الطلب", "اجمعي كل اختياراتك في مكان واحد."], ["03", "أرسلي التفاصيل", "نحفظ الطلب ونفتح واتساب للتأكيد."]] : [["01", "Browse categories", "Find the product or service that suits you."], ["02", "Add to request cart", "Collect your selections in one place."], ["03", "Send the details", "We save your request then open WhatsApp to confirm."]]).map(([number, heading, copy]) => <article key={number} className="border border-[#e1ebed] bg-white p-6"><span className="font-display text-4xl text-[#b7dfe1]">{number}</span><h3 className="mt-6 text-lg font-bold text-[#17323b]">{heading}</h3><p className="mt-2 text-sm leading-7 text-[#6e858a]">{copy}</p></article>)}</div></div></section>
  </StoreShell>;
}
