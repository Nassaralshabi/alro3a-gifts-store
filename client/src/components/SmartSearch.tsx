import { useLocale } from "@/contexts/LocaleContext";
import { getCatalogueSearchHref, getNextSearchOptionIndex, SEARCH_DEBOUNCE_MS, SEARCH_MINIMUM_LENGTH } from "@/lib/smartSearchBehavior";
import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, Boxes, FolderSearch2, Gift, LayoutPanelTop, LoaderCircle, Package, PackageSearch, Paintbrush, Search, Sparkles, Stamp, Tag, Trophy, type LucideIcon } from "lucide-react";
import React, { FormEvent, KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

type SearchOption =
  | { kind: "product"; href: string; title: string; detail: string; imageUrl: string | null; icon: null }
  | { kind: "category"; href: string; title: string; detail: string; imageUrl: null; icon: string }
  | { kind: "all"; href: string; title: string; detail: string; imageUrl: null; icon: null };

const categoryIcons: Record<string, LucideIcon> = { Boxes, Gift, LayoutPanelTop, Paintbrush, Package, Sparkles, Stamp, Tag, Trophy };
const queryOptions = { staleTime: 5 * 60 * 1000, gcTime: 15 * 60 * 1000, refetchOnWindowFocus: false };

export default function SmartSearch({ autoFocus = false, onNavigate, className = "" }: { autoFocus?: boolean; onNavigate?: () => void; className?: string }) {
  const { isArabic } = useLocale();
  const [, setLocation] = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = `${inputId}-suggestions`;
  const [value, setValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rawQuery = value.trim();
  const hasRawQuery = rawQuery.length >= SEARCH_MINIMUM_LENGTH;
  const hasQuery = debouncedQuery.length >= SEARCH_MINIMUM_LENGTH;
  const queryInput = useMemo(() => ({ query: debouncedQuery }), [debouncedQuery]);
  const suggestions = trpc.store.catalog.suggestions.useQuery(queryInput, { ...queryOptions, enabled: hasQuery });
  const options = useMemo<SearchOption[]>(() => {
    if (!hasQuery || !suggestions.data) return [];
    const products = suggestions.data.products.map(entry => ({ kind: "product" as const, href: `/products/${entry.product.slug}`, title: isArabic ? entry.product.titleAr : entry.product.titleEn, detail: (isArabic ? entry.categoryTitleAr : entry.categoryTitleEn) || (isArabic ? "منتج حسب الطلب" : "Made to order"), imageUrl: entry.product.imageUrl, icon: null }));
    const categories = suggestions.data.categories.map(category => ({ kind: "category" as const, href: `/shop?category=${category.slug}`, title: isArabic ? category.titleAr : category.titleEn, detail: isArabic ? "استعرض الفئة" : "Browse category", imageUrl: null, icon: category.icon }));
    const all = { kind: "all" as const, href: getCatalogueSearchHref(debouncedQuery), title: isArabic ? `عرض نتائج البحث عن «${debouncedQuery}»` : `View results for “${debouncedQuery}”`, detail: isArabic ? "البحث في كامل الكتالوج" : "Search the full catalogue", imageUrl: null, icon: null };
    return [...products, ...categories, all];
  }, [debouncedQuery, hasQuery, isArabic, suggestions.data]);

  useEffect(() => {
    if (rawQuery.length < SEARCH_MINIMUM_LENGTH) {
      setDebouncedQuery("");
      return;
    }
    const timeoutId = window.setTimeout(() => setDebouncedQuery(rawQuery), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [rawQuery]);

  useEffect(() => setActiveIndex(-1), [debouncedQuery]);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  function navigate(option: SearchOption) {
    setLocation(option.href);
    setIsOpen(false);
    onNavigate?.();
  }

  function navigateToFullResults() {
    navigate({ kind: "all", href: getCatalogueSearchHref(rawQuery), title: "", detail: "", imageUrl: null, icon: null });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!hasRawQuery) return;
    if (activeIndex >= 0 && options[activeIndex]) {
      navigate(options[activeIndex]);
      return;
    }
    navigateToFullResults();
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      return;
    }
    if (!options.length || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
    event.preventDefault();
    setIsOpen(true);
    const navigationKey = event.key as "ArrowDown" | "ArrowUp";
    setActiveIndex(current => getNextSearchOptionIndex(current, options.length, navigationKey));
  }

  const showDropdown = isOpen && hasRawQuery;
  const hasMatches = options.length > 1;
  const isWaitingForDebounce = hasRawQuery && rawQuery !== debouncedQuery;
  const emptyState = suggestions.data && !hasMatches && !suggestions.isFetching;

  return <div ref={wrapperRef} className={`relative ${className}`}><form onSubmit={submit}><label className="relative block"><Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d979c]" /><input id={inputId} role="combobox" aria-expanded={showDropdown} aria-controls={listId} aria-autocomplete="list" autoFocus={autoFocus} value={value} onFocus={() => setIsOpen(true)} onChange={event => { setValue(event.target.value); setIsOpen(true); }} onKeyDown={keyDown} placeholder={isArabic ? "ابحث عن هدية أو مطبوعة..." : "Search gifts and printing..."} className="h-11 w-full rounded-xl border border-[#d8e4e6] bg-[#f8fbfb] px-11 text-sm outline-none transition focus:border-[#27818a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(39,129,138,.08)]" />{suggestions.isFetching && !isWaitingForDebounce ? <LoaderCircle className="absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#27818a]" /> : null}</label></form>{showDropdown ? <div id={listId} role="listbox" className="absolute inset-x-0 top-[calc(100%+.5rem)] z-[80] overflow-hidden rounded-[1.15rem] border border-[#d4e4e6] bg-white shadow-[0_22px_40px_-24px_rgba(8,43,52,.45)]"><div className="flex items-center justify-between border-b border-[#edf2f3] bg-[#f8fbfb] px-4 py-2.5"><span className="text-[10px] font-black uppercase tracking-[.14em] text-[#27818a]">{isArabic ? "اقتراحات ذكية" : "SMART SUGGESTIONS"}</span>{hasMatches ? <span className="text-[10px] font-bold text-[#789197]">{isArabic ? "استخدم الأسهم ثم Enter" : "Use arrows + Enter"}</span> : null}</div>{isWaitingForDebounce || (suggestions.isFetching && !suggestions.data) ? <div className="flex items-center gap-2 px-4 py-5 text-sm text-[#698188]"><LoaderCircle className="h-4 w-4 animate-spin" />{isArabic ? "جارٍ البحث في الكتالوج..." : "Searching the catalogue..."}</div> : suggestions.isError ? <div className="px-4 py-6 text-center"><p className="text-sm font-bold text-[#8a4f4f]">{isArabic ? "تعذر تحميل الاقتراحات حالياً" : "Suggestions could not be loaded"}</p><button type="button" onClick={() => void suggestions.refetch()} className="mt-3 text-xs font-extrabold text-[#12616c] hover:underline">{isArabic ? "إعادة المحاولة" : "Try again"}</button></div> : hasMatches ? <div className="max-h-[min(24rem,55vh)] overflow-y-auto p-2">{options.map((option, index) => { const CategoryIcon = option.kind === "category" ? categoryIcons[option.icon] || FolderSearch2 : option.kind === "all" ? Search : PackageSearch; return <button type="button" role="option" aria-selected={index === activeIndex} key={`${option.kind}-${option.href}`} onClick={() => navigate(option)} onMouseEnter={() => setActiveIndex(index)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition ${index === activeIndex ? "bg-[#eaf5f6]" : "hover:bg-[#f5fafb]"}`}>{option.imageUrl ? <img src={option.imageUrl} alt="" className="h-10 w-10 rounded-lg border border-[#e2ecee] object-cover" /> : <span className={`grid h-10 w-10 place-items-center rounded-lg ${option.kind === "all" ? "bg-[#16717d] text-white" : "bg-[#e8f4f5] text-[#16717d]"}`}><CategoryIcon className="h-4 w-4" /></span>}<span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold text-[#18333b]">{option.title}</span><span className="mt-0.5 block truncate text-xs text-[#698188]">{option.detail}</span></span>{option.kind === "product" ? <Sparkles className="h-3.5 w-3.5 text-[#d9952d]" /> : <ArrowUpLeft className="h-4 w-4 text-[#5f7e84]" />}</button>; })}</div> : emptyState ? <div className="px-4 py-6 text-center"><PackageSearch className="mx-auto h-6 w-6 text-[#78aeb4]" /><p className="mt-2 text-sm font-bold text-[#45656c]">{isArabic ? "لا توجد اقتراحات مطابقة الآن" : "No matching suggestions yet"}</p><button type="button" onClick={navigateToFullResults} className="mt-3 text-xs font-extrabold text-[#12616c] hover:underline">{isArabic ? "بحث في الكتالوج كاملاً" : "Search the full catalogue"}</button></div> : null}</div> : null}</div>;
}
