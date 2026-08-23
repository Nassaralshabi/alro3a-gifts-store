"use client";

import React, { useMemo, useState } from "react";
import { ShoppingBag, X, Send, Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp, money, go } from "../core";
import { FALLBACK, L } from "./bits";

/* ================= Cart drawer ================= */
export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      const { api } = await import("../core");
      const res = await api.createOrder({ name, phone, notes, lang, items: cart.map((i) => ({ productId: i.id, qty: i.qty })) });
      if (!res) throw new Error();
      const lines = items.map(({ i, p }) => `• ${L(lang, p!.titleAr, p!.titleEn)} × ${i.qty}`).join("\n");
      const msg = isAr
        ? `مرحباً مطبعة الروعة، أرسلت طلباً جديداً (${res.order.ref})\nالاسم: ${name}\nالهاتف: ${phone}\n\nالمنتجات:\n${lines}\n\nالتفاصيل: ${notes || "—"}`
        : `Hello Al Rawaa Printing, new request (${res.order.ref})\nName: ${name}\nPhone: ${phone}\n\nProducts:\n${lines}\n\nNotes: ${notes || "—"}`;
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
      cartClear(); setCheckout(false); onClose();
      setName(""); setPhone(""); setNotes("");
      toast.success(isAr ? `تم حفظ طلبك بنجاح — رقم الطلب: ${res.order.ref}` : `Request saved — ref: ${res.order.ref}`, { duration: 6000 });
    } catch {
      toast.error(T("submitErr"));
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
