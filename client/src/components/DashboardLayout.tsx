import { useAuth } from "@/_core/hooks/useAuth";
import { useLocale } from "@/contexts/LocaleContext";
import { startLogin } from "@/const";
import { Boxes, ClipboardList, LayoutDashboard, LogOut, Menu, PackagePlus, PanelLeft, PhoneCall, Settings2 } from "lucide-react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const adminItems = [
  { path: "/admin", icon: LayoutDashboard, ar: "نظرة عامة", en: "Overview" },
  { path: "/admin/products", icon: PackagePlus, ar: "المنتجات", en: "Products" },
  { path: "/admin/categories", icon: Boxes, ar: "التصنيفات", en: "Categories" },
  { path: "/admin/orders", icon: ClipboardList, ar: "الطلبات", en: "Orders" },
  { path: "/admin/contact", icon: PhoneCall, ar: "بيانات التواصل", en: "Contact details" },
  { path: "/admin/content", icon: Settings2, ar: "محتوى الموقع", en: "Site content" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const { isArabic } = useLocale();
  const [location, setLocation] = useLocation();
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <div className="grid min-h-screen place-items-center bg-[#fffdf8] px-5"><div className="w-full max-w-md rounded-3xl border border-[#e9e3d6] bg-white p-8 text-center shadow-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f0eaf5] text-[#7953a2]"><PanelLeft className="h-6 w-6" /></div><h1 className="mt-5 font-display text-2xl">{isArabic ? "تسجيل الدخول مطلوب" : "Sign-in required"}</h1><p className="mt-2 text-sm leading-7 text-[#766f69]">{isArabic ? "استخدمي حساب المالك للوصول إلى لوحة الإدارة." : "Use the owner account to access the admin panel."}</p><Button onClick={() => startLogin()} className="mt-6 h-11 w-full rounded-xl bg-[#7953a2] hover:bg-[#654287]">{isArabic ? "تسجيل الدخول" : "Sign in"}</Button></div></div>;
  return <SidebarProvider><Sidebar side={isArabic ? "right" : "left"} collapsible="icon" className="border-0"><SidebarHeader className="h-20 border-b border-[#e9e3d6] px-3"><button onClick={() => setLocation("/admin")} className="flex w-full items-center gap-3 px-2 text-start"><img src="/manus-storage/social-1_e277342a.jpg" alt="" className="h-10 w-10 rounded-full" /><div className="group-data-[collapsible=icon]:hidden"><span className="block font-display text-base">{isArabic ? "مطبعة الروعة" : "Al Rawaa"}</span><span className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#a27ab2]">{isArabic ? "لوحة الإدارة" : "ADMIN PANEL"}</span></div></button></SidebarHeader><SidebarContent className="p-2"><SidebarMenu>{adminItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} tooltip={isArabic ? item.ar : item.en} className="h-11 rounded-xl"><item.icon className="h-4 w-4" /><span>{isArabic ? item.ar : item.en}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="border-t border-[#e9e3d6] p-3"><div className="flex items-center gap-3 px-2"><Avatar className="h-9 w-9"><AvatarFallback className="bg-[#f0eaf5] text-[#7953a2]">{user.name?.slice(0, 1).toUpperCase() || "A"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-bold">{user.name || (isArabic ? "مدير" : "Admin")}</p><p className="truncate text-[10px] text-[#766f69]">{user.role}</p></div><button onClick={logout} className="grid h-8 w-8 place-items-center rounded-full text-[#9a6464] hover:bg-[#fff0f0]" aria-label={isArabic ? "تسجيل الخروج" : "Sign out"}><LogOut className="h-4 w-4" /></button></div></SidebarFooter></Sidebar><SidebarInset className="bg-[#fffdf8]"><div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e9e3d6] bg-[#fffdf8]/95 px-4 backdrop-blur"><SidebarTrigger className="rounded-xl" /><Menu className="h-4 w-4 text-[#a27ab2]" /><span className="text-sm font-bold text-[#766f69]">{isArabic ? "إدارة المتجر الداخلي" : "Internal store management"}</span></div><main className="p-4 sm:p-6">{children}</main></SidebarInset></SidebarProvider>;
}
