"use client";

import React from "react";
import { Phone, MapPin, Clock } from "lucide-react";
import { useApp, api } from "../core";
import { Reveal } from "./bits";

/* ================= Branches section (under hero) ================= */
type Branch = {
  nameAr: string; nameEn: string;
  addressAr: string; addressEn: string;
  phone: string; whatsapp: string;
};

const BRANCHES: Branch[] = [
  {
    nameAr: "الروضة 3", nameEn: "Al Rawda 3",
    addressAr: "شارع الشيخ محمد بن حصيم، الروضة 3، عجمان",
    addressEn: "Sheikh Mohammed bin Haseem St, Al Rawda 3, Ajman",
    phone: "+971 52 140 1021", whatsapp: "971521401021",
  },
  {
    nameAr: "المصنع 1", nameEn: "Al Masnaa 1",
    addressAr: "مسكنوك 21، المصنع 1، عجمان",
    addressEn: "Masknock 21, Al Masnaa 1, Ajman",
    phone: "+971 52 140 1021", whatsapp: "971521401021",
  },
];

export function BranchesSection() {
  const { isAr } = useApp();
  return (
    <section className="bg-white border-b border-[#e5e8ea]">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-[11px] font-extrabold tracking-[.18em] uppercase text-[#5c6870]">{isAr ? "زورونا" : "VISIT US"}</p>
            <h2 className="mt-1.5 text-2xl">{isAr ? "فروعنا في عجمان" : "Our branches in Ajman"}</h2>
          </div>
          <a href="#/contact" className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-extrabold text-[#45505a] rounded-lg px-3 py-2 hover:bg-[#f4f6f7]">
            {isAr ? "كل تفاصيل التواصل" : "All contact details"}
          </a>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {BRANCHES.map((b, i) => (
            <Reveal key={i} delay={i * 90}>
              <article className="group relative overflow-hidden rounded-2xl border border-[#e4e7e9] bg-white shadow-[0_18px_34px_-30px_rgba(35,41,46,.9)] hover:-translate-y-1 hover:shadow-[0_24px_38px_-28px_rgba(35,41,46,.5)] transition-all">
                {/* branch header — dark with skyline hint */}
                <div className="relative bg-gradient-to-l from-[#333a40] via-[#23282d] to-[#1a1f23] px-5 py-4 overflow-hidden">
                  {/* subtle skyline silhouette (CSS shapes) */}
                  <div className="absolute inset-y-0 end-0 w-40 opacity-[.14] pointer-events-none" aria-hidden>
                    <svg viewBox="0 0 160 70" className="w-full h-full" preserveAspectRatio="none">
                      <path d="M0 70V38h14V22h10v16h12V10l8-6 8 6v28h14V30h12V14h6V2l6-2 6 2v12h6v16h14V26l9-5 9 5v12h12V18h8v52z" fill="#ffffff" />
                    </svg>
                  </div>
                  <div className="relative flex items-center gap-2.5">
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#f2bd66]/15 text-[#f2bd66] ring-1 ring-[#f2bd66]/30">
                      <MapPin className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                    </span>
                    <div>
                      <h3 className="text-white text-[15px] font-extrabold leading-tight">{isAr ? b.nameAr : b.nameEn}</h3>
                      <p className="text-[10px] font-extrabold tracking-[.14em] uppercase text-[#f2bd66]">{isAr ? "فرع عجمان" : "Ajman branch"}</p>
                    </div>
                  </div>
                </div>

                {/* info rows */}
                <div className="p-5 grid gap-3.5">
                  <a href={`https://wa.me/${b.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 group/row">
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#45505a] to-[#5d6a74] text-white shadow-md shrink-0 group-hover/row:scale-105 transition-transform">
                      <Phone className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a949b]">{isAr ? "هاتف / واتساب" : "Phone / WhatsApp"}</p>
                      <p dir="ltr" className="text-[14px] font-extrabold text-[#33393e] group-hover/row:text-[#45505a] transition-colors">{b.phone}</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#f4f6f7] text-[#45505a] ring-1 ring-[#e4e7e9] shrink-0">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a949b]">{isAr ? "العنوان" : "Address"}</p>
                      <p className="text-[13px] font-bold text-[#454f57] leading-relaxed">{isAr ? b.addressAr : b.addressEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#f4f6f7] text-[#45505a] ring-1 ring-[#e4e7e9] shrink-0">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a949b]">{isAr ? "الدوام" : "Working hours"}</p>
                      <p className="text-[13px] font-bold text-[#454f57]">{isAr ? "السبت – الخميس · 9ص – 9م" : "Sat – Thu · 9AM – 9PM"}</p>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
