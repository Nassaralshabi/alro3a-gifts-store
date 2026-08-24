"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Search, Menu, X, Languages, Phone, MapPin, Instagram, User, ArrowUp } from "lucide-react";
import { useApp, money } from "./core";
import { FALLBACK, L } from "./store/bits";
import { BRAND_WORDMARK } from "./store/brand";
import { HomeScreen, ShopScreen, ProductScreen, ContactScreen } from "./store/screens";
import { CartDrawer } from "./store/cart";

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
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex items-center justify-between gap-3">
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
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex items-center gap-2.5 min-h-16 py-2">
          <a href="#/" className="flex items-center gap-2.5 shrink-0">
            { }
            <img src={logo} alt={`${siteName} - الهوية`} className="w-11 h-11 rounded-xl object-cover ring-1 ring-[#e0e4e6] transition-transform hover:rotate-[-8deg] hover:scale-105" />
            <div className="hidden sm:flex flex-col leading-tight">
              <img src={BRAND_WORDMARK} alt={siteName} className="h-10 w-32 object-contain object-right" />
              <span className="text-[9px] font-extrabold tracking-[.14em] uppercase text-[#6a757d]">{tagline}</span>
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
            <a href="#/admin" className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-[12px] font-extrabold text-[#626d74] hover:bg-[#f4f6f7]"><User className="w-[18px] h-[18px]" />{T("account")}</a>
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
          <div className="container mx-auto px-6 max-w-7xl flex items-center justify-center gap-1 overflow-x-auto">
            <a href="#/shop" className={`px-5 py-3 text-[13px] font-extrabold transition-colors border-b-2 ${seg[0] === "shop" && !params.cat ? "border-[#45505a] text-[#33393e] bg-white" : "border-transparent text-[#566169] hover:bg-white hover:text-[#33393e]"}`}>{T("allProducts")}</a>
            {cats.map((c) => (
              <a key={c.id} href={`#/shop?cat=${c.slug}`} className={`px-4 py-3 text-[13px] font-extrabold transition-colors border-b-2 shrink-0 ${params.cat === c.slug ? "border-[#45505a] text-[#33393e] bg-white" : "border-transparent text-[#566169] hover:bg-white hover:text-[#33393e]"}`}>{L(lang, c.titleAr, c.titleEn)}</a>
            ))}
          </div>
        </nav>
      </header>

      {/* main */}
      <main className="flex-1">
        {catalogLoading ? (
          <div className="container mx-auto px-4 max-w-7xl py-16 grid place-items-center">
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
          <div className="container mx-auto px-4 max-w-7xl text-center py-24">
            <h2 className="text-2xl">404</h2>
            <a href="#/" className="btn-solid mt-6">{T("home")}</a>
          </div>
        )}
      </main>

      {/* footer — dark premium redesign */}
      <footer className="mt-12 sm:mt-16 bg-gradient-to-b from-[#333a40] via-[#23282d] to-[#181d21] text-[#c9d1d6] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-l from-[#45505a] via-[#8a959c] to-[#f2bd66]" />
        <div className="absolute -top-24 -end-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(242,189,102,.12),transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-28 -start-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.05),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
          <div className="grid gap-10 py-10 sm:py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
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
                {/* real crawlable URLs for SEO */}
                {cats.slice(0, 3).map((c) => <a key={c.id} href={`/shop?cat=${c.slug}`} className="text-[#a7b1b8] hover:text-white hover:ps-1 transition-all">{L(lang, c.titleAr, c.titleEn)}</a>)}
              </nav>
            </div>

            <div>
              <h3 className="font-extrabold text-[#f2bd66] text-[13px] flex items-center gap-2 before:content-[''] before:w-4 before:h-[3px] before:rounded-full before:bg-[#f2bd66]">{T("fHelp")}</h3>
              <nav className="grid gap-3 mt-4 text-[13px]">
                <a href="/contact" className="text-[#a7b1b8] hover:text-white hover:ps-1 transition-all">{T("policy")}</a>
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
      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="whatsapp" className="fab-pulse fixed end-4 bottom-4 z-[55] grid place-items-center w-[52px] h-[52px] rounded-full text-white bg-gradient-to-br from-[#45505a] to-[#5d6a74] shadow-xl hover:-translate-y-1 hover:scale-105 transition-transform"><Phone className="w-6 h-6" /></a>
      {showTop && (
        <button aria-label="top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed end-4 bottom-20 z-[55] grid place-items-center w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#33393e] to-[#45505a] text-[#f2bd66] shadow-xl hover:-translate-y-1 transition-transform"><ArrowUp className="w-5 h-5" /></button>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
