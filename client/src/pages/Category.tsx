import StoreShell from "@/components/StoreShell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { ArrowRight, Boxes, Gift, MessageCircleMore, Paintbrush, Sparkles, Stamp, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useRoute } from "wouter";

type Category = {
  slug: string;
  icon: LucideIcon;
  ar: { eyebrow: string; title: string; description: string; ideas: string[] };
  en: { eyebrow: string; title: string; description: string; ideas: string[] };
};

const CATEGORIES: Category[] = [
  { slug: "promotional-gifts", icon: Gift, ar: { eyebrow: "هدايا إعلانية", title: "هديتك التسويقية بلمسة تحكي عن علامتك", description: "نجهز هدايا تحمل اسمك أو هويتك لتترك انطباعًا دافئًا لدى عملائك وفريقك.", ideas: ["هدايا شركات", "توزيعات فعاليات", "هدايا موظفين"] }, en: { eyebrow: "Promotional gifts", title: "Promotional gifts that carry your brand", description: "Thoughtful branded gifts for clients, teams and events.", ideas: ["Corporate gifts", "Event favours", "Team gifts"] } },
  { slug: "occasion-stationery", icon: Stamp, ar: { eyebrow: "مطبوعات المناسبات", title: "تفاصيل مطبوعة تجعل مناسبتك أقرب لقلبك", description: "دعوات وبطاقات وتوزيعات تُنسق حسب ثيم الحفل وألوانه وفكرته.", ideas: ["دعوات وبطاقات", "توزيعات", "أظرف وهدايا عيد"] }, en: { eyebrow: "Occasion stationery", title: "Printed details for every occasion", description: "Invites, cards and favours tailored to your event theme, colours and idea.", ideas: ["Invites & cards", "Favours", "Eid envelopes & gifts"] } },
  { slug: "boxes-packaging", icon: Boxes, ar: { eyebrow: "بوكسات وتغليف", title: "كل هدية تبدأ من أول انطباع", description: "بوكسات وأكياس وورق تغليف يضيفون للتفاصيل قيمة وأناقة من أول لحظة.", ideas: ["بوكسات هدايا", "أكياس مطبوعة", "ورق تغليف"] }, en: { eyebrow: "Boxes & packaging", title: "Every gift starts with a first impression", description: "Boxes, bags and wrapping that add value and polish from the first moment.", ideas: ["Gift boxes", "Printed bags", "Wrapping paper"] } },
  { slug: "custom-printing", icon: Paintbrush, ar: { eyebrow: "طباعة حسب الطلب", title: "نبدأ من فكرتك وننتهي بقطعة تشبهك", description: "خدمة مرنة للطلبات الفردية والكميات، مع تصميم يتوافق مع المناسبة والذوق.", ideas: ["طباعة أسماء", "طلبات كميات", "تصاميم خاصة"] }, en: { eyebrow: "Custom printing", title: "Start with your idea, end with something personal", description: "Flexible individual and bulk printing, designed around your occasion and taste.", ideas: ["Name printing", "Bulk orders", "Custom designs"] } },
  { slug: "stands-boards", icon: Trophy, ar: { eyebrow: "ستاندات ولوحات", title: "لوحات تصوير وستاندات تحتفل باللحظة", description: "قطع مخصصة للتخرج والمواليد والاحتفالات، جاهزة لتكون أجمل خلفية للصور.", ideas: ["لوحات تصوير", "ستاندات تخرج", "لوحات استقبال"] }, en: { eyebrow: "Stands & boards", title: "Photo boards and stands made to celebrate", description: "Custom pieces for graduations, newborn celebrations and special events.", ideas: ["Photo boards", "Graduation stands", "Welcome signs"] } },
  { slug: "engraving-details", icon: Sparkles, ar: { eyebrow: "حفر وتفاصيل", title: "تفاصيل صغيرة بذكرى كبيرة", description: "نضيف اسمًا أو رسالة أو رمزًا يخصك على الهدايا والمعاليق المختارة.", ideas: ["معاليق محفورة", "هدايا بأسماء", "رسائل مخصصة"] }, en: { eyebrow: "Engraving & details", title: "Small details, lasting memories", description: "Add names, a message or a meaningful symbol to selected gifts and keychains.", ideas: ["Engraved keychains", "Named gifts", "Custom messages"] } },
];

const WHATSAPP_URL = "https://wa.me/971521401021";

export default function Category() {
  const [, params] = useRoute("/services/:slug");
  const { isArabic, direction } = useLocale();
  const category = CATEGORIES.find(item => item.slug === params?.slug);

  if (!category) return <StoreShell><div className="grid min-h-[60vh] place-items-center px-5 text-center"><div><h1 className="font-display text-3xl">{isArabic ? "لم نجد هذه الخدمة" : "We couldn't find this service"}</h1><Button asChild className="mt-5 rounded-md bg-[#16717d] hover:bg-[#105d67]"><Link href="/">{isArabic ? "العودة للرئيسية" : "Back home"}</Link></Button></div></div></StoreShell>;
  const content = isArabic ? category.ar : category.en;
  const Icon = category.icon;

  return <StoreShell><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16"><Link href="/#services" className="inline-flex items-center gap-2 text-sm font-bold text-[#12616c]"><ArrowRight className={`h-4 w-4 ${direction === "ltr" ? "rotate-180" : ""}`} />{isArabic ? "كل الخدمات" : "All services"}</Link><div className="mt-7 grid overflow-hidden rounded-[2rem] bg-[#e5f3f4] lg:grid-cols-[1.15fr_.85fr]"><div className="p-8 sm:p-12"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#16717d] text-white"><Icon className="h-6 w-6" /></div><p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-[#1b7b86]">{content.eyebrow}</p><h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-[#17323b] sm:text-5xl">{content.title}</h1><p className="mt-5 max-w-xl text-sm leading-8 text-[#526d73] sm:text-base">{content.description}</p><Button asChild className="mt-8 h-12 rounded-md bg-[#16717d] px-6 hover:bg-[#105d67]"><a href={WHATSAPP_URL} target="_blank" rel="noreferrer"><MessageCircleMore />{isArabic ? "اطلبي هذه الخدمة" : "Request this service"}</a></Button></div><div className="bg-[#17323b] p-8 text-white sm:p-12"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#f2bd66]">{isArabic ? "أفكار شائعة" : "POPULAR IDEAS"}</p><div className="mt-7 grid gap-3">{content.ideas.map((idea, index) => <div key={idea} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#f2bd66] text-xs font-black text-[#17323b]">0{index + 1}</span><span className="font-bold">{idea}</span></div>)}</div></div></div></section></StoreShell>;
}
