import { trpc } from "@/lib/trpc";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useLocale } from "@/contexts/LocaleContext";

const fallback = {
  phone: "0521401021",
  whatsappUrl: "https://wa.me/971521401021",
  whatsappDefaultMessageAr: "",
  whatsappDefaultMessageEn: "",
  addressAr: "عجمان، الروضة 3",
  addressEn: "Al Rawda 3, Ajman",
  instagram: "alro3a.gifts",
  instagramUrl: "https://www.instagram.com/alro3a.gifts/",
};

export function useContactInfo() {
  const { isArabic } = useLocale();
  const { data, isLoading } = trpc.store.catalog.contact.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const contact = { ...fallback, ...data };
  return {
    ...contact,
    whatsappUrl: buildWhatsAppLink(contact.whatsappUrl, isArabic ? contact.whatsappDefaultMessageAr : contact.whatsappDefaultMessageEn),
    isLoading,
  };
}
