import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { RequestCartProvider } from "@/contexts/RequestCartContext";
import Home from "@/pages/Home";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Admin = lazy(() => import("@/pages/Admin"));
const Category = lazy(() => import("@/pages/Category"));
const Contact = lazy(() => import("@/pages/Contact"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Shop = lazy(() => import("@/pages/Shop"));

function RouteLoading() {
  return <div className="grid min-h-[42vh] place-items-center bg-[#f8f6f0]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#b8d8dc] border-t-[#16717d]" /></div>;
}

function Router() {
  return <Suspense fallback={<RouteLoading />}><Switch><Route path="/" component={Home} /><Route path="/shop" component={Shop} /><Route path="/services/:slug" component={Category} /><Route path="/products/:handle" component={ProductDetail} /><Route path="/contact" component={Contact} /><Route path="/admin/:section" component={Admin} /><Route path="/admin" component={Admin} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><LocaleProvider><RequestCartProvider><Toaster richColors position="top-center" /><Router /></RequestCartProvider></LocaleProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
