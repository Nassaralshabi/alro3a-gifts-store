import ProductCard from "@/components/ProductCard";
import type { CatalogProduct } from "@shared/store/types";
import { ArrowUpLeft, Boxes, Gift, LayoutPanelTop, Paintbrush, Package, Sparkles, Stamp, Tag, Trophy, type LucideIcon } from "lucide-react";
import { Link } from "wouter";

type StoreCategory = { slug: string; titleAr: string; titleEn: string; icon: string };

const categoryIcons: Record<string, LucideIcon> = { Boxes, Gift, LayoutPanelTop, Paintbrush, Package, Sparkles, Stamp, Tag, Trophy };

export function CategoryRail({ categories, isArabic }: { categories: StoreCategory[]; isArabic: boolean }) {
  return <section className="border-b border-[#e2ecee] bg-white"><div className="raed-container py-7 sm:py-9"><div className="flex items-end justify-between gap-4"><div><p className="raed-kicker">{isArabic ? "استعرض الكتالوج" : "DISCOVER THE CATALOGUE"}</p><h2 className="mt-2 font-display text-2xl text-[#17323b] sm:text-3xl">{isArabic ? "تصفح المنتجات حسب الفئة" : "Shop by category"}</h2></div><Link href="/shop" className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#12616c] hover:text-[#0d4f58]">{isArabic ? "كل المنتجات" : "All products"}<ArrowUpLeft className="h-4 w-4" /></Link></div><div className="mt-6 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] sm:gap-4">{categories.map(category => { const Icon = categoryIcons[category.icon] || Sparkles; return <Link key={category.slug} href={`/shop?category=${category.slug}`} className="group flex min-w-[125px] snap-start flex-col items-center gap-3 rounded-2xl border border-[#dfeaec] bg-[#fcfefe] px-4 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#75b7bf] hover:bg-[#eef9fa] sm:min-w-[150px]"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f4f5] text-[#16717d] transition group-hover:bg-[#16717d] group-hover:text-white"><Icon className="h-5 w-5" /></span><span className="line-clamp-2 text-xs font-bold leading-5 text-[#38565d]">{isArabic ? category.titleAr : category.titleEn}</span></Link>; })}</div></div></section>;
}

export function ProductSection({ eyebrow, title, subtitle, products, viewAllHref, viewAllLabel, isMuted = false }: { eyebrow?: string; title: string; subtitle?: string; products: CatalogProduct[]; viewAllHref: string; viewAllLabel: string; isMuted?: boolean }) {
  if (!products.length) return null;
  return <section className={isMuted ? "raed-section-muted" : "bg-white"}><div className="raed-container py-11 sm:py-14"><div className="flex items-end justify-between gap-4"><div><p className="raed-kicker">{eyebrow}</p><h2 className="mt-2 font-display text-2xl text-[#17323b] sm:text-3xl">{title}</h2>{subtitle ? <p className="mt-2 max-w-2xl text-sm leading-7 text-[#688086]">{subtitle}</p> : null}</div><Link href={viewAllHref} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#12616c] hover:text-[#0d4f58]">{viewAllLabel}<ArrowUpLeft className="h-4 w-4" /></Link></div><div className="mt-7 grid grid-flow-col auto-cols-[minmax(168px,76%)] gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] sm:auto-cols-[minmax(205px,38%)] lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">{products.slice(0, 8).map(product => <div key={product.product.id} className="snap-start"><ProductCard product={product} /></div>)}</div></div></section>;
}
