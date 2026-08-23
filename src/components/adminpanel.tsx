"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Lock, LayoutDashboard, Package, Layers, ClipboardList, Settings as SettingsIcon,
  LogOut, Upload, Search, Plus, Pencil, Trash2, Check, X, Loader2, Eye,
  Store as StoreIcon, AlertTriangle,
} from "lucide-react";
import { useApp, money, api, Category, Product, Order, HeroSlide } from "./core";
import { ProductsManager, CategoriesManager, OrdersManager, SettingsManager } from "./admin/managers";
import { toast } from "sonner";

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23eef1f3'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.35em' fill='%23a6b0b6' font-family='sans-serif' font-size='16'%3EAl Rawaa%3C/text%3E%3C/svg%3E";

type Tab = "dash" | "products" | "categories" | "orders" | "settings";

/* ================= Login screen ================= */
export function LoginScreen({ onOk }: { onOk: (user: { username: string; name: string }) => void }) {
  const { T, isAr } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true); setErr("");
    const { ok } = await api.login(username.trim(), password);
    if (ok) {
      const me = await api.me();
      onOk(me ?? { username: username.trim(), name: username.trim() });
    } else {
      setErr(T("admWrong"));
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#f7f8f9] p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-[#e4e7e9] rounded-3xl p-8 shadow-[0_24px_48px_-30px_rgba(35,41,46,.35)] text-center">
        <div className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8d98a0] to-[#6e7981] text-white shadow-lg"><Lock className="w-7 h-7" /></div>
        <h1 className="mt-5 text-2xl">{T("admPanel")}</h1>
        <p className="text-[12px] text-[#6c767d] mt-1.5 leading-relaxed">{isAr ? "أدخل بيانات الدخول للوصول إلى لوحة التحكم" : "Enter your credentials to access the admin panel"}</p>
        <div className="grid gap-2.5 mt-6 text-start">
          <div>
            <label className="text-[11px] font-extrabold text-[#6c767d]">{T("admUser")}</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus className="fld mt-1" placeholder="admin" />
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-[#6c767d]">{T("admPass")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="fld mt-1" placeholder="••••••" />
          </div>
        </div>
        {err && <p className="text-[12px] font-bold text-[#a33333] bg-[#fbe9e9] rounded-lg py-2 mt-3">{err}</p>}
        <button type="submit" disabled={busy} className="btn-solid w-full mt-5">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{T("admLogin")}</button>
        <p className="text-[10px] text-[#9aa5ac] mt-4">{isAr ? "البيانات الافتراضية: admin / admin" : "Default credentials: admin / admin"}</p>
        <a href="#/" className="block text-[12px] font-extrabold text-[#45505a] hover:underline mt-4"><StoreIcon className="w-3.5 h-3.5 inline mx-1" />{T("viewSite")}</a>
      </form>
    </div>
  );
}

/* ================= Image uploader ================= */
export function ImageUploader({ value, onChange, label }: { value: string | null; onChange: (url: string) => void; label: string }) {
  const { T } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const upload = useCallback(async (file: File) => {
    setBusy(true);
    const url = await api.uploadImage(file);
    setBusy(false);
    if (url) { onChange(url); toast.success(T("uploadOk")); }
    else toast.error(T("uploadErr"));
  }, [onChange, T]);

  return (
    <div>
      <label className="text-[11px] font-extrabold text-[#6c767d]">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f); }}
        className={`mt-1.5 flex items-center gap-4 border-2 border-dashed rounded-2xl p-3 transition-colors cursor-pointer ${drag ? "border-[#45505a] bg-[#f4f6f7]" : "border-[#d2d8db] hover:border-[#9aa5ac] bg-[#fafbfc]"}`}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
           
          <img src={value} alt="" className="w-16 h-16 rounded-xl object-cover ring-1 ring-[#e4e7e9]" />
        ) : (
          <span className="grid place-items-center w-16 h-16 rounded-xl bg-[#eef1f3] text-[#8a949b]"><Upload className="w-6 h-6" /></span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-extrabold text-[#454f57]">{busy ? T("uploading") : T("uploadImg")}</p>
          <p className="text-[10px] text-[#8a949b] mt-0.5 leading-relaxed">{value ? value.slice(0, 48) + "…" : "JPG / PNG / WEBP / SVG ≤ 8MB — drag & drop"}</p>
        </div>
        {busy && <Loader2 className="w-5 h-5 animate-spin text-[#45505a]" />}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
    </div>
  );
}

