"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ShoppingBag, Heart, Search, Menu, X, Languages, Phone, MapPin, Instagram,
  ChevronLeft, ChevronRight, Pause, Play, Truck, Sparkles, Check, Gift,
  Plus, Minus, Trash2, ArrowUpLeft, ArrowUpRight, ArrowUp, Info, Send, User,
} from "lucide-react";
import { useApp, money, go, Category, Product } from "./core";

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23eef1f3'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.35em' fill='%23a6b0b6' font-family='sans-serif' font-size='16'%3EAl Rawaa%3C/text%3E%3C/svg%3E";

const ICONS: Record<string, React.ReactNode> = {
  Gift: <Gift className="w-5 h-5" />, Package: <ShoppingBag className="w-5 h-5" />,
  Tag: <TagI />, Stamp: <StampI />, Boxes: <BoxesI />, Paintbrush: <BrushI />,
  Trophy: <TrophyI />, Sparkles: <Sparkles className="w-5 h-5" />,
};
function TagI(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>;}
function StampI(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77z"/><path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"/></svg>;}
function BoxesI(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-9l-4-2.4-4.45 2.7a2 2 0 0 0-.58.62z"/><path d="m17 7-4.45 2.7a2 2 0 0 0-.55.55"/><path d="m22 10-4.45 2.7a2 2 0 0 0-.55.62L17 19v-9l4-2.4a2 2 0 0 1 1 1.71v3.24a2 2 0 0 1-.97 1.71L20 14.63"/></svg>;}
function BrushI(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/></svg>;}
function TrophyI(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;}

const catIcon = (name: string) => ICONS[name] ?? ICONS.Package;
const L = (lang: "ar" | "en", ar?: string | null, en?: string | null) => (lang === "ar" ? ar : en) || ar || en || "";

/* ================= Reveal wrapper ================= */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("in"); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rv ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>;
}

