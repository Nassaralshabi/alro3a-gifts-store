import type { Locale } from "@/contexts/LocaleContext";

type PriceValue = string | number | { amount: string; currencyCode?: string };

export function formatMoney(value: PriceValue, locale: Locale = "ar", currencyCode = "AED"): string {
  const amount = typeof value === "object" ? Number.parseFloat(value.amount) : Number(value);
  const code = typeof value === "object" && value.currencyCode ? value.currencyCode : currencyCode;
  if (Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", { style: "currency", currency: code, minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount.toFixed(amount % 1 === 0 ? 0 : 2)} ${code}`;
  }
}
