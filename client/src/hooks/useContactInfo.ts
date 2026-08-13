import { trpc } from "@/lib/trpc";

const fallback = {
  phone: "0521401021",
  whatsappUrl: "https://wa.me/971521401021",
  addressAr: "عجمان، الروضة 3",
  addressEn: "Al Rawda 3, Ajman",
  instagram: "alro3a.gifts",
  instagramUrl: "https://www.instagram.com/alro3a.gifts/",
};

export function useContactInfo() {
  const { data, isLoading } = trpc.store.catalog.contact.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return { ...fallback, ...data, isLoading };
}
