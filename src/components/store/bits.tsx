"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ShoppingBag, Heart, Sparkles, ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { useApp, money, Product } from "../core";
import { brandedImage } from "./brand";

export const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23eef1f3'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.35em' fill='%23a6b0b6' font-family='sans-serif' font-size='16'%3EAl Rawaa%3C/text%3E%3C/svg%3E";

export const L = (lang: "ar" | "en", ar?: string | null, en?: string | null) => (lang === "ar" ? ar : en) || ar || en || "";

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

export const catIcon = (name: string) => ICONS[name] ?? ICONS.Package;

/* ================= Reveal wrapper ================= */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
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
export function ProductCard({ p, delay = 0 }: { p: Product; delay?: number }) {
  const { lang, T, cartAdd } = useApp();
  const price = money(p.price, lang);
  const [fav, setFav] = useState(false);
  return (
    <Reveal delay={delay}>
      <article className={`group relative flex flex-col bg-white border border-[#e1e5e8] rounded-2xl overflow-hidden shadow-[0_18px_34px_-30px_rgba(35,41,46,.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ccd3d7] ${!p.isAvailable ? "opacity-55" : ""}`}>
        <a href={`#/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-[#f0f2f3] pc-shine">
          { }
          <img src={brandedImage(p.image) ?? FALLBACK} alt={L(lang, p.titleAr, p.titleEn)} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
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

export function SectionHead({ eyebrow, title, sub, href }: { eyebrow: string; title: string; sub?: string; href?: string }) {
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
