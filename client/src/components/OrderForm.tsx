import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/contexts/LocaleContext";
import { useContactInfo } from "@/hooks/useContactInfo";
import { trpc } from "@/lib/trpc";
import type { InternalProduct } from "@shared/store/types";
import { MessageCircleMore } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function OrderForm({ product }: { product?: InternalProduct }) {
  const { isArabic, locale } = useLocale();
  const contact = useContactInfo();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const createOrder = trpc.store.orders.create.useMutation({
    onSuccess: order => {
      const productTitle = product ? (isArabic ? product.titleAr : product.titleEn) : (isArabic ? "طلب مخصص" : "Custom request");
      const message = isArabic ? `مرحباً مطبعة الروعة، لدي طلب جديد رقم #${order.id}\nالمنتج: ${productTitle}\nالاسم: ${customerName}\nالهاتف: ${customerPhone}\nالكمية: ${quantity}\nالتفاصيل: ${notes || "—"}` : `Hello Al Rawaa Printing, I have a new request #${order.id}\nProduct: ${productTitle}\nName: ${customerName}\nPhone: ${customerPhone}\nQuantity: ${quantity}\nDetails: ${notes || "—"}`;
      window.open(`${contact.whatsappUrl}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      toast.success(isArabic ? "تم حفظ طلبك وتجهيز رسالة واتساب" : "Your request was saved and WhatsApp is ready");
      setNotes("");
    },
    onError: () => toast.error(isArabic ? "تعذر حفظ الطلب، حاولي مجددًا" : "We couldn't save your request. Please try again."),
  });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); createOrder.mutate({ productId: product?.id, customerName, customerPhone, quantity: Number(quantity), notes: notes || null, language: locale }); }
  return <form onSubmit={submit} className="rounded-3xl border border-[#e9e3d6] bg-[#fffdf8] p-5 sm:p-6"><h2 className="font-display text-2xl text-[#24233a]">{isArabic ? "أرسلي طلبك" : "Send your request"}</h2><p className="mt-1 text-sm leading-6 text-[#766f69]">{isArabic ? "سنحفظ التفاصيل ثم نفتح واتساب للتواصل السريع." : "We will save your details, then open WhatsApp for a quick conversation."}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Input required value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder={isArabic ? "الاسم" : "Your name"} className="h-11 rounded-xl border-[#e5dfd2] bg-white" /><Input required inputMode="tel" value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} placeholder={isArabic ? "رقم الهاتف" : "Phone number"} className="h-11 rounded-xl border-[#e5dfd2] bg-white" /></div><div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]"><Input required min="1" max="999" type="number" value={quantity} onChange={event => setQuantity(event.target.value)} aria-label={isArabic ? "الكمية" : "Quantity"} className="h-11 rounded-xl border-[#e5dfd2] bg-white" /><Textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder={isArabic ? "اكتبي الفكرة أو التفاصيل التي تودين إضافتها" : "Tell us about your idea or the details you would like"} className="min-h-24 rounded-xl border-[#e5dfd2] bg-white" /></div><Button type="submit" disabled={createOrder.isPending} className="mt-4 h-11 w-full rounded-xl bg-[#7953a2] hover:bg-[#654287]"><MessageCircleMore />{createOrder.isPending ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "حفظ الطلب وفتح واتساب" : "Save request & open WhatsApp")}</Button></form>;
}
