import ProductCard from "@/components/ProductCard";
import StoreShell from "@/components/StoreShell";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { useContactInfo } from "@/hooks/useContactInfo";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowUpLeft, Award, Boxes, ChevronLeft, ChevronRight, Gift, LayoutPanelTop, Package, Paintbrush, Pause, Play, Sparkles, Stamp, Tag, Truck, type LucideIcon } from "lucide-react";
import { Link } from "wouter";

const FALLBACK_HERO_IMAGE = "/manus-storage/social-2_de273aa2.jpg";
const FALLBACK_PROMO_IMAGE = "/manus-storage/social-3_0108449b.jpg";
const PRIMARY_HERO_IMAGE = "/manus-storage/alro3a-hero-gifts-stationery_48aa6e7e.jpg";

type HomeCategory = { slug: string; ar: string; en: string; Icon: LucideIcon };

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
  return <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#8c719c]">{eyebrow}</p><h2 className="mt-2 font-display text-2xl text-[#24233a] sm:text-3xl">{title}</h2></div><Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#7953a2] hover:text-[#5e3c80]">{action}<ArrowUpLeft className="h-4 w-4" /></Link></div>;
}

type HeroSlide = { src: string; altAr: string; altEn: string; badgeAr: string; badgeEn: string; titleAr: string; titleEn: string };

