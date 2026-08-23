"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Package, Layers, ClipboardList, Settings as SettingsIcon, Plus, Pencil, Trash2,
  Check, X, Loader2, Search, Upload, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useApp, money, api, Category, Product, Order, HeroSlide } from "../core";
import { FALLBACK } from "../store/bits";
import { ImageUploader } from "../adminpanel";

/* ================= Products manager ================= */
type ProdForm = {
  id?: number; categoryId: number; slug: string; titleAr: string; titleEn: string;
  descAr: string; descEn: string; price: string; image: string | null;
  isFeatured: boolean; isAvailable: boolean; sortOrder: string;
};

export function ProductsManager({ products, categories, refresh }: { products: Product[]; categories: Category[]; refresh: () => Promise<void> }) {
  const { T, isAr, lang } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(0);
  const [form, setForm] = useState<ProdForm | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    let l = products;
    if (cat) l = l.filter((p) => p.categoryId === cat);
    if (q.trim()) { const s = q.trim().toLowerCase(); l = l.filter((p) => (p.titleAr || "").toLowerCase().includes(s) || (p.titleEn || "").toLowerCase().includes(s) || (p.slug || "").includes(s)); }
    return l;
  }, [products, q, cat]);

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form) return;
    setBusy(true);
    const payload: Record<string, unknown> = {
      categoryId: form.categoryId,
      slug: form.slug.trim(),
      titleAr: form.titleAr.trim(),
      titleEn: form.titleEn.trim(),
      descAr: form.descAr,
      descEn: form.descEn,
      price: form.price.trim() === "" ? null : Number(form.price),
      image: form.image,
      isFeatured: form.isFeatured,
      isAvailable: form.isAvailable,
      sortOrder: Number(form.sortOrder) || 0,
    };
    const { ok, data } = await api.saveProduct(payload, form.id);
    setBusy(false);
    if (ok) { toast.success(T("saved")); setForm(null); await refresh(); }
    else if ((data as { error?: string }).error === "SLUG_EXISTS") toast.error(isAr ? "المعرّف مستخدم مسبقاً" : "Slug already exists");
    else toast.error(isAr ? "تحقق من الحقول (المعرّف بحروف إنجليزية وأرقام فقط)" : "Check fields (slug: lowercase english/hyphens)");
  }

  async function del(p: Product) {
    if (!confirm(T("confirmDel"))) return;
    if (await api.deleteProduct(p.id)) { toast.success(T("deleted")); await refresh(); }
  }

  return (
    <div className="bg-white border border-[#e4e7e9] rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-black flex items-center gap-2"><Package className="w-4 h-4 text-[#45505a]" />{T("admProducts")}<span className="chip chip-new">{products.length}</span></h2>
        <button onClick={() => setForm({ categoryId: categories[0]?.id ?? 1, slug: "", titleAr: "", titleEn: "", descAr: "", descEn: "", price: "", image: null, isFeatured: false, isAvailable: true, sortOrder: "0" })} className="btn-solid h-10 text-[12px]"><Plus className="w-4 h-4" />{T("newProd")}</button>
      </div>
      <div className="flex flex-wrap gap-2.5 mt-4">
        <div className="flex-1 min-w-44 max-w-80 flex items-center gap-2 h-10 rounded-xl border border-[#e1e5e8] bg-[#f7f8f9] px-3 focus-within:border-[#45505a] transition-colors">
          <Search className="w-4 h-4 text-[#626d74]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("searchProd")} className="flex-1 bg-transparent outline-none text-[13px] min-w-0" />
        </div>
        <select value={cat} onChange={(e) => setCat(Number(e.target.value))} className="h-10 rounded-xl border border-[#e1e5e8] bg-[#f7f8f9] px-3 text-[12px] font-bold text-[#454f57] outline-none">
          <option value={0}>{T("allCats")}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{lang === "ar" ? c.titleAr : c.titleEn}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto mt-4 border border-[#eef0f2] rounded-xl">
        <table className="w-full text-[12px] min-w-[760px]">
          <thead>
            <tr className="bg-[#f7f8f9]">
              <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("colProd")}</th>
              <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("colCat")}</th>
              <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("colPrice")}</th>
              <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("featured")}</th>
              <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("colAvail")}</th>
              <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {list.slice(0, 100).map((p) => (
              <tr key={p.id} className="border-t border-[#eef0f2] hover:bg-[#fbfcfd]">
                <td className="p-2.5">
                  <div className="flex items-center gap-2.5">
                    { }
                    <img src={p.image ?? FALLBACK} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="font-extrabold max-w-52 truncate">{lang === "ar" ? p.titleAr : p.titleEn}</div>
                      <div className="text-[10px] text-[#8a949b]">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-2.5 text-[11px] font-bold text-[#5c6870]">{p.category ? (lang === "ar" ? p.category.titleAr : p.category.titleEn) : "—"}</td>
                <td className="p-2.5">{money(p.price, lang) ?? <span className="chip chip-conf">{T("priceReq")}</span>}</td>
                <td className="p-2.5">{p.isFeatured ? <span className="chip chip-new">{T("pick")}</span> : <span className="text-[#c3cbd1]">—</span>}</td>
                <td className="p-2.5">
                  <button
                    onClick={async () => { await api.saveProduct({ isAvailable: !p.isAvailable }, p.id); await refresh(); }}
                    className={`chip ${p.isAvailable ? "chip-conf" : "chip-off"}`}
                  >{p.isAvailable ? T("stConfirmL").replace("مؤكد", "متاح").replace("Confirmed", "Available") : T("unavailable")}</button>
                </td>
                <td className="p-2.5">
                  <div className="flex gap-1.5">
                    <button onClick={() => setForm({ id: p.id, categoryId: p.categoryId, slug: p.slug, titleAr: p.titleAr, titleEn: p.titleEn, descAr: p.descAr, descEn: p.descEn, price: p.price?.toString() ?? "", image: p.image, isFeatured: p.isFeatured, isAvailable: p.isAvailable, sortOrder: p.sortOrder.toString() })} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-[#e1e5e8] bg-white text-[11px] font-extrabold text-[#454f57] hover:border-[#45505a]"><Pencil className="w-3.5 h-3.5" />{T("edit")}</button>
                    <button onClick={() => del(p)} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-[#e1e5e8] bg-white text-[11px] font-extrabold text-[#a33333] hover:border-[#a33333]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length > 100 && <p className="text-[11px] text-[#8a949b] mt-2">… {list.length - 100}+</p>}

      {/* modal form */}
      {form && (
        <div className="fixed inset-0 z-[80] bg-[#1e2328]/55 backdrop-blur-sm grid place-items-center p-4" onClick={() => setForm(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef0f2] pb-4">
              <h3 className="text-lg font-black">{form.id ? T("edit") : T("newProd")}</h3>
              <button type="button" onClick={() => setForm(null)} className="grid place-items-center w-9 h-9 rounded-full hover:bg-[#f4f6f7]"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3.5 mt-4">
              <div className="sm:col-span-2"><ImageUploader label={T("uploadImg")} value={form.image} onChange={(url) => setForm((f) => (f ? { ...f, image: url } : f))} /></div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("nameAr")} *</label>
                <input required value={form.titleAr} onChange={(e) => setForm((f) => f ? { ...f, titleAr: e.target.value } : f)} className="fld mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("nameEn")} *</label>
                <input required dir="ltr" value={form.titleEn} onChange={(e) => setForm((f) => f ? { ...f, titleEn: e.target.value } : f)} className="fld mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("descAr")}</label>
                <textarea value={form.descAr} onChange={(e) => setForm((f) => f ? { ...f, descAr: e.target.value } : f)} className="fld-area mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("descEn")}</label>
                <textarea dir="ltr" value={form.descEn} onChange={(e) => setForm((f) => f ? { ...f, descEn: e.target.value } : f)} className="fld-area mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("catLbl")} *</label>
                <select value={form.categoryId} onChange={(e) => setForm((f) => f ? { ...f, categoryId: Number(e.target.value) } : f)} className="fld mt-1 cursor-pointer">
                  {categories.map((c) => <option key={c.id} value={c.id}>{lang === "ar" ? c.titleAr : c.titleEn}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("priceLbl")}</label>
                <input inputMode="decimal" dir="ltr" value={form.price} onChange={(e) => setForm((f) => f ? { ...f, price: e.target.value.replace(/[^0-9.]/g, "") } : f)} className="fld mt-1" placeholder="60" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("slug")} *</label>
                <input required dir="ltr" pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => setForm((f) => f ? { ...f, slug: e.target.value.toLowerCase() } : f)} className="fld mt-1" placeholder="my-product" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("sortBy")}</label>
                <input inputMode="numeric" dir="ltr" value={form.sortOrder} onChange={(e) => setForm((f) => f ? { ...f, sortOrder: e.target.value.replace(/[^0-9]/g, "") } : f)} className="fld mt-1" />
              </div>
              <label className="flex items-center gap-2.5 text-[13px] font-bold cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => f ? { ...f, isFeatured: e.target.checked } : f)} className="w-4.5 h-4.5 w-[18px] h-[18px] accent-[#45505a]" />
                {T("featured")}
              </label>
              <label className="flex items-center gap-2.5 text-[13px] font-bold cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((f) => f ? { ...f, isAvailable: e.target.checked } : f)} className="w-[18px] h-[18px] accent-[#45505a]" />
                {T("colAvail")}
              </label>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button type="submit" disabled={busy} className="btn-solid flex-1">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{T("save")}</button>
              <button type="button" onClick={() => setForm(null)} className="btn-ghost">{isAr ? "إلغاء" : "Cancel"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ================= Categories manager ================= */
type CatForm = { id?: number; slug: string; titleAr: string; titleEn: string; descAr: string; descEn: string; icon: string; image: string | null; sortOrder: string; isActive: boolean };

export function CategoriesManager({ categories, refresh }: { categories: Category[]; refresh: () => Promise<void> }) {
  const { T, isAr, lang } = useApp();
  const [form, setForm] = useState<CatForm | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form) return;
    setBusy(true);
    const payload = {
      slug: form.slug.trim(), titleAr: form.titleAr.trim(), titleEn: form.titleEn.trim(),
      descAr: form.descAr, descEn: form.descEn, icon: form.icon, image: form.image,
      sortOrder: Number(form.sortOrder) || 0, isActive: form.isActive,
    };
    const { ok, data } = await api.saveCategory(payload, form.id);
    setBusy(false);
    if (ok) { toast.success(T("saved")); setForm(null); await refresh(); }
    else if ((data as { error?: string }).error === "SLUG_EXISTS") toast.error(isAr ? "المعرّف مستخدم مسبقاً" : "Slug already exists");
    else toast.error(isAr ? "تحقق من الحقول" : "Check fields");
  }

  async function del(c: Category) {
    const n = c._count?.products ?? 0;
    if (n > 0 && !confirm(T("confirmDelProducts"))) return;
    if (n === 0 && !confirm(T("confirmDel"))) return;
    const res = await api.deleteCategory(c.id, n > 0);
    if (res === "ok") { toast.success(T("deleted")); await refresh(); }
    else if (res === "not-empty") toast.error(T("confirmDelProducts"));
    else toast.error(isAr ? "فشل الحذف" : "Delete failed");
  }

  return (
    <div className="bg-white border border-[#e4e7e9] rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-black flex items-center gap-2"><Layers className="w-4 h-4 text-[#45505a]" />{T("admCategories")}<span className="chip chip-new">{categories.length}</span></h2>
        <button onClick={() => setForm({ slug: "", titleAr: "", titleEn: "", descAr: "", descEn: "", icon: "Package", image: null, sortOrder: "0", isActive: true })} className="btn-solid h-10 text-[12px]"><Plus className="w-4 h-4" />{T("newCat")}</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {categories.map((c) => (
          <div key={c.id} className="border border-[#e4e7e9] rounded-2xl p-4 bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              {c.image ? (
                 
                <img src={c.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#eef1f3] text-[#45505a]"><Layers className="w-5 h-5" /></span>
              )}
              <div className="flex-1 min-w-0">
                <b className="block text-[13px] truncate">{lang === "ar" ? c.titleAr : c.titleEn}</b>
                <span className="text-[10px] text-[#8a949b]">{c.slug}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#6c767d] mt-2.5 line-clamp-2 leading-relaxed min-h-8">{lang === "ar" ? c.descAr : c.descEn}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="chip chip-conf">{c._count?.products ?? 0} {isAr ? "منتج" : "products"}</span>
              <div className="flex gap-1.5">
                <button onClick={() => setForm({ id: c.id, slug: c.slug, titleAr: c.titleAr, titleEn: c.titleEn, descAr: c.descAr, descEn: c.descEn, icon: c.icon, image: c.image, sortOrder: c.sortOrder.toString(), isActive: c.isActive })} className="inline-flex items-center h-8 px-2.5 rounded-lg border border-[#e1e5e8] text-[11px] font-extrabold text-[#454f57] hover:border-[#45505a]"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => del(c)} className="inline-flex items-center h-8 px-2.5 rounded-lg border border-[#e1e5e8] text-[11px] font-extrabold text-[#a33333] hover:border-[#a33333]"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <div className="fixed inset-0 z-[80] bg-[#1e2328]/55 backdrop-blur-sm grid place-items-center p-4" onClick={() => setForm(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef0f2] pb-4">
              <h3 className="text-lg font-black">{form.id ? T("edit") : T("newCat")}</h3>
              <button type="button" onClick={() => setForm(null)} className="grid place-items-center w-9 h-9 rounded-full hover:bg-[#f4f6f7]"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3.5 mt-4">
              <div className="sm:col-span-2"><ImageUploader label={T("uploadImg")} value={form.image} onChange={(url) => setForm((f) => (f ? { ...f, image: url } : f))} /></div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("nameAr")} *</label>
                <input required value={form.titleAr} onChange={(e) => setForm((f) => f ? { ...f, titleAr: e.target.value } : f)} className="fld mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("nameEn")} *</label>
                <input required dir="ltr" value={form.titleEn} onChange={(e) => setForm((f) => f ? { ...f, titleEn: e.target.value } : f)} className="fld mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("descAr")}</label>
                <textarea value={form.descAr} onChange={(e) => setForm((f) => f ? { ...f, descAr: e.target.value } : f)} className="fld-area mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("descEn")}</label>
                <textarea dir="ltr" value={form.descEn} onChange={(e) => setForm((f) => f ? { ...f, descEn: e.target.value } : f)} className="fld-area mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("slug")} *</label>
                <input required dir="ltr" pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => setForm((f) => f ? { ...f, slug: e.target.value.toLowerCase() } : f)} className="fld mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-[#6c767d]">{T("sortBy")}</label>
                <input inputMode="numeric" dir="ltr" value={form.sortOrder} onChange={(e) => setForm((f) => f ? { ...f, sortOrder: e.target.value.replace(/[^0-9]/g, "") } : f)} className="fld mt-1" />
              </div>
              <label className="flex items-center gap-2.5 text-[13px] font-bold cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => f ? { ...f, isActive: e.target.checked } : f)} className="w-[18px] h-[18px] accent-[#45505a]" />
                {isAr ? "نشط في المتجر" : "Active in store"}
              </label>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button type="submit" disabled={busy} className="btn-solid flex-1">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{T("save")}</button>
              <button type="button" onClick={() => setForm(null)} className="btn-ghost">{isAr ? "إلغاء" : "Cancel"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ================= Orders manager ================= */
export function OrdersManager({ orders, refresh }: { orders: Order[]; refresh: () => Promise<void> }) {
  const { T, isAr } = useApp();
  const [filter, setFilter] = useState("all");

  const list = orders.filter((o) => filter === "all" || o.status === filter);

  async function setStatus(o: Order, status: string) {
    if (await api.updateOrder(o.id, { status })) await refresh();
  }
  async function del(o: Order) {
    if (!confirm(T("confirmDel"))) return;
    if (await api.deleteOrder(o.id)) { toast.success(T("deleted")); await refresh(); }
  }

  return (
    <div className="bg-white border border-[#e4e7e9] rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-black flex items-center gap-2"><ClipboardList className="w-4 h-4 text-[#45505a]" />{T("admOrders")}<span className="chip chip-new">{orders.length}</span></h2>
        <div className="flex gap-1.5">
          {[["all", isAr ? "الكل" : "All"], ["new", T("stNewL")], ["confirmed", T("stConfirmL")], ["done", T("stDoneL")]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`h-9 px-3.5 rounded-lg text-[12px] font-extrabold transition-colors ${filter === k ? "bg-[#45505a] text-white" : "bg-[#f4f6f7] text-[#566169] hover:bg-[#e7eaec]"}`}>{l}</button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-[13px] text-[#6c767d] py-14 text-center">{T("noOrders")}</p>
      ) : (
        <div className="overflow-x-auto mt-4 border border-[#eef0f2] rounded-xl">
          <table className="w-full text-[12px] min-w-[820px]">
            <thead>
              <tr className="bg-[#f7f8f9]">
                <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">#</th>
                <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("orderCustomer")}</th>
                <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("orderItems")}</th>
                <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("estTotal")}</th>
                <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("orderStatus")}</th>
                <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("orderDate")}</th>
                <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-[#6c767d] text-start">{T("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="border-t border-[#eef0f2] hover:bg-[#fbfcfd]">
                  <td className="p-2.5 font-extrabold">{o.ref}</td>
                  <td className="p-2.5">
                    <div className="font-bold">{o.name}</div>
                    <a href={`https://wa.me/${o.phone.replace(/^0/, "971").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" dir="ltr" className="text-[10px] text-[#45505a] hover:underline">{o.phone}</a>
                    {o.notes && <div className="text-[10px] text-[#8a949b] max-w-44 mt-1 leading-relaxed">{o.notes}</div>}
                  </td>
                  <td className="p-2.5">
                    <div className="bg-[#f7f8f9] rounded-lg p-2 text-[11px] text-[#5d6870] leading-relaxed max-w-56">
                      {o.items.map((it) => <div key={it.id} className="truncate">• {it.title} × {it.qty}</div>)}
                    </div>
                  </td>
                  <td className="p-2.5 font-extrabold">{o.total ? money(o.total, isAr ? "ar" : "en") : "—"}</td>
                  <td className="p-2.5">
                    <span className={`chip ${o.status === "new" ? "chip-new" : o.status === "confirmed" ? "chip-conf" : "chip-done"}`}>
                      {o.status === "new" ? T("stNewL") : o.status === "confirmed" ? T("stConfirmL") : T("stDoneL")}
                    </span>
                  </td>
                  <td className="p-2.5 text-[10px] text-[#6c767d] whitespace-nowrap">{new Date(o.createdAt).toLocaleString(isAr ? "ar-AE" : "en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="p-2.5">
                    <div className="flex gap-1.5">
                      {o.status !== "done" && (
                        <button onClick={() => setStatus(o, o.status === "new" ? "confirmed" : "done")} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-gradient-to-br from-[#45505a] to-[#5d6a74] text-white text-[11px] font-extrabold hover:brightness-110">
                          <Check className="w-3.5 h-3.5" />{o.status === "new" ? T("stConfirmL") : T("stDoneL")}
                        </button>
                      )}
                      <button onClick={() => del(o)} className="inline-flex items-center h-8 px-2.5 rounded-lg border border-[#e1e5e8] text-[11px] font-extrabold text-[#a33333] hover:border-[#a33333]"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================= Settings manager ================= */
type SettingsForm = {
  logo: string;
  phone: string; whatsapp: string; instagram: string;
  addressAr: string; addressEn: string;
  nameAr: string; nameEn: string; taglineAr: string; taglineEn: string;
  promoImage: string; promoTitleAr: string; promoTitleEn: string; promoBodyAr: string; promoBodyEn: string;
  slides: HeroSlide[];
};

export function SettingsManager({ refreshCatalog }: { refreshCatalog: () => Promise<void> }) {
  const { T, isAr } = useApp();
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const rows = await api.getSettings();
      if (!rows) { setLoading(false); return; }
      const map = new Map(rows.map((r) => [r.key, r]));
      const g = (k: string) => map.get(k)?.value ?? "";
      const gAr = (k: string) => map.get(k)?.valueAr ?? "";
      const gEn = (k: string) => map.get(k)?.valueEn ?? "";
      let slides: HeroSlide[] = [];
      try { slides = JSON.parse(g("hero.slides") || "[]"); } catch { slides = []; }
      setForm({
        logo: g("logo"),
        phone: g("contact.phone"), whatsapp: g("contact.whatsapp"), instagram: g("contact.instagram"),
        addressAr: gAr("contact.address"), addressEn: gEn("contact.address"),
        nameAr: gAr("site.name"), nameEn: gEn("site.name"),
        taglineAr: gAr("site.tagline"), taglineEn: gEn("site.tagline"),
        promoImage: g("promo.image"),
        promoTitleAr: gAr("promo.title"), promoTitleEn: gEn("promo.title"),
        promoBodyAr: gAr("promo.body"), promoBodyEn: gEn("promo.body"),
        slides: slides.length ? slides : [{ image: null, badgeAr: "", badgeEn: "", titleAr: "", titleEn: "", subAr: "", subEn: "" }],
      });
      setLoading(false);
    })();
  }, []);

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form) return;
    setBusy(true);
    const ok = await api.saveSettings({
      logo: { value: form.logo },
      "contact.phone": { value: form.phone },
      "contact.whatsapp": { value: form.whatsapp.replace(/[^0-9]/g, "") },
      "contact.instagram": { value: form.instagram.replace(/^@/, "") },
      "contact.address": { valueAr: form.addressAr, valueEn: form.addressEn },
      "site.name": { valueAr: form.nameAr, valueEn: form.nameEn },
      "site.tagline": { valueAr: form.taglineAr, valueEn: form.taglineEn },
      "promo.image": { value: form.promoImage },
      "promo.title": { valueAr: form.promoTitleAr, valueEn: form.promoTitleEn },
      "promo.body": { valueAr: form.promoBodyAr, valueEn: form.promoBodyEn },
      "hero.slides": { value: JSON.stringify(form.slides.filter((s) => s.image)) },
    });
    setBusy(false);
    if (ok) { toast.success(T("saved")); await refreshCatalog(); }
    else toast.error(isAr ? "فشل الحفظ" : "Save failed");
  }

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="w-7 h-7 animate-spin text-[#45505a]" /></div>;
  if (!form) return null;
  const set = (patch: Partial<SettingsForm>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const setSlide = (i: number, patch: Partial<HeroSlide>) =>
    setForm((f) => (f ? { ...f, slides: f.slides.map((s, j) => (j === i ? { ...s, ...patch } : s)) } : f));

  return (
    <form onSubmit={save} className="grid gap-5">
      {/* identity */}
      <div className="bg-white border border-[#e4e7e9] rounded-2xl p-5 shadow-sm">
        <h3 className="text-[15px] font-black flex items-center gap-2"><SettingsIcon className="w-4 h-4 text-[#45505a]" />{T("setSite")}</h3>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-4">
          <div className="sm:col-span-2"><ImageUploader label={T("logo")} value={form.logo || null} onChange={(url) => set({ logo: url })} /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{isAr ? "اسم الموقع (عربي)" : "Site name (Arabic)"}</label><input value={form.nameAr} onChange={(e) => set({ nameAr: e.target.value })} className="fld mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{isAr ? "اسم الموقع (إنجليزي)" : "Site name (English)"}</label><input dir="ltr" value={form.nameEn} onChange={(e) => set({ nameEn: e.target.value })} className="fld mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{isAr ? "الشعار النصي (عربي)" : "Tagline (Arabic)"}</label><input value={form.taglineAr} onChange={(e) => set({ taglineAr: e.target.value })} className="fld mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{isAr ? "الشعار النصي (إنجليزي)" : "Tagline (English)"}</label><input dir="ltr" value={form.taglineEn} onChange={(e) => set({ taglineEn: e.target.value })} className="fld mt-1" /></div>
        </div>
      </div>

      {/* contact */}
      <div className="bg-white border border-[#e4e7e9] rounded-2xl p-5 shadow-sm">
        <h3 className="text-[15px] font-black flex items-center gap-2"><Eye className="w-4 h-4 text-[#45505a]" />{T("setContact")}</h3>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-4">
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("setPhone")}</label><input dir="ltr" value={form.phone} onChange={(e) => set({ phone: e.target.value })} className="fld mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("setWa")}</label><input dir="ltr" inputMode="numeric" value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value.replace(/[^0-9]/g, "") })} className="fld mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("setIg")}</label><input dir="ltr" value={form.instagram} onChange={(e) => set({ instagram: e.target.value })} className="fld mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{isAr ? "العنوان (عربي)" : "Address (Arabic)"}</label><input value={form.addressAr} onChange={(e) => set({ addressAr: e.target.value })} className="fld mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{isAr ? "العنوان (إنجليزي)" : "Address (English)"}</label><input dir="ltr" value={form.addressEn} onChange={(e) => set({ addressEn: e.target.value })} className="fld mt-1" /></div>
        </div>
      </div>

      {/* hero slides */}
      <div className="bg-white border border-[#e4e7e9] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-[15px] font-black flex items-center gap-2"><Upload className="w-4 h-4 text-[#45505a]" />{T("setHero")}</h3>
          <button type="button" onClick={() => setForm((f) => f ? { ...f, slides: [...f.slides, { image: null, badgeAr: "", badgeEn: "", titleAr: "", titleEn: "", subAr: "", subEn: "" }] } : f)} className="btn-ghost h-9 text-[12px]"><Plus className="w-4 h-4" />{T("addSlide")}</button>
        </div>
        <div className="grid gap-4 mt-4">
          {form.slides.map((s, i) => (
            <div key={i} className="border border-[#eef0f2] rounded-2xl p-4 bg-[#fafbfc]">
              <div className="flex items-center justify-between mb-3">
                <b className="text-[13px]">{isAr ? `الشريحة ${i + 1}` : `Slide ${i + 1}`}</b>
                {form.slides.length > 1 && (
                  <button type="button" onClick={() => setForm((f) => f ? { ...f, slides: f.slides.filter((_, j) => j !== i) } : f)} className="text-[#a33333] hover:bg-[#fbe9e9] rounded-lg w-8 h-8 grid place-items-center"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2"><ImageUploader label={T("heroImg")} value={s.image} onChange={(url) => setSlide(i, { image: url })} /></div>
                <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("badge")} (AR)</label><input value={s.badgeAr} onChange={(e) => setSlide(i, { badgeAr: e.target.value })} className="fld mt-1" /></div>
                <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("badge")} (EN)</label><input dir="ltr" value={s.badgeEn} onChange={(e) => setSlide(i, { badgeEn: e.target.value })} className="fld mt-1" /></div>
                <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("title")} (AR)</label><input value={s.titleAr} onChange={(e) => setSlide(i, { titleAr: e.target.value })} className="fld mt-1" /></div>
                <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("title")} (EN)</label><input dir="ltr" value={s.titleEn} onChange={(e) => setSlide(i, { titleEn: e.target.value })} className="fld mt-1" /></div>
                <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("subtitle")} (AR)</label><input value={s.subAr} onChange={(e) => setSlide(i, { subAr: e.target.value })} className="fld mt-1" /></div>
                <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("subtitle")} (EN)</label><input dir="ltr" value={s.subEn} onChange={(e) => setSlide(i, { subEn: e.target.value })} className="fld mt-1" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* promo */}
      <div className="bg-white border border-[#e4e7e9] rounded-2xl p-5 shadow-sm">
        <h3 className="text-[15px] font-black flex items-center gap-2"><Eye className="w-4 h-4 text-[#45505a]" />{T("setPromo")}</h3>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-4">
          <div className="sm:col-span-2"><ImageUploader label={T("heroImg")} value={form.promoImage || null} onChange={(url) => set({ promoImage: url })} /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("title")} (AR)</label><input value={form.promoTitleAr} onChange={(e) => set({ promoTitleAr: e.target.value })} className="fld mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("title")} (EN)</label><input dir="ltr" value={form.promoTitleEn} onChange={(e) => set({ promoTitleEn: e.target.value })} className="fld mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("subtitle")} (AR)</label><textarea value={form.promoBodyAr} onChange={(e) => set({ promoBodyAr: e.target.value })} className="fld-area mt-1" /></div>
          <div><label className="text-[11px] font-extrabold text-[#6c767d]">{T("subtitle")} (EN)</label><textarea dir="ltr" value={form.promoBodyEn} onChange={(e) => set({ promoBodyEn: e.target.value })} className="fld-area mt-1" /></div>
        </div>
      </div>

      <div className="flex gap-2.5 sticky bottom-4">
        <button type="submit" disabled={busy} className="btn-solid min-w-40 shadow-xl">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{T("save")}</button>
      </div>
    </form>
  );
}

