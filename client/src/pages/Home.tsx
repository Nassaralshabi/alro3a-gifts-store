import { CategoryRail, ProductSection } from "@/components/CatalogSections";
import StoreShell from "@/components/StoreShell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { useContactInfo } from "@/hooks/useContactInfo";
import { getHeroSlideIndex, HERO_AUTOPLAY_DELAY, shouldAutoAdvance } from "@/lib/heroCarousel";
import { trpc } from "@/lib/trpc";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpLeft, Check, Sparkles, Truck, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

const HERO_GRADUATION_IMAGE = "/manus-storage/hero-graduation-uae_bc00c190.jpg";
const HERO_EID_IMAGE = "/manus-storage/hero-eid-uae_e516e79a.jpg";
const PACKAGING_IMAGE = "/manus-storage/product-eid-gift-box_9f081a80.jpg";
const HERO_BRAND_LOGO = "/manus-storage/alrawhaa-logo_cfae3a03.webp";
const queryOptions = { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false };

type HeroSlide = { src: string; altAr: string; altEn: string; badgeAr: string; badgeEn: string; titleAr: string; titleEn: string; subtitleAr: string; subtitleEn: string };
type SectionCopy = { eyebrowAr: string; eyebrowEn: string; titleAr: string; titleEn: string; subtitleAr?: string; subtitleEn?: string; muted?: boolean };

const sectionCopy: Record<string, SectionCopy> = {
  "occasion-stationery": { eyebrowAr: "لحظات لا تُنسى", eyebrowEn: "MEMORABLE MOMENTS", titleAr: "مطبوعات تناسب كل مناسبة", titleEn: "Print for every occasion", subtitleAr: "بطاقات وتوزيعات وتفاصيل تضيف لمستك الخاصة.", subtitleEn: "Cards, favors, and details made for your occasion." },
  "boxes-packaging": { eyebrowAr: "تغليف يليق بالهدية", eyebrowEn: "WRAPPED BEAUTIFULLY", titleAr: "بوكسات وتغليف بتفاصيلك", titleEn: "Boxes and packaging, your way", subtitleAr: "خيارات جاهزة للتخصيص وتجهيز هديتك بأناقة.", subtitleEn: "Custom-ready options to present every gift beautifully.", muted: true },
  "custom-printing": { eyebrowAr: "من فكرتك إلى منتجك", eyebrowEn: "FROM IDEA TO PRINT", titleAr: "طباعة حسب الطلب", titleEn: "Made-to-order printing", subtitleAr: "اختر المنتج وشارك الفكرة لنرتب التفاصيل معك.", subtitleEn: "Choose a product and share your idea; we will handle the details." },
  "stickers-labels": { eyebrowAr: "تفاصيل صغيرة، أثر كبير", eyebrowEn: "SMALL DETAILS, BIG IMPACT", titleAr: "ستيكرات وليبلات", titleEn: "Stickers and labels", subtitleAr: "أضف لمسة مطبوعة مميزة إلى التغليف والهوية.", subtitleEn: "Complete every package and identity with a printed finishing touch.", muted: true },
  "paper-bags": { eyebrowAr: "جاهزة للحمل والإهداء", eyebrowEn: "READY TO CARRY AND GIFT", titleAr: "أكياس ورقية", titleEn: "Paper bags", subtitleAr: "تتوفر مقاسات وتصاميم مناسبة لكل طلب.", subtitleEn: "Choose the right size and design for your order." },
  "promotional-gifts": { eyebrowAr: "هدية تترك انطباعًا", eyebrowEn: "GIFTS THAT LEAVE AN IMPRESSION", titleAr: "هدايا إعلانية", titleEn: "Promotional gifts", subtitleAr: "حلول مطبوعة تناسب العلامات والمناسبات والطلبات الخاصة.", subtitleEn: "Printed solutions for brands, occasions, and special requests.", muted: true },
};