function HeroCarousel({ slides, isArabic }: { slides: HeroSlide[]; isArabic: boolean }) {
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

  useEffect(() => {
    setActiveIndex(index => slides.length ? index % slides.length : 0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(() => setActiveIndex(index => (index + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion, slides.length]);

  if (!slides.length) return null;
  const activeSlide = slides[activeIndex] ?? slides[0];
  const goTo = (index: number) => setActiveIndex((index + slides.length) % slides.length);
  const previousLabel = isArabic ? "الصورة السابقة" : "Previous image";
  const nextLabel = isArabic ? "الصورة التالية" : "Next image";
  const toggleLabel = isPaused ? (isArabic ? "تشغيل العرض" : "Play slideshow") : (isArabic ? "إيقاف العرض" : "Pause slideshow");

  return <div className="relative h-full w-full" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsPaused(false); }}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(255,255,255,.85),transparent_45%)]" />
    <div className="relative h-full w-full overflow-hidden rounded-xl shadow-[0_25px_50px_-28px_rgba(36,35,58,.75)]" aria-live="polite">
      {slides.map((slide, index) => <img key={`${slide.src}-${index}`} src={slide.src} alt={isArabic ? slide.altAr : slide.altEn} width={960} height={720} loading={index === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "high" : "low"} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"}`} />)}
      <span className="absolute bottom-4 start-4 rounded-xl bg-[#24233a]/95 px-4 py-3 text-white shadow-lg sm:bottom-6 sm:start-6"><span className="block text-[10px] font-bold tracking-[.15em] text-[#dcb65c]">{isArabic ? activeSlide.badgeAr : activeSlide.badgeEn}</span><span className="mt-1 block font-display text-lg">{isArabic ? activeSlide.titleAr : activeSlide.titleEn}</span></span>
      {slides.length > 1 && <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 sm:inset-x-6 sm:bottom-6"><div className="flex items-center gap-1.5" role="tablist" aria-label={isArabic ? "صور الغلاف" : "Hero images"}>{slides.map((slide, index) => <button key={`${slide.src}-dot`} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`${isArabic ? "الصورة" : "Image"} ${index + 1}`} onClick={() => goTo(index)} className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-7 bg-white" : "w-2 bg-white/60 hover:bg-white"}`} />)}</div><div className="flex items-center gap-1"><button type="button" onClick={() => goTo(activeIndex - 1)} aria-label={previousLabel} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#24233a] transition hover:bg-white"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => goTo(activeIndex + 1)} aria-label={nextLabel} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#24233a] transition hover:bg-white"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => setIsPaused(paused => !paused)} aria-label={toggleLabel} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#24233a] transition hover:bg-white">{isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}</button></div></div>}
    </div>
  </div>;
}

export default function Home() {
  const { isArabic } = useLocale();
  const contact = useContactInfo();
  const { data: products = [], isLoading, isError, refetch } = trpc.store.catalog.products.useQuery({ featuredOnly: true, limit: 8 }, queryOptions);
  const { data: siteCategories = [] } = trpc.store.catalog.categories.useQuery(undefined, queryOptions);
  const { data: homeContent } = trpc.store.catalog.homeContent.useQuery(undefined, queryOptions);

  const heroImage = homeContent?.heroImage || FALLBACK_HERO_IMAGE;
  const promoImage = homeContent?.promoImage || FALLBACK_PROMO_IMAGE;
  const title = isArabic ? homeContent?.heroTitleAr || "مطبوعات وهدايا تليق بتفاصيلك" : homeContent?.heroTitleEn || "Printing and gifts made for your details";
  const subtitle = isArabic ? homeContent?.heroSubtitleAr || "استكشفي تشكيلات الهدايا، المطبوعات، البوكسات واللوحات، واحتفظي بما يعجبك في سلة طلب واحدة." : homeContent?.heroSubtitleEn || "Explore gifts, print pieces, boxes and boards, then collect your selections in one request cart.";
  const displayCategories: HomeCategory[] = siteCategories.length ? siteCategories.map(category => ({ slug: category.slug, ar: category.titleAr, en: category.titleEn, Icon: categoryIcons[category.icon] || Sparkles })) : fallbackCategories;
  const heroSlides = useMemo<HeroSlide[]>(() => {
    const productSlides = products.slice(0, 3).filter(entry => entry.product.imageUrl).map(entry => ({ src: entry.product.imageUrl as string, altAr: entry.product.titleAr, altEn: entry.product.titleEn, badgeAr: "من تشكيلتنا", badgeEn: "FROM OUR COLLECTION", titleAr: entry.product.titleAr, titleEn: entry.product.titleEn }));
    const slides: HeroSlide[] = [
      { src: PRIMARY_HERO_IMAGE, altAr: "تشكيلة هدايا ومطبوعات من الروعة", altEn: "Al Rawaa gifts and custom printing collection", badgeAr: "هدايا بطابعك", badgeEn: "GIFTS MADE YOUR WAY", titleAr: "تفاصيل تُهدى وتُحفظ", titleEn: "Details made to give and keep" },
      { src: heroImage, altAr: "بانر مخصص من مطبعة الروعة", altEn: "Custom banner by Al Rawaa", badgeAr: "الأكثر طلبًا", badgeEn: "POPULAR PICK", titleAr: "لوحات التصوير", titleEn: "Photo boards" },
      { src: promoImage, altAr: "هدايا ومطبوعات للمناسبات", altEn: "Gifts and prints for occasions", badgeAr: "مناسباتك", badgeEn: "OCCASIONS", titleAr: "اطبعي فرحتك بطابعك", titleEn: "Print your celebration" },
      ...productSlides,
    ];
    return slides.filter((slide, index, all) => all.findIndex(candidate => candidate.src === slide.src) === index);
  }, [heroImage, isArabic, products, promoImage]);

  return <StoreShell logoUrl={homeContent?.logoImage}>
    <section className="border-b border-[#e9e3d6] bg-[#faf8fb]">
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-8">
        <div className="relative grid min-h-[360px] overflow-hidden rounded-2xl bg-[#eee5f3] lg:grid-cols-[1.08fr_.92fr]">
          <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[#dcb65c]/35 blur-3xl" />
          <div className="relative order-2 flex flex-col justify-center p-8 sm:p-12 lg:order-1 lg:p-16">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d5c4df] bg-white/70 px-3 py-1.5 text-xs font-bold text-[#7953a2]"><Tag className="h-3.5 w-3.5" />{isArabic ? "تصاميم حسب الطلب" : "MADE TO ORDER"}</span>
            <h1 className="mt-5 max-w-2xl font-display text-4xl leading-tight text-[#24233a] sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#6c6562] sm:text-base">{subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-lg bg-[#7953a2] px-5 hover:bg-[#654287]"><Link href="/shop">{isArabic ? "تصفحي المنتجات" : "Browse products"}<ArrowLeft className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" className="h-11 rounded-lg border-[#cdbbd6] bg-white/70 px-5 text-[#5e3c80] hover:bg-white"><a href={contact.whatsappUrl} target="_blank" rel="noreferrer">{isArabic ? "طلب مخصص" : "Custom request"}</a></Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs font-bold text-[#615a56]"><span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-[#7953a2]" />{isArabic ? "توصيل لكل الإمارات" : "UAE-wide delivery"}</span><span className="inline-flex items-center gap-2"><Package className="h-4 w-4 text-[#7953a2]" />{isArabic ? "سلة طلب موحدة" : "One request cart"}</span></div>
          </div>
          <div className="relative order-1 min-h-[280px] p-6 lg:order-2 lg:p-9">
            <HeroCarousel slides={heroSlides} isArabic={isArabic} />
          </div>
        </div>
      </div>
    </section>

    <section className="border-b border-[#eee9e1] bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">{isArabic ? "تسوّقي حسب الفئة" : "Shop by category"}</h2><Link href="/shop" className="text-xs font-bold text-[#7953a2]">{isArabic ? "عرض الكل" : "View all"}</Link></div><div className="mt-5 flex gap-3 overflow-x-auto pb-2">{displayCategories.map(category => <Link key={category.slug} href={`/services/${category.slug}`} className="group flex min-w-[138px] flex-1 flex-col items-center gap-3 rounded-xl border border-[#ebe7df] bg-[#fffdf8] px-4 py-5 text-center transition hover:border-[#b99cca] hover:bg-[#f7f3f8] sm:min-w-[155px]"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#f0eaf5] text-[#7953a2] transition group-hover:bg-[#7953a2] group-hover:text-white"><category.Icon className="h-5 w-5" /></span><span className="text-xs font-bold text-[#4f4a46]">{isArabic ? category.ar : category.en}</span></Link>)}</div></div>
    </section>

    <section className="mx-auto grid max-w-[1440px] gap-4 px-4 py-8 [contain-intrinsic-size:auto_560px] [content-visibility:auto] sm:px-8 lg:grid-cols-2">
      <Link href="/services/occasion-stationery" className="group relative min-h-56 overflow-hidden rounded-2xl bg-[#24233a] p-7 text-white"><img src={promoImage} alt="" width={960} height={560} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-l from-[#24233a]/95 to-[#24233a]/35" /><div className="relative max-w-sm"><p className="text-xs font-black uppercase tracking-[.2em] text-[#dcb65c]">{isArabic ? "مناسباتك" : "OCCASIONS"}</p><h2 className="mt-3 font-display text-3xl">{isArabic ? "اطبعي فرحتك بطابعك" : "Print your celebration your way"}</h2><span className="mt-6 inline-flex items-center gap-1 text-sm font-bold">{isArabic ? "اكتشفي التفاصيل" : "Discover details"}<ArrowUpLeft className="h-4 w-4" /></span></div></Link>
      <Link href="/services/boxes-packaging" className="group relative min-h-56 overflow-hidden rounded-2xl bg-[#dcb65c] p-7 text-[#24233a]"><div className="absolute -bottom-20 -end-12 h-64 w-64 rounded-full border-[24px] border-white/45" /><div className="relative max-w-sm"><p className="text-xs font-black uppercase tracking-[.2em] text-[#6a4a23]">{isArabic ? "تغليف وهدايا" : "PACKAGING"}</p><h2 className="mt-3 font-display text-3xl">{isArabic ? "بوكسات تُكمل شكل الهدية" : "Boxes that complete the gift"}</h2><span className="mt-6 inline-flex items-center gap-1 text-sm font-bold">{isArabic ? "عرض البوكسات" : "View boxes"}<ArrowUpLeft className="h-4 w-4" /></span></div></Link>
    </section>

    <section className="mx-auto max-w-[1440px] px-4 py-10 [contain-intrinsic-size:auto_720px] [content-visibility:auto] sm:px-8">
      <SectionTitle eyebrow={isArabic ? "مختارات الروعة" : "AL RAWAA PICKS"} title={isArabic ? "منتجات جاهزة لتُضاف لطلبك" : "Products ready for your request"} action={isArabic ? "عرض الكل" : "View all"} />
      {isLoading ? <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-xl bg-[#f4f0f6]" />)}</div> : isError ? <div role="alert" className="mt-7 rounded-2xl border border-[#e7caca] bg-[#fff8f8] p-8 text-center"><p className="text-sm text-[#8b4b4b]">{isArabic ? "تعذر تحميل المنتجات. تحققي من الاتصال وحاولي مرة أخرى." : "Products could not be loaded. Check your connection and try again."}</p><Button onClick={() => refetch()} variant="outline" className="mt-4 rounded-lg border-[#cfa5a5] text-[#8b4b4b]">{isArabic ? "إعادة المحاولة" : "Retry"}</Button></div> : products.length ? <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.map(product => <ProductCard key={product.product.id} product={product} />)}</div> : <div className="mt-7 rounded-2xl border border-dashed border-[#d6c9dd] bg-[#faf8fb] p-8 text-center"><Award className="mx-auto h-7 w-7 text-[#7953a2]" /><p className="mt-3 text-sm text-[#766f69]">{isArabic ? "لا توجد منتجات منشورة بعد. أرسلي فكرتك وسنحوّلها إلى طلب خاص." : "There are no published products yet. Share your idea and we will turn it into a custom request."}</p></div>}
    </section>

    <section className="border-y border-[#eee9e1] bg-[#faf8fb] [contain-intrinsic-size:auto_560px] [content-visibility:auto]">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8"><SectionTitle eyebrow={isArabic ? "كيف يتم الطلب؟" : "HOW IT WORKS"} title={isArabic ? "اختاري، أضيفي، ثم أرسلي" : "Choose, add, then send"} href="/shop" action={isArabic ? "ابدئي التسوق" : "Start shopping"} /><div className="mt-7 grid gap-4 md:grid-cols-3">{(isArabic ? [["1", "تصفحي الفئات", "ابحثي عن المنتج أو الخدمة المناسبة."], ["2", "أضيفي إلى سلة الطلب", "اجمعي كل اختياراتك في مكان واحد."], ["3", "أرسلي التفاصيل", "نحفظ الطلب ونفتح واتساب للتأكيد."]] : [["1", "Browse categories", "Find the product or service that suits you."], ["2", "Add to request cart", "Collect your selections in one place."], ["3", "Send the details", "We save your request then open WhatsApp to confirm."]]).map(([number, heading, copy]) => <article key={number} className="rounded-xl border border-[#e9e3d6] bg-white p-5"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#7953a2] text-xs font-black text-white">{number}</span><h3 className="mt-4 font-display text-2xl">{heading}</h3><p className="mt-2 text-sm leading-6 text-[#766f69]">{copy}</p></article>)}</div></div>
    </section>
  </StoreShell>;
}
