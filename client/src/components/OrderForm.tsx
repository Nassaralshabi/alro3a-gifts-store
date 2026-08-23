import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/contexts/LocaleContext";
import { useContactInfo } from "@/hooks/useContactInfo";
import { buildWhatsAppLink } from "@/lib/whatsapp";
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
      window.open(buildWhatsAppLink(contact.whatsappUrl, message), "_blank", "noopener,noreferrer");
      toast.success(isArabic ? "تم حفظ طلبك وتجهيز رسالة واتساب" : "Your request was saved and WhatsApp is ready");
      setNotes("");
    },
    onError: () => toast.error(isArabic ? "تعذر حفظ الطلب، يرجى إعادة المحاولة" : "We couldn't save your request. Please try again."),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createOrder.mutate({ productId: product?.id, customerName, customerPhone, quantity: Number(quantity), notes: notes || null, language: locale });
  }

  return <form onSubmit={submit} className="rounded-md border border-[#dce8ea] bg-[#f9fcfc] p-5 shadow-[0_14px_30px_-28px_rgba(13,56,66,.75)] sm:p-6"><p className="raed-kicker">{isArabic ? "خطوة أخيرة" : "FINAL STEP"}</p><h2 className="mt-2 font-display text-2xl text-[#17323b]">{isArabic ? "إرسال الطلب" : "Send your request"}</h2><p className="mt-1 text-sm leading-6 text-[#617a80]">{isArabic ? "سنحفظ التفاصيل ثم نفتح واتساب للتواصل السريع." : "We will save your details, then open WhatsApp for a quick conversation."}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Input required value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder={isArabic ? "الاسم" : "Your name"} className="h-11 rounded-md border-[#d6e4e6] bg-white focus-visible:border-[#16717d]" /><Input required inputMode="tel" value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} placeholder={isArabic ? "رقم الهاتف" : "Phone number"} className="h-11 rounded-md border-[#d6e4e6] bg-white focus-visible:border-[#16717d]" /></div><div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]"><Input required min="1" max="999" type="number" value={quantity} onChange={event => setQuantity(event.target.value)} aria-label={isArabic ? "الكمية" : "Quantity"} className="h-11 rounded-md border-[#d6e4e6] bg-white focus-visible:border-[#16717d]" /><Textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder={isArabic ? "تفاصيل الفكرة أو الطلب" : "Tell us about your idea or the details you would like"} className="min-h-24 rounded-md border-[#d6e4e6] bg-white focus-visible:border-[#16717d]" /></div><Button type="submit" disabled={createOrder.isPending} className="mt-4 h-11 w-full rounded-md bg-[#16717d] hover:bg-[#105d67]"><MessageCircleMore />{createOrder.isPending ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "حفظ الطلب وفتح واتساب" : "Save request & open WhatsApp")}</Button></form>;
}
