import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const copy = {
  ar: {
    home: "الرئيسية",
    shop: "المتجر",
    services: "خدماتنا",
    contact: "تواصل معنا",
    basket: "السلة",
    browse: "تصفح المنتجات",
    requestNow: "اطلب الآن",
    language: "English",
    admin: "لوحة الإدارة",
  },
  en: {
    home: "Home",
    shop: "Shop",
    services: "Services",
    contact: "Contact",
    basket: "Basket",
    browse: "Browse products",
    requestNow: "Order now",
    language: "العربية",
    admin: "Admin panel",
  },
} as const;

export type Locale = keyof typeof copy;
type CopyKey = keyof typeof copy.ar;

type LocaleContextValue = {
  locale: Locale;
  isArabic: boolean;
  direction: "rtl" | "ltr";
  toggleLocale: () => void;
  t: (key: CopyKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const LOCALE_STORAGE_KEY = "alro3a:locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === "en" ? "en" : "ar";
  });

  useEffect(() => {
    const direction = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.title = locale === "ar" ? "مطبعة الروعة" : "Al Rawaa Printing";
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      isArabic: locale === "ar",
      direction: locale === "ar" ? "rtl" : "ltr",
      toggleLocale: () => setLocale(current => (current === "ar" ? "en" : "ar")),
      t: key => copy[locale][key],
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
