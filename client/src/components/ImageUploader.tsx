import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ImagePlus, Loader2, X } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

type ImageUploaderProps = { value?: string | null; onUploaded: (url: string) => void; label: string; hint?: string };

export default function ImageUploader({ value, onUploaded, label, hint }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const upload = trpc.store.admin.uploadImage.useMutation({
    onSuccess: result => { onUploaded(result.url); setLocalPreview(null); toast.success("تم رفع الصورة بنجاح"); },
    onError: error => toast.error(error.message || "تعذر رفع الصورة"),
  });
  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("يرجى اختيار ملف صورة صالح"); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("يجب ألا يتجاوز حجم الصورة 4 ميغابايت"); return; }
    const reader = new FileReader();
    reader.onload = () => { const dataUrl = String(reader.result || ""); setLocalPreview(dataUrl); upload.mutate({ dataUrl, fileName: file.name }); };
    reader.readAsDataURL(file);
  }
  const preview = localPreview || value;
  return <div className="rounded-2xl border border-dashed border-[#b8d8dc] bg-[#f8f6f0] p-3"><div className="flex gap-3"><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#e5f3f4] text-[#16717d]">{preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#17323b]">{label}</p><p className="mt-1 text-[11px] leading-5 text-[#617a80]">{hint || "PNG أو JPG أو WEBP أو GIF، حتى 4 ميغابايت."}</p><div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" onClick={() => inputRef.current?.click()} disabled={upload.isPending} className="h-8 rounded-md bg-[#16717d] px-3 text-xs hover:bg-[#105d67]">{upload.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}{upload.isPending ? "جارٍ الرفع" : "رفع صورة"}</Button>{value ? <Button type="button" size="sm" variant="outline" onClick={() => onUploaded("")} className="h-8 rounded-md border-[#b8d8dc] px-3 text-xs text-[#9a6464]"><X className="h-3.5 w-3.5" />إزالة</Button> : null}</div><input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onFileChange} className="mt-3 block w-full cursor-pointer rounded-md border border-[#b8d8dc] bg-white px-2 py-1 text-[11px] text-[#617a80] file:me-2 file:rounded-md file:border-0 file:bg-[#e5f3f4] file:px-2 file:py-1 file:text-[11px] file:font-bold file:text-[#16717d]" /></div></div></div>;
}
