import RequestCartDrawer from "@/components/RequestCartDrawer";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { useRequestCart } from "@/contexts/RequestCartContext";
import { useContactInfo } from "@/hooks/useContactInfo";
import { Heart, Instagram, Languages, MapPin, Menu, Phone, Search, ShoppingBag, UserCircle2, X } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";

const FALLBACK_LOGO_URL = "/manus-storage/social-1_e277342a.jpg";
const navItems = [
  { href: "/services/promotional-gifts", ar: "هدايا إعلانية", en: "Promotional gifts" },
  { href: "/services/occasion-stationery", ar: "مطبوعات المناسبات", en: "Occasion print" },
  { href: "/services/boxes-packaging", ar: "بوكسات وتغليف", en: "Boxes & packaging" },
  { href: "/services/stands-boards", ar: "ستاندات ولوحات", en: "Stands & boards" },
  { href: "/services/engraving-details", ar: "حفر وتفاصيل", en: "Engraving" },
  { href: "/shop", ar: "المزيد", en: "More" },
];

export default function StoreShell({ children, logoUrl }: { children: ReactNode; logoUrl?: string | null }) {
  const { isArabic, toggleLocale } = useLocale();
  const contact = useContactInfo();
  const { totalItems, openCart } = useRequestCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const address = isArabic ? contact.addressAr : contact.addressEn;
  const resolvedLogoUrl = logoUrl || FALLBACK_LOGO_URL;

  function searchSubmit(event: FormEvent) {
    event.preventDefault();
    setLocation(`/shop?search=${encodeURIComponent(search.trim())}`);
  }

  return <div className="min-h-screen overflow-x-hidden bg-[#fff] text-[#17323b]">
    <div className="bg-[#102f39] px-4 py-2 text-[11px] text-[#edf8f8] sm:px-8">
      <div className="raed-container flex items-center justify-between gap-3 px-0">
        <span className="hidden items-center gap-1.5 md:inline-flex"><MapPin className="h-3.5 w-3.5 text-[#f1ba63]" />{address}</span>
        <div className="flex items-center gap-4"><a href="/contact" className="hover:text-[#f1ba63]">{isArabic ? "سياسة الطلب والتعديل" : "Ordering policy"}</a><a href={contact.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#f1ba63]"><Phone className="h-3.5 w-3.5" />{contact.phone}</a></div>
        <button onClick={toggleLocale} className="inline-flex items-center gap-1 font-bold hover:text-[#f1ba63]"><Languages className="h-3.5 w-3.5" />{isArabic ? "English" : "العربية"}</button>
      </div>
    </div>

    <header className="relative z-50 border-b border-[#e3ebed] bg-white shadow-[0_4px_18px_-16px_rgba(16,47,57,.52)]">
      <div className="raed-container flex min-h-[80px] items-center gap-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <img src={resolvedLogoUrl} alt={isArabic ? "شعار مطبعة الروعة" : "Al Rawaa Printing logo"} className="h-12 w-12 rounded-md object-cover ring-1 ring-[#dbe8ea]" />
          <div className="hidden leading-tight sm:block"><span className="block font-display text-lg font-bold text-[#14323a]">{isArabic ? "مطبعة الروعة" : "Al Rawaa Printing"}</span><span className="block text-[9px] font-bold uppercase tracking-[.14em] text-[#27818a]">{isArabic ? "هدايا بطابعك" : "Gifts, your way"}</span></div>
        </Link>
        <form onSubmit={searchSubmit} className="hidden flex-1 lg:block"><label className="relative mx-auto block max-w-2xl"><Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa0a5]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={isArabic ? "ابحثي عن هدية أو مطبوعة..." : "Search gifts and printing..."} className="h-11 w-full rounded-full border border-[#d8e4e6] bg-[#f8fbfb] px-11 text-sm outline-none transition focus:border-[#27818a] focus:bg-white" /></label></form>
        <div className="ms-auto flex items-center gap-1.5">
          <Link href="/admin" className="hidden h-10 items-center gap-1.5 rounded-md px-2.5 text-xs font-bold text-[#577077] hover:bg-[#eff7f7] sm:inline-flex"><UserCircle2 className="h-5 w-5" />{isArabic ? "حسابي" : "Account"}</Link>
          <button className="hidden h-10 w-10 place-items-center rounded-md text-[#577077] hover:bg-[#eff7f7] sm:grid" aria-label={isArabic ? "المفضلة" : "Wishlist"}><Heart className="h-5 w-5" /></button>
          <button onClick={openCart} className="relative inline-flex h-10 items-center gap-2 rounded-md bg-[#16717d] px-3 text-xs font-bold text-white transition hover:bg-[#105d67]"><ShoppingBag className="h-4 w-4" /><span className="hidden sm:inline">{isArabic ? "سلة الطلب" : "Cart"}</span>{totalItems ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#f2bd66] px-1 text-[10px] text-[#17323b]">{totalItems}</span> : null}</button>
          <button onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-md border border-[#d8e4e6] lg:hidden" aria-label={isArabic ? "فتح القائمة" : "Open menu"}><Menu className="h-5 w-5" /></button>
        </div>
      </div>
      <nav className="hidden border-t border-[#edf1f2] bg-[#f7fafb] lg:block"><div className="raed-container flex items-center justify-center gap-1 overflow-x-auto px-0"><Link href="/shop" className="border-b-2 border-[#16717d] px-5 py-3 text-sm font-black text-[#12616c]">{isArabic ? "كل المنتجات" : "All products"}</Link>{navItems.map(item => <Link key={item.href} href={item.href} className="shrink-0 px-4 py-3 text-sm font-bold text-[#4b656c] transition hover:bg-white hover:text-[#12616c]">{isArabic ? item.ar : item.en}</Link>)}</div></nav>
    </header>

    {menuOpen ? <div className="fixed inset-0 z-[70] bg-[#0b2d35]/45 backdrop-blur-sm lg:hidden"><div className="absolute inset-x-3 top-3 rounded-xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between border-b border-[#e1ebed] pb-4"><span className="font-display text-xl">{isArabic ? "تصفح المتجر" : "Browse store"}</span><button onClick={() => setMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#e9f4f4] text-[#12616c]"><X className="h-5 w-5" /></button></div><form onSubmit={event => { searchSubmit(event); setMenuOpen(false); }} className="relative mt-4"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa0a5]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={isArabic ? "ابحثي في المتجر" : "Search the store"} className="h-11 w-full rounded-md border border-[#d8e4e6] px-9 text-sm" /></form><nav className="grid gap-1 py-4">{navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-bold hover:bg-[#eff7f7]">{isArabic ? item.ar : item.en}</Link>)}</nav><Button onClick={() => { setMenuOpen(false); openCart(); }} className="h-11 w-full rounded-md bg-[#16717d] hover:bg-[#105d67]"><ShoppingBag />{isArabic ? "فتح سلة الطلب" : "Open request cart"}</Button></div></div> : null}
    <main>{children}</main>
    <footer className="mt-14 bg-[#102f39] text-[#edf8f8]"><div className="raed-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]"><div><div className="flex items-center gap-3"><img src={resolvedLogoUrl} alt="" className="h-11 w-11 rounded-md object-cover" /><span className="font-display text-2xl">{isArabic ? "مطبعة الروعة" : "Al Rawaa Printing"}</span></div><p className="mt-4 max-w-md text-sm leading-7 text-[#c6d7d9]">{isArabic ? "مطبوعات وهدايا حسب الطلب تُنفذ بعناية في عجمان وتصل إلى كل الإمارات." : "Made-to-order printed gifts and details, crafted in Ajman and delivered across the UAE."}</p></div><div><h3 className="font-bold text-[#f2bd66]">{isArabic ? "تواصل" : "Contact"}</h3><div className="mt-4 space-y-3 text-sm text-[#c6d7d9]"><a className="flex items-center gap-2 hover:text-white" href={contact.whatsappUrl} target="_blank" rel="noreferrer"><Phone className="h-4 w-4" />{contact.phone}</a><a className="flex items-center gap-2 hover:text-white" href={contact.instagramUrl} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" />@{contact.instagram.replace(/^@/, "")}</a></div></div><div><h3 className="font-bold text-[#f2bd66]">{isArabic ? "الزيارة والاستلام" : "Visit & collect"}</h3><p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#c6d7d9]">{address}{"\n"}{isArabic ? "توصيل متاح لجميع الإمارات" : "Delivery available across the UAE"}</p></div></div><div className="border-t border-white/10 px-5 py-5 text-center text-xs text-[#9db8bc]">© {new Date().getFullYear()} {isArabic ? "مطبعة الروعة. جميع الحقوق محفوظة." : "Al Rawaa Printing. All rights reserved."}</div></footer>
    <RequestCartDrawer />
  </div>;
}
