import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://alrawaa.example.com";

export const metadata: Metadata = {
  title: "تواصل معنا | مطبعة الروعة — عجمان، الإمارات",
  description: "تواصل مع مطبعة الروعة في عجمان — هاتف وواتساب 0521401021. مطبوعات وهدايا حسب الطلب مع توصيل لجميع الإمارات.",
  alternates: { canonical: `${SITE}/contact` },
};

export default async function ContactPage() {
  const settings = await db.setting.findMany();
  const map = new Map(settings.map((s) => [s.key, s]));
  const phone = map.get("contact.phone")?.value ?? "0521401021";
  const whatsapp = map.get("contact.whatsapp")?.value ?? "971521401021";
  const instagram = map.get("contact.instagram")?.value ?? "alro3a.gifts";
  const addressAr = map.get("contact.address")?.valueAr ?? "عجمان، الروضة 3";

  const steps = [
    { t: "أضف المنتجات إلى سلة الطلب", d: "تصفح الأقسام وأضف ما يعجبك." },
    { t: "أرسل الطلب مع اسمك ورقمك", d: "يُحفظ الطلب في قاعدة بيانات المتجر فوراً." },
    { t: "نؤكد التفاصيل والسعر", d: "نتفق على المقاس والكمية والسعر النهائي." },
    { t: "التنفيذ والتوصيل", d: "ننفذ طلبك بعناية ونوصله لجميع الإمارات." },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "مطبعة الروعة — Al Rawaa Printing",
    telephone: `+${whatsapp}`,
    address: { "@type": "PostalAddress", streetAddress: addressAr, addressLocality: "عجمان", addressCountry: "AE" },
    sameAs: [`https://instagram.com/${instagram}`],
    url: SITE,
  };

  return (
    <div className="min-h-screen bg-white text-[#33393e]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-[#e4e7e9] bg-white sticky top-0 z-40">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between min-h-16">
          <Link href="/" className="text-lg font-bold">مطبعة الروعة</Link>
          <Link href="/" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-br from-[#45505a] to-[#5d6a74] text-white text-[13px] font-extrabold">الدخول إلى المتجر</Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <h1 className="text-3xl">تواصل معنا</h1>
        <p className="text-[14px] text-[#727c83] mt-3 leading-relaxed">فريق مطبعة الروعة جاهز لمساعدتك في اختيار الأنسب لمناسبتك — عجمان، الإمارات العربية المتحدة.</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="border border-[#e4e7e9] rounded-2xl p-5 hover:border-[#ccd3d7] hover:bg-[#f7f8f9] transition-colors">
            <b className="block text-[14px]">الهاتف / واتساب</b>
            <span dir="ltr" className="text-[13px] text-[#6c767d]">{phone}</span>
          </a>
          <div className="border border-[#e4e7e9] rounded-2xl p-5">
            <b className="block text-[14px]">العنوان</b>
            <span className="text-[13px] text-[#6c767d]">{addressAr} — توصيل لجميع الإمارات</span>
          </div>
          <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" className="border border-[#e4e7e9] rounded-2xl p-5 hover:border-[#ccd3d7] hover:bg-[#f7f8f9] transition-colors">
            <b className="block text-[14px]">إنستغرام</b>
            <span dir="ltr" className="text-[13px] text-[#6c767d]">@{instagram}</span>
          </a>
          <a href="/shop" className="border border-[#e4e7e9] rounded-2xl p-5 hover:border-[#ccd3d7] hover:bg-[#f7f8f9] transition-colors">
            <b className="block text-[14px]">تصفح المنتجات</b>
            <span className="text-[13px] text-[#6c767d]">262+ منتجاً حسب الطلب</span>
          </a>
        </div>

        <h2 className="text-xl mt-12">كيف يتم الطلب؟</h2>
        <div className="mt-4">
          {steps.map((s, i) => (
            <div key={i} className={`flex gap-4 py-4 ${i < steps.length - 1 ? "border-b border-dashed border-[#e4e7e9]" : ""}`}>
              <span className="grid place-items-center w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#45505a] to-[#5d6a74] text-white text-[13px] font-black shrink-0">{i + 1}</span>
              <div>
                <h3 className="text-[14px] font-extrabold">{s.t}</h3>
                <p className="text-[12px] text-[#727c83] leading-relaxed mt-1">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-6 bg-gradient-to-b from-[#23282d] to-[#181d21] text-[#a7b1b8] relative">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-l from-[#45505a] via-[#8a959c] to-[#f2bd66]" />
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center text-[12px]">
          © {new Date().getFullYear()} مطبعة الروعة. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
