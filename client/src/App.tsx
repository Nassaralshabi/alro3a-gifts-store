import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { RequestCartProvider } from "@/contexts/RequestCartContext";
import Admin from "@/pages/Admin";
import Category from "@/pages/Category";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import ProductDetail from "@/pages/ProductDetail";
import Shop from "@/pages/Shop";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/shop" component={Shop} /><Route path="/services/:slug" component={Category} /><Route path="/products/:handle" component={ProductDetail} /><Route path="/contact" component={Contact} /><Route path="/admin/:section" component={Admin} /><Route path="/admin" component={Admin} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><LocaleProvider><RequestCartProvider><Toaster richColors position="top-center" /><Router /></RequestCartProvider></LocaleProvider></TooltipProvider></ThemeProvider></ErrorBoundary>; }