function HeroCarousel({ slides, isArabic }: { slides: HeroSlide[]; isArabic: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
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
    if (!shouldAutoAdvance(slides.length, false, prefersReducedMotion)) return;
    const timer = window.setInterval(() => setActiveIndex(index => getHeroSlideIndex(index, 1, slides.length)), HERO_AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, slides.length]);
  useEffect(() => {
    if (slides.length < 2 || prefersReducedMotion) return;
    const timer = window.setTimeout(() => {
      const nextSlide = slides[(activeIndex + 1) % slides.length];
      if (!nextSlide) return;
      const image = new Image();
      image.decoding = "async";
      image.src = nextSlide.src;
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [activeIndex, prefersReducedMotion, slides]);

  if (!slides.length) return null;
  const activeSlide = slides[activeIndex] ?? slides[0];
  const goTo = (index: number) => setActiveIndex(getHeroSlideIndex(index, 0, slides.length));

  return <div className="hero-panel bg-[#f6f8f4]">
    <div className="relative min-h-[250px] overflow-hidden sm:min-h-[330px]">
      <AnimatePresence initial={false}>
        <motion.img key={activeSlide.src} src={activeSlide.src} alt={isArabic ? activeSlide.altAr : activeSlide.altEn} width={1920} height={880} loading="eager" decoding="async" fetchPriority="high" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.01 }} transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }} className="absolute inset-0 h-full w-full bg-[#f6f8f4] object-contain will-change-transform" />
      </AnimatePresence>
      <div className="sr-only"><p>{isArabic ? activeSlide.badgeAr : activeSlide.badgeEn}</p><h1>{isArabic ? activeSlide.titleAr : activeSlide.titleEn}</h1><p>{isArabic ? activeSlide.subtitleAr : activeSlide.subtitleEn}</p></div>
    </div>
    <div className="border-t border-[#dbe9eb] bg-white"><div className="raed-container flex min-h-11 items-center justify-center py-1.5"><div className="flex items-center gap-2" role="tablist" aria-label={isArabic ? "صور الغلاف" : "Hero images"}>{slides.map((slide, index) => <button key={`${slide.src}-dot`} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`${isArabic ? "الصورة" : "Image"} ${index + 1}`} onClick={() => goTo(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-9 bg-[#16717d]" : "w-4 bg-[#bbd5d8] hover:bg-[#78aeb4]"}`} />)}</div></div></div>
  </div>;
}

function Benefit({ Icon, title, detail }: { Icon: LucideIcon; title: string; detail: string }) {
  return <article className="flex items-center gap-3 border-b border-[#e2ecee] py-5 last:border-b-0 sm:border-b-0 sm:border-e sm:px-6 sm:last:border-e-0"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e5f3f4] text-[#16717d]"><Icon className="h-5 w-5" /></span><div><h3 className="text-sm font-bold text-[#17323b]">{title}</h3><p className="mt-1 text-xs text-[#6e858a]">{detail}</p></div></article>;
}

export default function Home() {
  const { isArabic } = useLocale();
  const contact = useContactInfo();
  const { data: homeContent } = trpc.store.catalog.homeContent.useQuery(undefined, queryOptions);
  const { data: homeCatalog, isLoading, isError, refetch } = trpc.store.catalog.homeCatalog.useQuery(undefined, queryOptions);
  const configuredHeroImages = homeContent?.heroImages?.length ? homeContent.heroImages : [HERO_GRADUATION_IMAGE, HERO_EID_IMAGE];
  const fallbackHeroSlides: HeroSlide[] = configuredHeroImages.map((src, index) => ({ src, altAr: `بانر مطبعة الروعة ${index + 1}`, altEn: `Al Rawaa printing banner ${index + 1}`, badgeAr: index === 0 ? "تفاصيل تُصنع خصيصًا لك" : "اختيارات مطبعة الروعة", badgeEn: index === 0 ? "MADE FOR YOUR DETAILS" : "AL RAWAA PICKS", titleAr: homeContent?.heroTitleAr || "هديتك تبدأ بتفصيلة لا تُنسى", titleEn: homeContent?.heroTitleEn || "Start with an unforgettable detail", subtitleAr: homeContent?.heroSubtitleAr || "استعرض المنتجات وشارك تفاصيل الطلب ليُجهز بعناية.", subtitleEn: homeContent?.heroSubtitleEn || "Choose your products and share the details; we will prepare them with care." }));
  const heroSlides: HeroSlide[] = homeContent?.heroSlides?.length ? homeContent.heroSlides.map((slide, index) => { const fallback = fallbackHeroSlides[index] || fallbackHeroSlides[0]; return { src: slide.image, altAr: `بانر مطبعة الروعة ${index + 1}`, altEn: `Al Rawaa printing banner ${index + 1}`, badgeAr: slide.badgeAr || fallback.badgeAr, badgeEn: slide.badgeEn || fallback.badgeEn, titleAr: slide.titleAr || fallback.titleAr, titleEn: slide.titleEn || fallback.titleEn, subtitleAr: slide.subtitleAr || fallback.subtitleAr, subtitleEn: slide.subtitleEn || fallback.subtitleEn }; }) : fallbackHeroSlides;
  const sections = homeCatalog?.sections || [];
  const promoImage = homeContent?.promoImage || PACKAGING_IMAGE;
  const catalogSections = useMemo(() => ["occasion-stationery", "boxes-packaging", "custom-printing", "stickers-labels", "paper-bags", "promotional-gifts"].map(slug => ({ slug, products: sections.find(section => section.slug === slug)?.products || [], copy: sectionCopy[slug] })).filter(section => section.products.length), [sections]);

  return <StoreShell logoUrl={HERO_BRAND_LOGO}>
    <section><HeroCarousel slides={heroSlides} isArabic={isArabic} /></section>
    {isLoading ? <section className="border-b border-[#e2ecee] bg-white"><div className="raed-container py-7 sm:py-9"><div className="h-8 w-52 animate-pulse rounded bg-[#e8f1f2]" /><div className="mt-6 flex gap-3 overflow-hidden">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-32 min-w-[125px] animate-pulse rounded-2xl bg-[#edf4f5]" />)}</div></div></section> : <CategoryRail categories={homeCatalog?.categories || []} isArabic={isArabic} />}
    <section className="bg-[#f8f6f0]"><div className="raed-container grid sm:grid-cols-3"><Benefit Icon={Truck} title={isArabic ? "توصيل لجميع الإمارات" : "UAE-wide delivery"} detail={isArabic ? "نجهز طلبك بعناية ونوصله" : "Prepared with care and delivered"} /><Benefit Icon={Sparkles} title={isArabic ? "تصاميم حسب الطلب" : "Made to order"} detail={isArabic ? "تفاصيل ومقاسات حسب الطلب" : "Choose the details and size"} /><Benefit Icon={Check} title={isArabic ? "جودة في كل تفصيلة" : "Care in every detail"} detail={isArabic ? "مطبوعات وتغليف بعناية" : "Thoughtful printing and wrapping"} /></div></section>
    {isLoading ? <section className="raed-container py-12"><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-xl bg-[#e8f1f2]" />)}</div></section> : isError ? <section className="raed-container py-12"><div role="alert" className="rounded-xl border border-[#e6caca] bg-[#fff8f8] p-8 text-center"><p className="text-sm text-[#8b4b4b]">{isArabic ? "تعذر تحميل أقسام المنتجات. يرجى التحقق من الاتصال وإعادة المحاولة." : "Product sections could not be loaded. Check your connection and try again."}</p><Button onClick={() => refetch()} variant="outline" className="mt-4">{isArabic ? "إعادة المحاولة" : "Retry"}</Button></div></section> : <>
      <ProductSection eyebrow={isArabic ? "مختارات الروعة" : "AL RAWAA PICKS"} title={isArabic ? "اختيارات جاهزة لطلبك" : "Ready-to-request picks"} subtitle={isArabic ? "منتجات مختارة للبدء مع خيارات تخصيص تناسب الطلب." : "Selected products to start with and customize for your order."} products={homeCatalog?.featured || []} viewAllHref="/shop" viewAllLabel={isArabic ? "عرض الكل" : "View all"} />
      {catalogSections.slice(0, 2).map(section => <ProductSection key={section.slug} eyebrow={isArabic ? section.copy.eyebrowAr : section.copy.eyebrowEn} title={isArabic ? section.copy.titleAr : section.copy.titleEn} subtitle={isArabic ? section.copy.subtitleAr : section.copy.subtitleEn} products={section.products} viewAllHref={`/shop?category=${section.slug}`} viewAllLabel={isArabic ? "عرض الكل" : "View all"} isMuted={section.copy.muted} />)}
      <ProductSection eyebrow={isArabic ? "بكجات وعروض" : "GIFT PACKAGES"} title={isArabic ? "بكجات جاهزة للطلب" : "Gift packages to start with"} subtitle={isArabic ? "نماذج متاحة من الكتالوج يمكن تخصيص تفاصيلها حسب المناسبة والكمية." : "Available catalogue packages that can be tailored for your occasion and quantity."} products={homeCatalog?.bundles || []} viewAllHref="/shop?category=boxes-packaging" viewAllLabel={isArabic ? "عرض البوكسات" : "View boxes"} isMuted />
      <section className="raed-section-muted"><div className="raed-container py-11 sm:py-14"><div className="grid overflow-hidden rounded-2xl bg-[#17323b] text-white md:grid-cols-[1.1fr_.9fr]"><div className="p-7 sm:p-10"><p className="text-xs font-black uppercase tracking-[.18em] text-[#f2bd66]">{isArabic ? "هدية بطابعك" : "A GIFT, YOUR WAY"}</p><h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{isArabic ? "تحويل الفكرة إلى هدية ملموسة" : "Turn your idea into a tangible gift"}</h2><p className="mt-4 max-w-lg text-sm leading-7 text-white/75">{isArabic ? "تتوفر خيارات للمنتج والمقاس والمناسبة والكمية؛ تُرتب تفاصيل الطلب بعناية." : "Choose a product, then share the size, occasion, or quantity so we can prepare your request."}</p><div className="mt-7 flex flex-wrap gap-3"><Button asChild className="bg-[#f2bd66] text-[#17323b] hover:bg-[#ffd282]"><a href={contact.whatsappUrl} target="_blank" rel="noreferrer">{isArabic ? "طلب مخصص" : "Start a custom request"}</a></Button><Button asChild variant="outline" className="border-white/35 bg-transparent text-white hover:bg-white hover:text-[#17323b]"><Link href="/shop?category=boxes-packaging">{isArabic ? "عرض البوكسات" : "Explore boxes"}</Link></Button></div></div><div className="relative min-h-64"><img src={promoImage} alt={isArabic ? "تغليف وهدايا من مطبعة الروعة" : "Al Rawaa packaging and gifts"} width={960} height={640} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#17323b]/40" /></div></div></div></section>
      {catalogSections.slice(2).map(section => <ProductSection key={section.slug} eyebrow={isArabic ? section.copy.eyebrowAr : section.copy.eyebrowEn} title={isArabic ? section.copy.titleAr : section.copy.titleEn} subtitle={isArabic ? section.copy.subtitleAr : section.copy.subtitleEn} products={section.products} viewAllHref={`/shop?category=${section.slug}`} viewAllLabel={isArabic ? "عرض الكل" : "View all"} isMuted={section.copy.muted} />)}
    </>}
    <section className="raed-section-muted"><div className="raed-container grid gap-5 py-11 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="raed-kicker">{isArabic ? "هل لديك فكرة مختلفة؟" : "HAVE A DIFFERENT IDEA?"}</p><h2 className="mt-2 font-display text-2xl text-[#17323b] sm:text-3xl">{isArabic ? "أرسل تفاصيل المناسبة للمساعدة في اختيار الأنسب" : "Share your occasion details and we will help you choose"}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#688086]">{isArabic ? "نساعد في اختيار نوع المنتج والمقاس والتغليف حسب الكمية والمناسبة." : "We can help choose the product, size, and wrapping for your quantity and occasion."}</p></div><Button asChild className="h-11 rounded-md bg-[#16717d] px-5 hover:bg-[#105d67]"><a href={contact.whatsappUrl} target="_blank" rel="noreferrer">{isArabic ? "التواصل معنا" : "Contact us"}<ArrowUpLeft className="h-4 w-4" /></a></Button></div></section>
  </StoreShell>;
}
