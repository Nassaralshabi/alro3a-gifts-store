"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";

type Props = { productId: number; isAvailable: boolean; lang: "ar" | "en" };

/**
 * Add-to-cart for SEO product pages.
 * Writes to the SAME localStorage key as the SPA ("alrawaa_cart"),
 * so the cart carries over when the visitor opens the store.
 */
export default function AddToCart({ productId, isAvailable, lang }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const ar = lang === "ar";

  if (!isAvailable) {
    return (
      <span className="inline-flex items-center px-4 py-2.5 rounded-full bg-[#fbe9e9] text-[#a33333] text-sm font-extrabold">
        {ar ? "غير متوفر حالياً" : "Currently unavailable"}
      </span>
    );
  }

  function add() {
    try {
      const raw = localStorage.getItem("alrawaa_cart");
      const cart: Array<{ id: number; qty: number }> = raw ? JSON.parse(raw) : [];
      const found = cart.find((i) => i.id === productId);
      if (found) found.qty += qty;
      else cart.push({ id: productId, qty });
      localStorage.setItem("alrawaa_cart", JSON.stringify(cart));
    } catch {
      // storage disabled — still show feedback
    }
    setAdded(true);
    toast.success(ar ? `أُضيفت ${qty} قطعة إلى سلة المتجر` : `Added ${qty} to cart`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 mt-6">
      <div className="inline-flex items-center rounded-xl border border-[#e0e4e6] overflow-hidden bg-white">
        <button aria-label="minus" onClick={() => setQty((v) => Math.max(1, v - 1))} className="grid place-items-center w-10 h-11 hover:bg-[#f4f6f7]">−</button>
        <span className="grid place-items-center min-w-11 h-11 text-sm font-extrabold">{qty}</span>
        <button aria-label="plus" onClick={() => setQty((v) => v + 1)} className="grid place-items-center w-10 h-11 hover:bg-[#f4f6f7]">+</button>
      </div>
      <button
        onClick={add}
        className="inline-flex items-center justify-center gap-2 min-h-11 px-6 rounded-xl font-extrabold text-sm text-white bg-gradient-to-br from-[#45505a] to-[#5d6a74] shadow-[0_10px_22px_-10px_rgba(69,80,90,.85)] hover:brightness-110 hover:-translate-y-0.5 transition-all"
      >
        {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
        {added ? (ar ? "أُضيف — تابع التسوق" : "Added — keep shopping") : ar ? "إضافة إلى السلة" : "Add to cart"}
      </button>
      {added && (
        <a href="/#/#/shop" className="text-[13px] font-extrabold text-[#45505a] hover:underline">
          {ar ? "إتمام الطلب من المتجر ←" : "Complete request in store →"}
        </a>
      )}
    </div>
  );
}
