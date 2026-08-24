"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag, Phone, MapPin, Instagram, ChevronLeft,
  Truck, Sparkles, Check, Gift, Search, Plus, Minus, Info,
} from "lucide-react";
import { useApp, money, go } from "../core";
import { ProductCard, SectionHead, Reveal, L, FALLBACK, catIcon } from "./bits";
import { BrandWatermark } from "./brand";

/* ================= Static hero banner (replaces slider) ================= */
function HeroBanner() {
  const { logo } = useApp();
  return (
    <div className="rounded-3xl overflow-hidden border border-[#dde2e5] bg-white shadow-[0_34px_68px_-34px_rgba(35,41,46,.45)]">
      <div className="relative h-[200px] sm:h-[330px] lg:h-[360px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/uploads/alrawaa-hero-banner.webp"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
          alt="عيد الاتحاد الإماراتي — هدايا وتغليف وطباعة حسب الطلب"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute end-4 top-4 z-20 bg-[#282e33]/90 border border-white/30 rounded-xl p-1.5 backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="logo" className="w-11 h-11 rounded-lg object-cover" />
        </div>
      </div>
    </div>
  );
}

/* ================= Cups promo banner (under hero) ================= */
function CupsBanner() {
  const { isAr } = useApp();
  return (
    <section className="bg-[#f7f8f9]">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl pb-6 sm:pb-8">
        <Reveal>
          <a href="#/shop" className="block rounded-3xl overflow-hidden border border-[#dde2e5] bg-white shadow-[0_24px_48px_-28px_rgba(35,41,46,.4)] hover:-translate-y-1 hover:shadow-[0_30px_56px_-26px_rgba(35,41,46,.5)] transition-all group">
            <div className="relative h-[198px] sm:h-[280px] lg:h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/uploads/banner-cups-promo-mobile.webp"
                srcSet="/uploads/banner-cups-promo-mobile.webp 900w, /uploads/banner-cups-promo.webp 1600w"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                alt={isAr ? "أكواب ورقية — طباعة إبداعية بجودة عالية" : "Paper cups — creative high-quality printing"}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Marquee() {
  const { isAr } = useApp();
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

/* ================= Home screen ================= */
export function HomeScreen() {
  const { catalog, lang, isAr, settingsVal, whatsapp } = useApp();
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
      <section className="bg-[#f7f8f9] py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl"><HeroBanner /></div>
      </section>
      <Marquee />

      <CupsBanner />

      <section className="bg-white border-b border-[#e5e8ea]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
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

      <section className="bg-[#f6f7f8]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl grid sm:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={i} delay={i * 90}>
              <article className={`flex items-center gap-3.5 py-8 sm:py-10 ${i > 0 ? "sm:border-s sm:border-[#e5e8ea] sm:ps-6" : ""} ${i < 2 ? "border-b sm:border-b-0" : ""}`}>
                <span className={`grid place-items-center w-11 h-11 rounded-xl text-white bg-gradient-to-br ${b.g} shadow-md shrink-0`}>{b.icon}</span>
                <div><h3 className="text-[13px] font-extrabold">{b.t}</h3><p className="text-[11px] text-[#788288] mt-0.5">{b.d}</p></div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <SectionHead eyebrow={isAr ? "مختارات الروعة" : "AL RAWAA PICKS"} title={isAr ? "اختيارات جاهزة لطلبك" : "Ready-to-request picks"} sub={isAr ? "منتجات مختارة للبدء مع خيارات تخصيص." : "Selected products to start with and customize."} href="#/shop" />
          <div className="rail grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-2">
            {featured.map((p, i) => <ProductCard key={p.id} p={p} delay={(i % 5) * 60} />)}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f7f8]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
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

      {sections.map((slug) => {
        const c = cats.find((x) => x.slug === slug);
        if (!c || !byCat(c.id).length) return null;
        const copy = secCopy[slug];
        return (
          <section key={slug} className={copy.muted ? "bg-[#f6f7f8]" : ""}>
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
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
export function ShopScreen({ params }: { params: Record<string, string> }) {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ(params.q ?? "");
     
    setShown(24);
  }, [params.cat, params.q]);

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
      <div className="grid lg:grid-cols-[250px_1fr] gap-6 py-8 sm:py-12 items-start">
        <aside className="bg-white border border-[#e4e7e9] rounded-2xl p-4 lg:sticky lg:top-24">
          <h3 className="text-[12px] font-black tracking-widest uppercase text-[#6c767d] mb-3">{isAr ? "الأقسام" : "Categories"}</h3>
          <div className="grid gap-0.5">
            <button onClick={() => go("#/shop")} className={`flex items-center gap-2.5 w-full text-start rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors ${!active ? "bg-[#eef0f2] text-[#33393e] font-black" : "text-[#454f57] hover:bg-[#f4f6f7]"}`}>
              <span className="grid place-items-center w-[30px] h-[30px] rounded-lg bg-[#eef1f3] text-[#45505a]"><ShoppingBag className="w-3.5 h-3.5" /></span>
              <span className="flex-1">{T("allProducts")}</span>
              <span className="text-[11px] bg-[#f4f6f7] rounded-full px-2 py-0.5 text-[#5c6870]">{(catalog?.products ?? []).length}</span>
            </button>
            {cats.map((c) => (
              <button key={c.id} onClick={() => go(`#/shop?cat=${c.slug}`)} className={`flex items-center gap-2.5 w-full text-start rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors ${active === c.slug ? "bg-[#eef0f2] text-[#33393e] font-black" : "text-[#454f57] hover:bg-[#f4f6f7]"}`}>
                {c.image ? (
                   
                  <img src={c.image} alt="" loading="lazy" className="w-[30px] h-[30px] rounded-lg object-cover shadow-sm" />
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

/* ================= Product screen (SPA) ================= */
export function ProductScreen({ slug }: { slug: string }) {
  const { catalog, lang, isAr, T, cartAdd } = useApp();
  const [qty, setQty] = useState(1);
  const p = (catalog?.products ?? []).find((x) => x.slug === slug);
  if (!p)
    return (
      <div className="container mx-auto px-4 max-w-7xl text-center py-24">
        <h2 className="text-2xl">404</h2>
        <p className="text-[#6c767d] mt-2">{isAr ? "المنتج غير موجود" : "Product not found"}</p>
        <a href="#/shop" className="btn-solid mt-6">{T("allProducts")}</a>
      </div>
    );
  const c = (catalog?.categories ?? []).find((x) => x.id === p.categoryId);
  const price = money(p.price, lang);
  const related = (catalog?.products ?? []).filter((x) => x.categoryId === p.categoryId && x.id !== p.id && x.isAvailable).slice(0, 8);
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
      <nav className="flex items-center flex-wrap gap-1.5 text-[11px] text-[#6c767d] pt-6">
        <a href="#/" className="hover:text-[#33393e]">{T("home")}</a>
        <ChevronLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180 opacity-50" />
        {c && (<><a href={`#/shop?cat=${c.slug}`} className="hover:text-[#33393e]">{L(lang, c.titleAr, c.titleEn)}</a><ChevronLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180 opacity-50" /></>)}
        <span className="text-[#454f57] font-bold">{L(lang, p.titleAr, p.titleEn)}</span>
      </nav>
      <div className="grid md:grid-cols-2 gap-7 py-8 sm:py-12">
        <div className="relative rounded-3xl border border-[#e1e5e8] overflow-hidden bg-[#f0f2f3] aspect-square md:aspect-auto md:min-h-[480px] shadow-[0_18px_34px_-30px_rgba(35,41,46,.9)] self-start">
          { }
          <img src={p.image ?? FALLBACK} alt={L(lang, p.titleAr, p.titleEn)} className="w-full h-full object-cover" />
          <BrandWatermark size="md" />
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
        <section className="py-8 sm:py-12">
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
export function ContactScreen() {
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
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl grid lg:grid-cols-[1.1fr_.9fr] gap-6 py-10">
      <Reveal>
        <div className="bg-white border border-[#e4e7e9] rounded-3xl p-7 shadow-[0_18px_34px_-30px_rgba(35,41,46,.9)] hover:-translate-y-0.5 transition-transform">
          <p className="text-[11px] font-extrabold tracking-[.18em] uppercase text-[#5c6870]">{isAr ? "نحن هنا لمساعدتك" : "WE ARE HERE TO HELP"}</p>
          <h1 className="mt-2 text-2xl sm:text-3xl">{T("contactT")}</h1>
          <p className="text-[13px] text-[#727c83] leading-loose mt-3.5">{T("contactSub")}</p>
          <h2 className="mt-7 text-xl">{T("policyT")}</h2>
          <div className="mt-2">
            {steps.map((s, i) => (
              <div key={i} className={`flex gap-4 py-4 ${i < steps.length - 1 ? "border-b border-dashed border-[#e4e7e9]" : ""}`}>
                <span className="grid place-items-center w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#45505a] to-[#5d6a74] text-white text-[13px] font-black shrink-0">{i + 1}</span>
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