/* ================= Product card ================= */
function ProductCard({ p, delay = 0 }: { p: Product; delay?: number }) {
  const { lang, T, cartAdd } = useApp();
  const price = money(p.price, lang);
  const [fav, setFav] = useState(false);
  return (
    <Reveal delay={delay}>
      <article className={`group relative flex flex-col bg-white border border-[#e1e5e8] rounded-2xl overflow-hidden shadow-[0_18px_34px_-30px_rgba(35,41,46,.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ccd3d7] ${!p.isAvailable ? "opacity-55" : ""}`}>
        <a href={`#/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-[#f0f2f3] pc-shine">
          { }
          <img src={p.image ?? FALLBACK} alt={L(lang, p.titleAr, p.titleEn)} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
          {p.isFeatured && (
            <span className="absolute start-3 top-3 z-[4] inline-flex items-center gap-1 bg-gradient-to-br from-[#e8912d] to-[#f2bd66] text-[#17323b] rounded-full px-2.5 py-1 text-[10px] font-black shadow-lg">
              <Sparkles className="w-3 h-3 text-[#7c5410]" />{T("pick")}
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#23282d]/35 to-transparent pointer-events-none" />
        </a>
        <button
          aria-label="favorite"
          onClick={() => setFav((f) => !f)}
          className={`absolute end-3 top-3 z-[4] grid place-items-center w-8 h-8 rounded-full border border-white/70 transition-colors ${fav ? "bg-[#e8546b] text-white" : "bg-white/95 text-[#57626a] hover:bg-[#45505a] hover:text-white"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${fav ? "fill-current" : ""}`} />
        </button>
        <div className="flex flex-col flex-1 p-3.5">
          <p className="mb-1.5 text-[10px] font-black tracking-wider text-[#5c6870] truncate">{p.category ? L(lang, p.category.titleAr, p.category.titleEn) : T("madeToOrder")}</p>
          <a href={`#/product/${p.slug}`} className="text-[13px] font-extrabold leading-relaxed text-[#33393e] line-clamp-2 min-h-10 hover:text-[#45505a]">{L(lang, p.titleAr, p.titleEn)}</a>
          <div className="mt-auto pt-3 border-t border-[#eef0f2] flex items-center justify-between gap-2">
            {p.isAvailable ? (
              price ? <strong className="text-[13px] font-extrabold text-[#33393e]">{price}</strong> : <span className="text-[11px] font-bold text-[#57626a]">{T("onRequest")}</span>
            ) : (
              <span className="text-[11px] font-bold text-[#a36b6b]">{T("unavailable")}</span>
            )}
            {p.isAvailable && (
              <button onClick={() => cartAdd(p.id)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-gradient-to-br from-[#eef1f3] to-[#e2e7ea] text-[#33393e] text-[11px] font-extrabold transition-all hover:from-[#45505a] hover:to-[#5d6a74] hover:text-white hover:-translate-y-px shadow-sm">
                <ShoppingBag className="w-3.5 h-3.5" />{T("add")}
              </button>
            )}
          </div>
        </div>
        <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-[#45505a] via-[#9aa5ac] to-[#f2bd66] opacity-0 transition-opacity group-hover:opacity-100" />
      </article>
    </Reveal>
  );
}

function SectionHead({ eyebrow, title, sub, href }: { eyebrow: string; title: string; sub?: string; href?: string }) {
  const { T, isAr } = useApp();
  return (
    <Reveal className="flex items-end justify-between gap-4 mb-6">
      <div>
        <p className="kicker flex items-center gap-2 text-[11px] font-extrabold tracking-[.18em] uppercase text-[#5c6870] before:content-[''] before:w-7 before:h-1 before:rounded-full before:bg-gradient-to-l before:from-[#45505a] before:via-[#9aa5ac] before:to-[#f2bd66]">{eyebrow}</p>
        <h2 className="mt-1.5 text-2xl sm:text-3xl leading-snug">{title}</h2>
        {sub && <p className="mt-2 text-[13px] text-[#727c83] max-w-2xl leading-relaxed">{sub}</p>}
      </div>
      {href && (
        <a href={href} className="inline-flex items-center gap-1.5 shrink-0 text-[12px] font-extrabold text-[#33393e] rounded-lg px-3 py-2 hover:bg-[#f4f6f7]">
          {T("viewAll")}{isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </a>
      )}
    </Reveal>
  );
}

/* ================= Home screen ================= */
function HeroCarousel() {
  const { heroSlides, isAr, T, logo } = useApp();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || heroSlides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % heroSlides.length), 4500);
    return () => clearInterval(t);
  }, [paused, heroSlides.length]);
  if (!heroSlides.length)
    return <div className="aspect-[21/9] bg-[#f2f4f5] rounded-2xl" />;
  const s = heroSlides[idx];
  return (
    <div className="rounded-3xl overflow-hidden border border-[#dde2e5] bg-white shadow-[0_34px_68px_-34px_rgba(35,41,46,.45)]">
      <div className="relative min-h-[340px] sm:min-h-[440px]">
        {heroSlides.map((sl, i) => (
          <div key={i} className={`hero-slide absolute inset-0 ${i === idx ? "on" : ""}`}>
            { }
            <img src={sl.image ?? FALLBACK} alt={isAr ? sl.titleAr : sl.titleEn} className="w-full h-full object-cover bg-[#f7f8f9]" />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#1e2328]/85 via-[#1e2328]/30 to-transparent pointer-events-none z-[5]" />
        <div className="absolute end-4 top-4 z-20 bg-[#282e33]/90 border border-white/30 rounded-xl p-1.5 backdrop-blur-sm">
          { }
          <img src={logo} alt="logo" className="w-11 h-11 sm:w-13 sm:h-13 rounded-lg object-cover" />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-15 p-5 sm:p-8 max-w-2xl pointer-events-none">
          <span className="inline-flex bg-gradient-to-br from-[#f2bd66] to-[#ffce85] text-[#17323b] text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full shadow-lg animate-[fadeUp_.5s_.05s_backwards]">{isAr ? s?.badgeAr : s?.badgeEn}</span>
          <h1 className="mt-2.5 text-white text-2xl sm:text-4xl leading-snug drop-shadow-lg animate-[fadeUp_.55s_.12s_backwards]">{isAr ? s?.titleAr : s?.titleEn}</h1>
          <p className="mt-1.5 text-white/95 text-[13px] sm:text-base font-medium max-w-lg leading-relaxed drop-shadow animate-[fadeUp_.55s_.2s_backwards]">{isAr ? s?.subAr : s?.subEn}</p>
          <a href="#/shop" className="btn-gold mt-4 pointer-events-auto animate-[fadeUp_.55s_.28s_backwards]">{T("shopNow")}{isAr ? <ArrowUpLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}</a>
        </div>
      </div>
      <div className="border-t border-[#e0e4e7] bg-white">
        <div className="flex items-center justify-between gap-4 min-h-14 px-4">
          <div className="flex items-center gap-1.5">
            {heroSlides.map((_, i) => (
              <button key={i} aria-label={`slide ${i + 1}`} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-9 bg-gradient-to-l from-[#45505a] to-[#6e7981]" : "w-4 bg-[#c6cdd2] hover:bg-[#a4aeb5]"}`} />
            ))}
          </div>
          <div className="flex gap-1.5">
            <button aria-label="prev" onClick={() => setIdx((i) => (i - 1 + heroSlides.length) % heroSlides.length)} className="grid place-items-center w-9 h-9 rounded-lg border border-[#d2d8db] bg-white text-[#33393e] hover:bg-[#f4f6f7]"><ChevronRight className="w-4 h-4" /></button>
            <button aria-label="next" onClick={() => setIdx((i) => (i + 1) % heroSlides.length)} className="grid place-items-center w-9 h-9 rounded-lg border border-[#d2d8db] bg-white text-[#33393e] hover:bg-[#f4f6f7]"><ChevronLeft className="w-4 h-4" /></button>
            <button aria-label="pause" onClick={() => setPaused((p) => !p)} className="grid place-items-center w-9 h-9 rounded-lg border border-[#d2d8db] bg-white text-[#33393e] hover:bg-[#f4f6f7]">{paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  const { isAr, T } = useApp();
  const items = [
    { icon: <Truck className="w-4 h-4" />, t: isAr ? "توصيل لجميع الإمارات" : "Delivery across the UAE" },
    { icon: <Sparkles className="w-4 h-4" />, t: isAr ? "تصاميم حسب الطلب" : "Made-to-order designs" },
    { icon: <Check className="w-4 h-4" />, t: isAr ? "جودة في كل تفصيلة" : "Quality in every detail" },
    { icon: <Gift className="w-4 h-4" />, t: isAr ? "هدايا بطابعك الخاص" : "Gifts with your personal touch" },
    { icon: <Phone className="w-4 h-4" />, t: isAr ? "تواصل سريع عبر واتساب" : "Fast WhatsApp support" },
  ];
  const seq = [...items, ...items];
  return (
    <div className="bg-[#f4f6f7] border-y border-[#e4e7e9] text-[#4b555d] py-2.5 overflow-hidden" aria-hidden>
      <div className="marquee-track flex w-max">
        {seq.map((x, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 text-[12px] font-extrabold whitespace-nowrap">
            <span className="text-[#9a6b13]">{x.icon}</span>{x.t}
          </span>
        ))}
      </div>
    </div>
  );
}

function HomeScreen() {
  const { catalog, lang, isAr, T, settingsVal, whatsapp } = useApp();
  const cats = catalog?.categories ?? [];
  const prods = (catalog?.products ?? []).filter((p) => p.isAvailable);
  const featured = (prods.filter((p) => p.isFeatured).length ? prods.filter((p) => p.isFeatured) : prods).slice(0, 10);
  const byCat = (cid: number) => prods.filter((p) => p.categoryId === cid).slice(0, 10);
  const sections = ["occasion-stationery", "boxes-packaging", "custom-printing", "stickers-labels", "paper-bags", "promotional-gifts"];
  const secCopy: Record<string, { e: [string, string]; t: [string, string]; s: [string, string]; muted?: boolean }> = {
    "occasion-stationery": { e: ["لحظات لا تُنسى", "MEMORABLE MOMENTS"], t: ["مطبوعات تناسب كل مناسبة", "Print for every occasion"], s: ["بطاقات وتوزيعات وتفاصيل تضيف لمستك الخاصة.", "Cards, favors, and details made for your occasion."] },
    "boxes-packaging": { e: ["تغليف يليق بالهدية", "WRAPPED BEAUTIFULLY"], t: ["بوكسات وتغليف بتفاصيلك", "Boxes and packaging, your way"], s: ["خيارات جاهزة للتخصيص وتجهيز هديتك بأناقة.", "Custom-ready options to present every gift beautifully."], muted: true },
    "custom-printing": { e: ["من فكرتك إلى منتجك", "FROM IDEA TO PRINT"], t: ["طباعة حسب الطلب", "Made-to-order printing"], s: ["اختر المنتج وشارك الفكرة لنرتب التفاصيل معك.", "Choose a product and share your idea; we will handle the details."] },
    "stickers-labels": { e: ["تفاصيل صغيرة، أثر كبير", "SMALL DETAILS, BIG IMPACT"], t: ["ستيكرات وليبلات", "Stickers and labels"], s: ["أضف لمسة مطبوعة مميزة إلى التغليف والهوية.", "Complete every package with a printed finishing touch."], muted: true },
    "paper-bags": { e: ["جاهزة للحمل والإهداء", "READY TO CARRY AND GIFT"], t: ["أكياس ورقية", "Paper bags"], s: ["مقاسات وتصاميم مناسبة لكل طلب.", "Choose the right size and design for your order."] },
    "promotional-gifts": { e: ["هدية تترك انطباعاً", "GIFTS THAT LEAVE AN IMPRESSION"], t: ["هدايا إعلانية", "Promotional gifts"], s: ["حلول مطبوعة تناسب العلامات والمناسبات.", "Printed solutions for brands and occasions."], muted: true },
  };
  const benefits = [
    { icon: <Truck className="w-5 h-5" />, t: isAr ? "توصيل لجميع الإمارات" : "UAE-wide delivery", d: isAr ? "نجهز طلبك بعناية ونوصله" : "Prepared with care and delivered", g: "from-[#8d98a0] to-[#6e7981]" },
    { icon: <Sparkles className="w-5 h-5" />, t: isAr ? "تصاميم حسب الطلب" : "Made to order", d: isAr ? "تفاصيل ومقاسات حسب الطلب" : "Choose the details and size", g: "from-[#b0bac1] to-[#939ea5]" },
    { icon: <Check className="w-5 h-5" />, t: isAr ? "جودة في كل تفصيلة" : "Care in every detail", d: isAr ? "مطبوعات وتغليف بعناية" : "Thoughtful printing and wrapping", g: "from-[#7e8991] to-[#5f6a72]" },
  ];
  const promoImg = settingsVal("promo.image");
  const promoTitle = isAr ? "تحويل الفكرة إلى هدية ملموسة" : "Turn your idea into a tangible gift";
  const promoBody = isAr ? "تتوفر خيارات للمنتج والمقاس والمناسبة والكمية؛ تُرتب تفاصيل الطلب بعناية." : "Choose a product, then share the size, occasion, or quantity so we can prepare your request.";

  return (
    <>
      <section className="bg-[#f7f8f9] py-5">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl"><HeroCarousel /></div>
      </section>
      <Marquee />

      {/* categories */}
      <section className="bg-white border-b border-[#e5e8ea]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[11px] font-extrabold tracking-[.18em] uppercase text-[#5c6870]">{isAr ? "تصفح الأقسام" : "BROWSE CATEGORIES"}</p>
              <h2 className="mt-1.5 text-2xl">{isAr ? "أقسام المتجر" : "Shop by category"}</h2>
            </div>
          </div>
          <div className="rail flex gap-3 overflow-x-auto pb-2">
            {cats.map((c, i) => (
              <Reveal key={c.id} delay={i * 55} className="shrink-0">
                <a href={`#/shop?cat=${c.slug}`} className="flex flex-col gap-2 w-40 bg-white border border-[#e1e5e8] rounded-2xl p-4 transition-all hover:-translate-y-1 hover:border-[#f0c87e] hover:bg-[#fffdf6] hover:shadow-[0_20px_34px_-22px_rgba(35,41,46,.5)]">
                  <span className={`grid place-items-center w-11 h-11 rounded-xl text-white shadow-md transition-transform group-hover:scale-110 bg-gradient-to-br ${["from-[#8d98a0] to-[#6e7981]", "from-[#b0bac1] to-[#939ea5]", "from-[#7e8991] to-[#5f6a72]", "from-[#aab4bb] to-[#8d98a0]", "from-[#6f7a82] to-[#525d65]", "from-[#99a4ab] to-[#7a8590]", "from-[#868f96] to-[#67717a]", "from-[#b7c0c6] to-[#9aa5ac]"][i % 8]}`}>{catIcon(c.icon)}</span>
                  <span className="text-[13px] font-extrabold leading-tight">{L(lang, c.titleAr, c.titleEn)}</span>
                  <span className="text-[11px] text-[#788288] line-clamp-2 leading-relaxed">{L(lang, c.descAr, c.descEn)}</span>
                  <span className="self-start text-[10px] font-extrabold text-[#45505a] bg-[#e7eaec] rounded-full px-2 py-0.5 mt-auto">{(catalog?.products ?? []).filter((p) => p.categoryId === c.id).length} {isAr ? "منتجاً" : "products"}</span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* benefits */}
      <section className="bg-[#f6f7f8]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl grid sm:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={i} delay={i * 90}>
              <article className={`flex items-center gap-3.5 py-6 ${i > 0 ? "sm:border-s sm:border-[#e5e8ea] sm:ps-6" : ""} ${i < 2 ? "border-b sm:border-b-0" : ""}`}>
                <span className={`grid place-items-center w-11 h-11 rounded-xl text-white bg-gradient-to-br ${b.g} shadow-md shrink-0`}>{b.icon}</span>
                <div><h3 className="text-[13px] font-extrabold">{b.t}</h3><p className="text-[11px] text-[#788288] mt-0.5">{b.d}</p></div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* featured */}
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <SectionHead eyebrow={isAr ? "مختارات الروعة" : "AL RAWAA PICKS"} title={isAr ? "اختيارات جاهزة لطلبك" : "Ready-to-request picks"} sub={isAr ? "منتجات مختارة للبدء مع خيارات تخصيص." : "Selected products to start with and customize."} href="#/shop" />
          <div className="rail grid grid-auto-flow-column-dont grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-2">
            {featured.map((p, i) => <ProductCard key={p.id} p={p} delay={(i % 5) * 60} />)}
          </div>
        </div>
      </section>

      {/* promo */}
      <section className="bg-[#f6f7f8]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-9">
          <Reveal>
            <div className="relative grid md:grid-cols-[1.1fr_.9fr] overflow-hidden rounded-3xl border border-[#e4e7e9] bg-gradient-to-br from-white via-[#f2f4f7] to-[#e9edef] shadow-[0_30px_60px_-30px_rgba(35,41,46,.25)]">
              <div className="p-7 sm:p-10 relative z-10">
                <p className="text-[11px] font-extrabold tracking-[.18em] uppercase text-[#9a6b13]">{isAr ? "هدية بطابعك" : "A GIFT, YOUR WAY"}</p>
                <h2 className="mt-2.5 text-2xl sm:text-3xl leading-snug">{promoTitle}</h2>
                <p className="mt-3.5 text-[13px] leading-loose text-[#33393e]/75 max-w-lg">{promoBody}</p>
                <div className="flex flex-wrap gap-3 mt-7">
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn-gold"><Phone className="w-4 h-4" />{isAr ? "طلب مخصص" : "Start a custom request"}</a>
                  <a href="#/shop?cat=boxes-packaging" className="btn-ghost">{isAr ? "عرض البوكسات" : "Explore boxes"}</a>
                </div>
              </div>
              <div className="relative min-h-60">
                { }
                <img src={promoImg || FALLBACK} alt="promo" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#33393e]/35" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* category sections */}
      {sections.map((slug) => {
        const c = cats.find((x) => x.slug === slug);
        if (!c || !byCat(c.id).length) return null;
        const copy = secCopy[slug];
        return (
          <section key={slug} className={copy.muted ? "bg-[#f6f7f8]" : ""}>
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-10">
              <SectionHead eyebrow={copy.e[isAr ? 0 : 1]} title={copy.t[isAr ? 0 : 1]} sub={copy.s[isAr ? 0 : 1]} href={`#/shop?cat=${slug}`} />
              <div className="rail grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-2">
                {byCat(c.id).map((p, i) => <ProductCard key={p.id} p={p} delay={(i % 5) * 60} />)}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}

/* ================= Shop screen ================= */
function ShopScreen({ params }: { params: Record<string, string> }) {
  const { catalog, lang, isAr, T } = useApp();
  const [q, setQ] = useState(params.q ?? "");
  const [sort, setSort] = useState("def");
  const [shown, setShown] = useState(24);
  const cats = catalog?.categories ?? [];
  const active = params.cat ?? null;

  const list = useMemo(() => {
    let l = catalog?.products ?? [];
    if (active) { const c = cats.find((x) => x.slug === active); if (c) l = l.filter((p) => p.categoryId === c.id); }
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      l = l.filter((p) => (p.titleAr || "").toLowerCase().includes(s) || (p.titleEn || "").toLowerCase().includes(s) || (p.descAr || "").toLowerCase().includes(s) || (p.descEn || "").toLowerCase().includes(s));
    }
    if (sort === "pu") l = [...l].sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    else if (sort === "pd") l = [...l].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    else if (sort === "name") l = [...l].sort((a, b) => L(lang, a.titleAr, a.titleEn).localeCompare(L(lang, b.titleAr, b.titleEn), isAr ? "ar" : "en"));
    return l;
  }, [catalog, active, q, sort, lang, isAr, cats]);

  useEffect(() => {
    // sync filters when route params change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ(params.q ?? "");
     
    setShown(24);
  }, [params.cat, params.q]);

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
      <div className="grid lg:grid-cols-[250px_1fr] gap-6 py-8 items-start">
        <aside className="bg-white border border-[#e4e7e9] rounded-2xl p-4 lg:sticky lg:top-24">
          <h3 className="text-[12px] font-black tracking-widest uppercase text-[#6c767d] mb-3">{isAr ? "الأقسام" : "Categories"}</h3>
          <div className="grid gap-0.5">
            <button onClick={() => go("#/shop")} className={`flex items-center gap-2.5 w-full text-start rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors ${!active ? "bg-[#eef0f2] text-[#33393e] font-black" : "text-[#454f57] hover:bg-[#f4f6f7]"}`}>
              <span className="grid place-items-center w-7.5 h-7.5 p-1 rounded-lg bg-[#eef1f3] text-[#45505a]"><ShoppingBag className="w-3.5 h-3.5" /></span>
              <span className="flex-1">{T("allProducts")}</span>
              <span className="text-[11px] bg-[#f4f6f7] rounded-full px-2 py-0.5 text-[#5c6870]">{(catalog?.products ?? []).length}</span>
            </button>
            {cats.map((c) => (
              <button key={c.id} onClick={() => go(`#/shop?cat=${c.slug}`)} className={`flex items-center gap-2.5 w-full text-start rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors ${active === c.slug ? "bg-[#eef0f2] text-[#33393e] font-black" : "text-[#454f57] hover:bg-[#f4f6f7]"}`}>
                {c.image ? (
                   
                  <img src={c.image} alt="" loading="lazy" className="w-7.5 h-7.5 w-[30px] h-[30px] rounded-lg object-cover shadow-sm" />
                ) : (
                  <span className="grid place-items-center w-[30px] h-[30px] rounded-lg bg-[#eef1f3] text-[#45505a]">{catIcon(c.icon)}</span>
                )}
                <span className="flex-1 truncate">{L(lang, c.titleAr, c.titleEn)}</span>
                <span className={`text-[11px] rounded-full px-2 py-0.5 ${active === c.slug ? "bg-[#45505a] text-white" : "bg-[#f4f6f7] text-[#5c6870]"}`}>{(catalog?.products ?? []).filter((p) => p.categoryId === c.id).length}</span>
              </button>
            ))}
          </div>
        </aside>
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="text-[12px] font-extrabold text-[#6c767d]">{isAr ? `${list.length} منتجاً` : `${list.length} products`}</span>
            <div className="flex-1 min-w-48 max-w-md flex items-center gap-2 h-11 rounded-xl border border-[#e1e5e8] bg-[#f7f8f9] px-3.5 focus-within:border-[#45505a] focus-within:bg-white transition-colors">
              <Search className="w-4 h-4 text-[#626d74]" />
              <input value={q} onChange={(e) => { setQ(e.target.value); setShown(24); }} placeholder={T("searchPh")} className="flex-1 bg-transparent outline-none text-[13px] min-w-0" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-xl border border-[#e1e5e8] bg-[#f7f8f9] px-3.5 text-[13px] font-bold text-[#454f57] outline-none cursor-pointer">
              <option value="def">{T("sortDef")}</option>
              <option value="pu">{T("sortPriceUp")}</option>
              <option value="pd">{T("sortPriceDown")}</option>
              <option value="name">{T("sortName")}</option>
            </select>
          </div>
          {list.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-gradient-to-br from-[#eef1f3] to-[#e6e9eb] text-[#45505a] shadow-md"><Search className="w-7 h-7" /></div>
              <h3 className="mt-5 text-xl">{T("shopNoFound")}</h3>
              <p className="text-[13px] text-[#6c767d] mt-2">{T("shopNoFoundSub")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {list.slice(0, shown).map((p, i) => <ProductCard key={p.id} p={p} delay={(i % 8) * 45} />)}
              </div>
              {list.length > shown && (
                <div className="text-center mt-7">
                  <button onClick={() => setShown((s) => s + 24)} className="btn-ghost">{T("loadMore")}</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= Product screen ================= */
function ProductScreen({ slug }: { slug: string }) {
  const { catalog, lang, isAr, T, cartAdd } = useApp();
  const [qty, setQty] = useState(1);
  const p = (catalog?.products ?? []).find((x) => x.slug === slug);
  if (!p)
    return (
      <div className="container mx-auto px-4 max-w-6xl text-center py-24">
        <h2 className="text-2xl">404</h2>
        <p className="text-[#6c767d] mt-2">{isAr ? "المنتج غير موجود" : "Product not found"}</p>
        <a href="#/shop" className="btn-solid mt-6">{T("allProducts")}</a>
      </div>
    );
  const c = (catalog?.categories ?? []).find((x) => x.id === p.categoryId);
  const price = money(p.price, lang);
  const related = (catalog?.products ?? []).filter((x) => x.categoryId === p.categoryId && x.id !== p.id && x.isAvailable).slice(0, 8);
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
      <nav className="flex items-center flex-wrap gap-1.5 text-[11px] text-[#6c767d] pt-6">
        <a href="#/" className="hover:text-[#33393e]">{T("home")}</a>
        <ChevronLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180 opacity-50" />
        {c && (<><a href={`#/shop?cat=${c.slug}`} className="hover:text-[#33393e]">{L(lang, c.titleAr, c.titleEn)}</a><ChevronLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180 opacity-50" /></>)}
        <span className="text-[#454f57] font-bold">{L(lang, p.titleAr, p.titleEn)}</span>
      </nav>
      <div className="grid md:grid-cols-2 gap-7 py-8">
        <div className="relative rounded-3xl border border-[#e1e5e8] overflow-hidden bg-[#f0f2f3] aspect-square md:aspect-auto md:min-h-[480px] shadow-[0_18px_34px_-30px_rgba(35,41,46,.9)] self-start">
          { }
          <img src={p.image ?? FALLBACK} alt={L(lang, p.titleAr, p.titleEn)} className="w-full h-full object-cover" />
          {p.isFeatured && <span className="absolute start-4 top-4 z-10 inline-flex items-center gap-1 bg-gradient-to-br from-[#e8912d] to-[#f2bd66] text-[#17323b] rounded-full px-3 py-1.5 text-[10px] font-black shadow-lg"><Sparkles className="w-3 h-3 text-[#7c5410]" />{T("pick")}</span>}
        </div>
        <div>
          <p className="text-[11px] font-extrabold tracking-[.12em] uppercase text-[#5c6870]">{c ? L(lang, c.titleAr, c.titleEn) : T("madeToOrder")}</p>
          <h1 className="mt-2.5 text-2xl sm:text-4xl leading-snug">{L(lang, p.titleAr, p.titleEn)}</h1>
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            {p.isAvailable ? (
              price ? <span className="text-3xl font-bold">{price}</span> : <span className="text-sm font-extrabold text-[#57626a] bg-[#eef0f2] px-4 py-2 rounded-full">{T("onRequest")}</span>
            ) : (
              <span className="text-sm font-extrabold text-[#a33333] bg-[#fbe9e9] px-4 py-2 rounded-full">{T("unavailable")}</span>
            )}
            <span className="inline-flex items-center gap-1.5 bg-[#f4f6f7] text-[#33393e] text-[11px] font-extrabold rounded-full px-3.5 py-2">{c ? L(lang, c.titleAr, c.titleEn) : T("madeToOrder")}</span>
          </div>
          {(p.descAr || p.descEn) && <p className="mt-5 text-sm leading-loose text-[#566169] border-t border-dashed border-[#e4e7e9] pt-5">{L(lang, p.descAr, p.descEn)}</p>}
          {p.isAvailable && (
            <>
              <div className="flex items-center gap-4 mt-7 flex-wrap">
                <span className="text-[13px] font-extrabold">{T("qty")}</span>
                <div className="inline-flex items-center rounded-xl border border-[#e0e4e6] overflow-hidden bg-white">
                  <button aria-label="minus" onClick={() => setQty((v) => Math.max(1, v - 1))} className="grid place-items-center w-10 h-11 hover:bg-[#f4f6f7]"><Minus className="w-4 h-4" /></button>
                  <span className="grid place-items-center min-w-11 h-11 text-sm font-extrabold">{qty}</span>
                  <button aria-label="plus" onClick={() => setQty((v) => v + 1)} className="grid place-items-center w-10 h-11 hover:bg-[#f4f6f7]"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={() => cartAdd(p.id, qty)} className="btn-solid min-w-48"><ShoppingBag className="w-4 h-4" />{T("addToCart")}</button>
                <a href={`https://wa.me/971521401021?text=${encodeURIComponent((isAr ? "مرحباً، أستفسر عن: " : "Hello, I'm asking about: ") + L(lang, p.titleAr, p.titleEn))}`} target="_blank" rel="noreferrer" className="btn-ghost"><Phone className="w-4 h-4" />{T("waOrder")}</a>
              </div>
            </>
          )}
          <div className="flex gap-2.5 items-start bg-[#f4f6f7] rounded-xl p-4 text-[12px] leading-relaxed text-[#727c83] mt-7">
            <Info className="w-4 h-4 text-[#45505a] mt-0.5 shrink-0" />
            <span>{T("pdNote")}</span>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="py-6 pb-12">
          <SectionHead eyebrow={isAr ? "اكتشف المزيد" : "KEEP EXPLORING"} title={T("related")} href={c ? `#/shop?cat=${c.slug}` : "#/shop"} />
          <div className="rail grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-2">
            {related.map((r, i) => <ProductCard key={r.id} p={r} delay={(i % 4) * 60} />)}
          </div>
        </section>
      )}
    </div>
  );
}

/* ================= Contact screen ================= */
function ContactScreen() {
  const { isAr, T, whatsapp, settingsVal } = useApp();
  const phone = settingsVal("contact.phone") || "0521401021";
  const ig = settingsVal("contact.instagram") || "alro3a.gifts";
  const addr = settingsVal("contact.address") || (isAr ? "عجمان، الروضة 3" : "Al Rawda 3, Ajman");
  const steps = [
    { t: isAr ? "أضف المنتجات إلى سلة الطلب" : "Add products to the cart", d: isAr ? "تصفح الأقسام وأضف ما يعجبك." : "Browse categories and add what you like." },
    { t: isAr ? "أرسل الطلب مع اسمك ورقمك" : "Send the request with your details", d: isAr ? "يُحفظ الطلب في قاعدة بيانات المتجر فوراً." : "It is saved to the store database instantly." },
    { t: isAr ? "نؤكد التفاصيل والسعر" : "We confirm details and price", d: isAr ? "نتفق على المقاس والكمية والسعر النهائي." : "We agree on size, quantity and final price." },
    { t: isAr ? "التنفيذ والتوصيل" : "Production & delivery", d: isAr ? "ننفذ طلبك بعناية ونوصله لجميع الإمارات." : "Crafted with care and delivered across the UAE." },
  ];
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl grid lg:grid-cols-[1.1fr_.9fr] gap-6 py-10">
      <Reveal>
        <div className="bg-white border border-[#e4e7e9] rounded-3xl p-7 shadow-[0_18px_34px_-30px_rgba(35,41,46,.9)] hover:-translate-y-0.5 transition-transform">
          <p className="text-[11px] font-extrabold tracking-[.18em] uppercase text-[#5c6870]">{isAr ? "نحن هنا لمساعدتك" : "WE ARE HERE TO HELP"}</p>
          <h1 className="mt-2 text-2xl sm:text-3xl">{T("contactT")}</h1>
          <p className="text-[13px] text-[#727c83] leading-loose mt-3.5">{T("contactSub")}</p>
          <h2 className="mt-7 text-xl">{T("policyT")}</h2>
          <div className="mt-2">
            {steps.map((s, i) => (
              <div key={i} className={`flex gap-4 py-4 ${i < steps.length - 1 ? "border-b border-dashed border-[#e4e7e9]" : ""}`}>
                <span className="grid place-items-center w-8.5 h-8.5 w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#45505a] to-[#5d6a74] text-white text-[13px] font-black shrink-0">{i + 1}</span>
                <div><h3 className="text-[14px] font-extrabold">{s.t}</h3><p className="text-[12px] text-[#727c83] leading-relaxed mt-1">{s.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="bg-white border border-[#e4e7e9] rounded-3xl p-7 shadow-[0_18px_34px_-30px_rgba(35,41,46,.9)]">
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 border border-[#e4e7e9] rounded-2xl p-4 mt-3 hover:border-[#ccd3d7] hover:bg-[#f7f8f9] transition-colors">
            <span className="text-white bg-gradient-to-br from-[#8d98a0] to-[#6e7981] p-2.5 rounded-xl shadow-md"><Phone className="w-5 h-5" /></span>
            <div><b className="block text-[13px]">{T("phone")}</b><span dir="ltr" className="text-[12px] text-[#6c767d]">{phone}</span></div>
          </a>
          <div className="flex items-center gap-3.5 border border-[#e4e7e9] rounded-2xl p-4 mt-3">
            <span className="text-white bg-gradient-to-br from-[#b0bac1] to-[#939ea5] p-2.5 rounded-xl shadow-md"><MapPin className="w-5 h-5" /></span>
            <div><b className="block text-[13px]">{T("address")}</b><span className="text-[12px] text-[#6c767d]">{addr}</span></div>
          </div>
          <a href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 border border-[#e4e7e9] rounded-2xl p-4 mt-3 hover:border-[#ccd3d7] hover:bg-[#f7f8f9] transition-colors">
            <span className="text-white bg-gradient-to-br from-[#7e8991] to-[#5f6a72] p-2.5 rounded-xl shadow-md"><Instagram className="w-5 h-5" /></span>
            <div><b className="block text-[13px]">{T("follow")}</b><span className="text-[12px] text-[#6c767d]">@{ig}</span></div>
          </a>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn-solid w-full mt-6"><Phone className="w-4 h-4" />{T("waCTA")}</a>
          <p className="text-[11px] text-[#6c767d] text-center leading-relaxed mt-4">{T("fDeliver")}</p>
        </div>
      </Reveal>
    </div>
  );
}

/* ================= Cart drawer ================= */
function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, cartSet, cartRemove, cartClear, cartCount, cartTotal, catalog, lang, isAr, T, whatsapp } = useApp();
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const byId = useMemo(() => new Map((catalog?.products ?? []).map((p) => [p.id, p])), [catalog]);
  const items = cart.map((i) => ({ i, p: byId.get(i.id) })).filter((x) => x.p);
  const price = money(cartTotal, lang);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const { api } = await import("./core");
      const res = await api.createOrder({ name, phone, notes, lang, items: cart.map((i) => ({ productId: i.id, qty: i.qty })) });
      if (!res) throw new Error();
      const lines = items.map(({ i, p }) => `• ${L(lang, p!.titleAr, p!.titleEn)} × ${i.qty}`).join("\n");
      const msg = isAr
        ? `مرحباً مطبعة الروعة، أرسلت طلباً جديداً (${res.order.ref})\nالاسم: ${name}\nالهاتف: ${phone}\n\nالمنتجات:\n${lines}\n\nالتفاصيل: ${notes || "—"}`
        : `Hello Al Rawaa Printing, new request (${res.order.ref})\nName: ${name}\nPhone: ${phone}\n\nProducts:\n${lines}\n\nNotes: ${notes || "—"}`;
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
      cartClear(); setCheckout(false); onClose();
      setName(""); setPhone(""); setNotes("");
      alert(isAr ? `تم حفظ طلبك بنجاح — رقم الطلب: ${res.order.ref}` : `Request saved — ref: ${res.order.ref}`);
    } catch {
      alert(T("submitErr"));
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal>
      <button aria-label="close" onClick={onClose} className="absolute inset-0 bg-[#1e2328]/55 backdrop-blur-[1px]" />
      <aside className="absolute inset-y-0 end-0 flex flex-col w-full max-w-md bg-[#f6f7f8] shadow-2xl animate-[drawerIn_.38s_cubic-bezier(.22,1,.36,1)]">
        <style>{`@keyframes drawerIn{from{transform:translateX(var(--dx,-24%));opacity:0}to{transform:none;opacity:1}}`}</style>
        <header className="flex items-center justify-between bg-white border-b border-[#e0e4e6] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-[#e7eaec] text-[#45505a]"><ShoppingBag className="w-5 h-5" /></span>
            <div>
              <h2 className="text-xl">{checkout ? T("sendTitle") : T("cartTitle")}</h2>
              <p className="text-[11px] text-[#6c767d]">{cartCount} {T("itemsSel")}</p>
            </div>
          </div>
          <button onClick={onClose} className="grid place-items-center w-10 h-10 rounded-full hover:bg-[#e7eaec]"><X className="w-5 h-5" /></button>
        </header>
        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-gradient-to-br from-[#eef1f3] to-[#e6e9eb] text-[#45505a] shadow-md"><ShoppingBag className="w-7 h-7" /></div>
              <h3 className="mt-5 text-xl">{T("cartEmpty")}</h3>
              <p className="text-[13px] text-[#6c767d] mt-2 leading-relaxed">{T("cartEmptySub")}</p>
              <button onClick={() => { onClose(); go("#/shop"); }} className="btn-ghost mt-6">{T("browse")}</button>
            </div>
          </div>
        ) : checkout ? (
          <form onSubmit={submit} className="flex-1 flex flex-col gap-3 overflow-y-auto p-5">
            <div className="bg-white border border-[#e0e4e6] rounded-xl p-4">
              <b className="text-[13px]">{T("prodSummary")}</b>
              {items.map(({ i, p }) => (
                <div key={i.id} className="flex justify-between gap-3 text-[11px] text-[#5d6870] mt-2">
                  <span className="line-clamp-1">{L(lang, p!.titleAr, p!.titleEn)} × {i.qty}</span>
                  <span>{money(p!.price ? p!.price * i.qty : 0, lang) ?? T("onConfirm")}</span>
                </div>
              ))}
              {price && <div className="flex justify-between text-[12px] font-extrabold text-[#33393e] mt-3 pt-3 border-t border-[#eef0f2]"><span>{T("estTotal")}</span><span>{price}</span></div>}
            </div>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={T("namePh")} className="fld" />
            <input required inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={T("phonePh")} className="fld" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={T("notesPh")} className="fld-area" />
            <p className="text-[11px] leading-relaxed text-[#6c767d]">{T("cartFootNote")}</p>
            <div className="mt-auto grid gap-2.5 pt-4">
              <button type="submit" disabled={sending} className="btn-solid w-full"><Send className="w-4 h-4" />{sending ? T("sending") : T("submitBtn")}</button>
              <button type="button" onClick={() => setCheckout(false)} className="text-[12px] font-extrabold text-[#45505a] hover:underline">{T("backCart")}</button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 grid gap-3.5 content-start">
              {items.map(({ i, p }) => (
                <article key={i.id} className="flex gap-3 bg-white border border-[#e0e4e6] rounded-xl p-3">
                  { }
                  <img src={p!.image ?? FALLBACK} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2">
                      <h3 className="flex-1 text-[13px] font-extrabold leading-snug line-clamp-2">{L(lang, p!.titleAr, p!.titleEn)}</h3>
                      <button onClick={() => cartRemove(i.id)} aria-label="remove" className="text-[#a36b6b] hover:bg-[#fdf0f0] rounded-lg w-7 h-7 grid place-items-center"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-[11px] font-extrabold text-[#45505a] mt-1">{money(p!.price, lang) ?? T("onConfirm")}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="inline-flex items-center rounded-lg border border-[#e0e4e6]">
                        <button onClick={() => cartSet(i.id, i.qty - 1)} className="grid place-items-center w-7 h-7"><Minus className="w-3 h-3" /></button>
                        <span className="grid place-items-center min-w-7 h-7 text-[11px] font-extrabold">{i.qty}</span>
                        <button onClick={() => cartSet(i.id, i.qty + 1)} className="grid place-items-center w-7 h-7"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="text-[12px] font-extrabold">{money(p!.price ? p!.price * i.qty : 0, lang) ?? ""}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <footer className="bg-white border-t border-[#e0e4e6] p-5">
              <div className="flex items-center justify-between text-sm font-extrabold"><span>{T("estTotal")}</span><strong className="text-[#33393e] text-base">{price ?? T("onRequest")}</strong></div>
              <p className="text-[11px] leading-relaxed text-[#6c767d] mt-2">{T("cartFootNote")}</p>
              <button onClick={() => setCheckout(true)} className="btn-solid w-full mt-3.5">{T("continueSend")}</button>
              <button onClick={cartClear} className="w-full mt-2.5 text-[11px] font-extrabold text-[#b26b8f] hover:underline">{T("clearCart")}</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

/* ================= Store shell (header/footer/routes) ================= */
export default function Storefront() {
  const { lang, isAr, T, toggleLang, cartCount, catalog, catalogLoading, whatsapp, settingsVal, logo } = useApp();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hash, setHash] = useState("");
  const [showTop, setShowTop] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    // hydrate hash on mount (SSR-safe)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHash(window.location.hash || "#");
  }, []);

  useEffect(() => {
    const onHash = () => { setHash(window.location.hash || "#"); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const route = hash.replace(/^#\/?/, "");
  const [path, qs] = route.split("?");
  const params: Record<string, string> = {};
  if (qs) for (const kv of qs.split("&")) { const [k, v] = kv.split("="); if (k) params[k] = decodeURIComponent(v ?? ""); }
  const seg = path.split("/").filter(Boolean);

  const cats = catalog?.categories ?? [];
  const siteName = settingsVal("site.name") || (isAr ? "مطبعة الروعة" : "Al Rawaa Printing");
  const tagline = settingsVal("site.tagline") || T("tagline");
  const addr = settingsVal("contact.address") || (isAr ? "عجمان، الروضة 3" : "Al Rawda 3, Ajman");
  const phone = settingsVal("contact.phone") || "0521401021";

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const s = search.trim().toLowerCase();
    return (catalog?.products ?? []).filter((p) => (p.titleAr || "").toLowerCase().includes(s) || (p.titleEn || "").toLowerCase().includes(s)).slice(0, 8);
  }, [search, catalog]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#33393e]">
      {/* topbar — dark charcoal touch */}
      <div className="bg-gradient-to-l from-[#1e2328] via-[#23282d] to-[#2c343b] border-b border-black/20 text-[#c9d1d6] text-[11.5px] font-semibold py-1.5 shadow-[inset_0_-1px_0_rgba(255,255,255,.04)]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex items-center justify-between gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#f2bd66]" />{addr}</span>
          <div className="flex items-center gap-4">
            <a href="#/contact" className="hover:text-[#f2bd66] transition-colors">{T("policy")}</a>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#f2bd66] transition-colors"><Phone className="w-3.5 h-3.5 text-[#f2bd66]" /><span dir="ltr">{phone}</span></a>
            <button onClick={toggleLang} className="inline-flex items-center gap-1.5 font-extrabold hover:text-[#f2bd66] transition-colors"><Languages className="w-3.5 h-3.5" />{isAr ? "English" : "العربية"}</button>
          </div>
        </div>
      </div>

      {/* header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#d5dbdf] shadow-[0_10px_32px_-14px_rgba(30,35,40,.35)]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex items-center gap-2.5 min-h-16 py-2">
          <a href="#/" className="flex items-center gap-2.5 shrink-0">
            { }
            <img src={logo} alt="logo" className="w-11 h-11 rounded-xl object-cover ring-1 ring-[#e0e4e6] transition-transform hover:rotate-[-8deg] hover:scale-105" />
            <div className="hidden sm:block leading-tight">
              <b className="block text-lg">{siteName}</b>
              <span className="block text-[9px] font-extrabold tracking-[.14em] uppercase text-[#6a757d]">{tagline}</span>
            </div>
          </a>
          {/* desktop search */}
          <div className="hidden lg:flex flex-1 relative">
            <div className="flex items-center gap-2 w-full h-11 rounded-xl border border-[#e1e5e8] bg-[#f7f8f9] px-3.5 focus-within:border-[#45505a] focus-within:bg-white transition-colors">
              <Search className="w-4 h-4 text-[#626d74]" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder={T("searchPh")} className="flex-1 bg-transparent outline-none text-[13px]" />
            </div>
            {searchOpen && search.trim() && (
              <div className="absolute top-full mt-2 inset-x-0 bg-white border border-[#e4e7e9] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="p-5 text-center text-[13px] text-[#6c767d]">{T("noResults")}</div>
                ) : results.map((p) => (
                  <a key={p.id} href={`#/product/${p.slug}`} onClick={() => { setSearch(""); setSearchOpen(false); }} className="flex items-center gap-3 p-2.5 border-b border-[#eef0f2] last:border-0 hover:bg-[#f4f6f7]">
                    { }
                    <img src={p.image ?? FALLBACK} alt="" className="w-11 h-11 rounded-lg object-cover" />
                    <div>
                      <div className="text-[13px] font-extrabold truncate">{L(lang, p.titleAr, p.titleEn)}</div>
                      <div className="text-[11px] font-bold text-[#5c6870] mt-0.5">{money(p.price, lang) ?? T("onRequest")}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="ms-auto flex items-center gap-1">
            <a href="#/admin" className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-[12px] font-extrabold text-[#626d74] hover:bg-[#f4f6f7]"><User className="w-4.5 h-4.5 w-[18px] h-[18px]" />{T("account")}</a>
            <button onClick={() => setCartOpen(true)} className="relative inline-flex items-center gap-2 h-10 px-3.5 rounded-xl text-white text-[12px] font-extrabold bg-gradient-to-br from-[#45505a] to-[#5d6a74] shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{T("cart")}</span>
              {cartCount > 0 && <span className="grid place-items-center min-w-5 h-5 px-1 rounded-full bg-[#f2bd66] text-[#17323b] text-[10px] font-extrabold">{cartCount}</span>}
            </button>
            <button aria-label="menu" onClick={() => setMenuOpen(true)} className="lg:hidden grid place-items-center w-10 h-10 rounded-xl border border-[#dee3e5] bg-white"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
        {/* desktop nav */}
        <nav className="hidden lg:block border-t border-[#eef0f2] bg-white">
          <div className="container mx-auto px-6 max-w-6xl flex items-center justify-center gap-1 overflow-x-auto">
            <a href="#/shop" className={`px-4.5 px-5 py-3 text-[13px] font-extrabold transition-colors border-b-2 ${seg[0] === "shop" && !params.cat ? "border-[#45505a] text-[#33393e] bg-white" : "border-transparent text-[#566169] hover:bg-white hover:text-[#33393e]"}`}>{T("allProducts")}</a>
            {cats.map((c) => (
              <a key={c.id} href={`#/shop?cat=${c.slug}`} className={`px-4 py-3 text-[13px] font-extrabold transition-colors border-b-2 shrink-0 ${params.cat === c.slug ? "border-[#45505a] text-[#33393e] bg-white" : "border-transparent text-[#566169] hover:bg-white hover:text-[#33393e]"}`}>{L(lang, c.titleAr, c.titleEn)}</a>
            ))}
          </div>
        </nav>
      </header>

      {/* main */}
      <main className="flex-1">
        {catalogLoading ? (
          <div className="container mx-auto px-4 max-w-6xl py-16 grid place-items-center">
            <div className="w-10 h-10 rounded-full border-[3px] border-[#e4e7e9] border-t-[#45505a] animate-spin" />
          </div>
        ) : seg.length === 0 ? (
          <HomeScreen />
        ) : seg[0] === "shop" ? (
          <ShopScreen params={params} />
        ) : seg[0] === "product" && seg[1] ? (
          <ProductScreen slug={seg[1]} />
        ) : seg[0] === "contact" ? (
          <ContactScreen />
        ) : (
          <div className="container mx-auto px-4 max-w-6xl text-center py-24">
            <h2 className="text-2xl">404</h2>
            <a href="#/" className="btn-solid mt-6">{T("home")}</a>
          </div>
        )}
      </main>

      {/* footer — dark premium redesign */}
      <footer className="mt-14 bg-gradient-to-b from-[#333a40] via-[#23282d] to-[#181d21] text-[#c9d1d6] relative overflow-hidden">
        {/* top gold accent line */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-l from-[#45505a] via-[#8a959c] to-[#f2bd66]" />
        {/* decorative glow */}
        <div className="absolute -top-24 -end-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(242,189,102,.12),transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-28 -start-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.05),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
          {/* brand row */}
          <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm p-1">
                  { }
                  <img src={logo} alt="" className="w-full h-full rounded-xl object-cover" />
                </span>
                <div>
                  <span className="block text-xl text-white">{siteName}</span>
                  <span className="block text-[10px] font-extrabold tracking-[.16em] uppercase text-[#f2bd66]">{tagline}</span>
                </div>
              </div>
              <p className="mt-5 max-w-md text-[13px] leading-loose text-[#a7b1b8]">{T("fAbout")}</p>
              <a href={`https://instagram.com/${settingsVal("contact.instagram") || "alro3a.gifts"}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-[13px] font-extrabold text-[#f2bd66] hover:text-white transition-colors"><Instagram className="w-4 h-4" />@{settingsVal("contact.instagram") || "alro3a.gifts"}</a>
            </div>

            <div>
              <h3 className="font-extrabold text-[#f2bd66] text-[13px] flex items-center gap-2 before:content-[''] before:w-4 before:h-[3px] before:rounded-full before:bg-[#f2bd66]">{T("fExplore")}</h3>
              <nav className="grid gap-3 mt-4 text-[13px]">
                <a href="#/" className="text-[#a7b1b8] hover:text-white hover:ps-1 transition-all">{T("fHome")}</a>
                <a href="#/shop" className="text-[#a7b1b8] hover:text-white hover:ps-1 transition-all">{T("allProducts")}</a>
                {cats.slice(0, 3).map((c) => <a key={c.id} href={`#/shop?cat=${c.slug}`} className="text-[#a7b1b8] hover:text-white hover:ps-1 transition-all">{L(lang, c.titleAr, c.titleEn)}</a>)}
              </nav>
            </div>

            <div>
              <h3 className="font-extrabold text-[#f2bd66] text-[13px] flex items-center gap-2 before:content-[''] before:w-4 before:h-[3px] before:rounded-full before:bg-[#f2bd66]">{T("fHelp")}</h3>
              <nav className="grid gap-3 mt-4 text-[13px]">
                <a href="#/contact" className="text-[#a7b1b8] hover:text-white hover:ps-1 transition-all">{T("policy")}</a>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="text-[#a7b1b8] hover:text-white hover:ps-1 transition-all">{isAr ? "طلب مخصص عبر واتساب" : "Custom request on WhatsApp"}</a>
                <button onClick={() => setCartOpen(true)} className="text-start text-[#a7b1b8] hover:text-white hover:ps-1 transition-all">{T("cart")}</button>
                <a href="#/admin" className="text-[#a7b1b8] hover:text-white hover:ps-1 transition-all">{T("account")}</a>
              </nav>
            </div>

            <div>
              <h3 className="font-extrabold text-[#f2bd66] text-[13px] flex items-center gap-2 before:content-[''] before:w-4 before:h-[3px] before:rounded-full before:bg-[#f2bd66]">{T("fContact")}</h3>
              <div className="grid gap-4 mt-4 text-[13px] leading-relaxed">
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex gap-3 items-start group">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/10 ring-1 ring-white/15 text-[#f2bd66] shrink-0 group-hover:bg-[#f2bd66] group-hover:text-[#23282d] transition-colors"><Phone className="w-4 h-4" /></span>
                  <span className="pt-1"><span dir="ltr" className="block text-white font-bold">{phone}</span><span className="text-[11px] text-[#8a959c]">{isAr ? "اتصال / واتساب" : "Call / WhatsApp"}</span></span>
                </a>
                <div className="flex gap-3 items-start">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/10 ring-1 ring-white/15 text-[#f2bd66] shrink-0"><MapPin className="w-4 h-4" /></span>
                  <span className="pt-1 text-[#a7b1b8]">{addr}<br /><span className="text-[11px] text-[#8a959c]">{T("fDeliver")}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* bottom bar */}
          <div className="border-t border-white/10 py-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-[#8a959c]">© {new Date().getFullYear()} <span className="text-[#c9d1d6] font-bold">{siteName}</span> — {T("fRights")}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#8a959c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2bd66]"></span>
              {isAr ? "صُنع بعناية في الإمارات" : "Crafted with care in the UAE"}
            </div>
          </div>
        </div>
      </footer>

      {/* mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] bg-[#1e2328]/50 backdrop-blur-sm p-3 flex items-start justify-center" onClick={() => setMenuOpen(false)}>
          <div className="w-full max-w-md max-h-full overflow-y-auto bg-white rounded-3xl p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#e4e8ea] pb-4">
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#6a757d]">AL RAWAA GIFTS</p>
                <b className="block text-xl mt-1">{T("allProducts")}</b>
              </div>
              <button onClick={() => setMenuOpen(false)} className="grid place-items-center w-10 h-10 rounded-full bg-[#eef1f3] text-[#33393e]"><X className="w-5 h-5" /></button>
            </div>
            <nav className="grid gap-0.5 py-5">
              <a href="#/shop" onClick={() => setMenuOpen(false)} className="rounded-xl bg-[#eef0f2] px-4 py-3 text-[14px] font-black text-[#33393e]">{T("allProducts")}</a>
              {cats.map((c) => (
                <a key={c.id} href={`#/shop?cat=${c.slug}`} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-[14px] font-extrabold text-[#454f57] hover:bg-[#f4f6f7]">{L(lang, c.titleAr, c.titleEn)}</a>
              ))}
              <a href="#/contact" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-[14px] font-extrabold text-[#454f57] hover:bg-[#f4f6f7]">{T("policy")}</a>
            </nav>
            <button onClick={() => { setMenuOpen(false); setCartOpen(true); }} className="btn-solid w-full h-12"><ShoppingBag className="w-4 h-4" />{isAr ? "فتح سلة الطلب" : "Open request cart"}</button>
          </div>
        </div>
      )}

      {/* floating actions */}
      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="whatsapp" className="fab-pulse fixed end-4 bottom-4 z-55 z-[55] grid place-items-center w-13 h-13 w-[52px] h-[52px] rounded-full text-white bg-gradient-to-br from-[#45505a] to-[#5d6a74] shadow-xl hover:-translate-y-1 hover:scale-105 transition-transform"><Phone className="w-6 h-6" /></a>
      {showTop && (
        <button aria-label="top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed end-4 bottom-20 z-[55] grid place-items-center w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#33393e] to-[#45505a] text-[#f2bd66] shadow-xl hover:-translate-y-1 transition-transform"><ArrowUp className="w-5 h-5" /></button>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