/* ================= Dashboard ================= */
function Dash({ orders, products, categories, setTab }: { orders: Order[]; products: Product[]; categories: Category[]; setTab: (t: Tab) => void }) {
  const { T, isAr, lang } = useApp();
  const stats = [
    { icon: <Package className="w-5 h-5" />, v: products.length, l: T("stProducts"), g: "from-[#8d98a0] to-[#6e7981]" },
    { icon: <Layers className="w-5 h-5" />, v: categories.length, l: T("stCats"), g: "from-[#b0bac1] to-[#939ea5]" },
    { icon: <ClipboardList className="w-5 h-5" />, v: orders.length, l: T("stOrders"), g: "from-[#7e8991] to-[#5f6a72]" },
    { icon: <ClipboardList className="w-5 h-5" />, v: orders.filter((o) => o.status === "new").length, l: T("stNew"), g: "from-[#99a4ab] to-[#7a8590]" },
  ];
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-[#e4e7e9] rounded-2xl p-4 shadow-[0_18px_34px_-30px_rgba(35,41,46,.9)]">
            <span className={`grid place-items-center w-10 h-10 rounded-xl text-white bg-gradient-to-br ${s.g} mb-3`}>{s.icon}</span>
            <b className="block text-2xl leading-tight">{s.v}</b>
            <span className="text-[11px] font-bold text-[#6c767d]">{s.l}</span>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#e4e7e9] rounded-2xl p-5 shadow-sm mt-5">
        <h2 className="text-[15px] font-black flex items-center gap-2"><ClipboardList className="w-4 h-4 text-[#45505a]" />{T("recentOrders")}</h2>
        {orders.length === 0 ? (
          <p className="text-[13px] text-[#6c767d] py-10 text-center">{T("noOrders")}</p>
        ) : (
          <div className="overflow-x-auto mt-3 border border-[#eef0f2] rounded-xl">
            <table className="w-full text-[12px] min-w-[560px]">
              <thead>
                <tr className="bg-[#f7f8f9] text-start">
                  <th className="p-2.5 text-[10px] font-black tracking-wider uppercase text-[#6c767d] text-start">#</th>
                  <th className="p-2.5 text-[10px] font-black tracking-wider uppercase text-[#6c767d] text-start">{T("orderCustomer")}</th>
                  <th className="p-2.5 text-[10px] font-black tracking-wider uppercase text-[#6c767d] text-start">{T("orderItems")}</th>
                  <th className="p-2.5 text-[10px] font-black tracking-wider uppercase text-[#6c767d] text-start">{T("orderStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-t border-[#eef0f2] hover:bg-[#fbfcfd]">
                    <td className="p-2.5 font-extrabold">{o.ref}</td>
                    <td className="p-2.5">
                      <div className="font-bold">{o.name}</div>
                      <div dir="ltr" className="text-[10px] text-[#5c6870]">{o.phone}</div>
                    </td>
                    <td className="p-2.5 text-[#5d6870]">{o.items.length} {isAr ? "قطعة" : "items"}</td>
                    <td className="p-2.5">
                      <span className={`chip ${o.status === "new" ? "chip-new" : o.status === "confirmed" ? "chip-conf" : "chip-done"}`}>
                        {o.status === "new" ? T("stNewL") : o.status === "confirmed" ? T("stConfirmL") : T("stDoneL")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button onClick={() => setTab("orders")} className="btn-ghost mt-4 h-10 text-[12px]">{isAr ? "كل الطلبات" : "All orders"}</button>
      </div>
    </>
  );
}

/* ================= Admin shell ================= */
export default function AdminPanel() {
  const { T, isAr, toggleLang, logo, reloadCatalog } = useApp();
  const [user, setUser] = useState<{ username: string; name: string } | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("dash");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await api.me();
      setUser(me);
    })();
  }, []);

  const refresh = useCallback(async () => {
    const [ps, cs, os] = await Promise.all([api.getProducts(), api.getCategories(), api.getOrders()]);
    if (ps) setProducts(ps);
    if (cs) setCategories(cs);
    if (os) setOrders(os);
    await reloadCatalog();
    setLoading(false);
  }, [reloadCatalog]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refresh();
    }
  }, [user, refresh]);

  if (user === undefined)
    return <div className="min-h-screen grid place-items-center bg-[#f7f8f9]"><Loader2 className="w-8 h-8 animate-spin text-[#45505a]" /></div>;

  if (!user) return <LoginScreen onOk={(u) => setUser(u)} />;

  const tabs: Array<[Tab, string, React.ReactNode]> = [
    ["dash", T("admDash"), <LayoutDashboard key="dash" className="w-4 h-4" />],
    ["products", T("admProducts"), <Package key="products" className="w-4 h-4" />],
    ["categories", T("admCategories"), <Layers key="categories" className="w-4 h-4" />],
    ["orders", T("admOrders"), <ClipboardList key="orders" className="w-4 h-4" />],
    ["settings", T("admSettings"), <SettingsIcon key="settings" className="w-4 h-4" />],
  ];
  const newOrders = orders.filter((o) => o.status === "new").length;

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      {/* sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#f2f4f5] border-e border-[#e4e7e9] p-4 shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#e4e7e9] mb-4">
          { }
          <img src={logo} alt="" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <b className="block text-[15px] text-[#33393e]">{T("admPanel")}</b>
            <span className="text-[10px] text-[#9a6b13] font-extrabold">Al Rawaa</span>
          </div>
        </div>
        <nav className="grid gap-1">
          {tabs.map(([k, label, icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-start transition-colors ${tab === k ? "bg-[#33393e] text-white" : "text-[#566169] hover:bg-[#e8ebee] hover:text-[#33393e]"}`}>
              {icon}{label}
              {k === "orders" && newOrders > 0 && <span className="ms-auto chip chip-new">{newOrders}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto grid gap-2 pt-4">
          <a href="#/" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-[#566169] hover:bg-[#e8ebee] hover:text-[#33393e]"><StoreIcon className="w-4 h-4" />{T("viewSite")}</a>
          <button onClick={async () => { await api.logout(); setUser(null); }} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-[#566169] hover:bg-[#e8ebee] hover:text-[#33393e]"><LogOut className="w-4 h-4" />{T("admExit")}</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-[#e4e7e9] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg truncate">{T("admPanel")}</h1>
            {isAr ? "" : ""}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[12px] font-bold text-[#6c767d]">{user.name} ({user.username})</span>
            <button onClick={toggleLang} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#f4f6f7] text-[12px] font-extrabold text-[#454f57] hover:bg-[#e7eaec]">{isAr ? "English" : "العربية"}</button>
            <a href="#/" className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#f4f6f7] text-[12px] font-extrabold text-[#454f57] hover:bg-[#e7eaec]"><StoreIcon className="w-4 h-4" />{T("viewSite")}</a>
          </div>
        </header>

        {/* mobile tabs */}
        <div className="lg:hidden flex gap-1.5 overflow-x-auto px-4 py-2.5 bg-white border-b border-[#e4e7e9]">
          {tabs.map(([k, label, icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[12px] font-extrabold ${tab === k ? "bg-[#33393e] text-white" : "bg-[#f4f6f7] text-[#566169]"}`}>
              {icon}{label}
              {k === "orders" && newOrders > 0 && <span className="chip chip-new">{newOrders}</span>}
            </button>
          ))}
        </div>

        <main className="p-4 sm:p-6">
          {loading ? (
            <div className="grid place-items-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#45505a]" /></div>
          ) : (
            <>
              {tab === "dash" && <Dash orders={orders} products={products} categories={categories} setTab={setTab} />}
              {tab === "products" && <ProductsManager products={products} categories={categories} refresh={refresh} />}
              {tab === "categories" && <CategoriesManager categories={categories} refresh={refresh} />}
              {tab === "orders" && <OrdersManager orders={orders} refresh={refresh} />}
              {tab === "settings" && <SettingsManager refreshCatalog={reloadCatalog} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
