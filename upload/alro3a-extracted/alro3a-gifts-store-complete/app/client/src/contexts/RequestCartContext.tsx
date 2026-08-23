import type { CatalogProduct } from "@shared/store/types";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type RequestCartLine = { entry: CatalogProduct; quantity: number };
type RequestCartContextValue = {
  items: RequestCartLine[];
  totalItems: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addProduct: (entry: CatalogProduct) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeProduct: (productId: number) => void;
  clearCart: () => void;
};

const RequestCartContext = createContext<RequestCartContextValue | null>(null);
const STORAGE_KEY = "alro3a-request-cart";

export function RequestCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RequestCartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => { try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved) setItems(JSON.parse(saved)); } catch { /* Start with an empty cart if storage is unavailable. */ } }, []);
  useEffect(() => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* Cart still works in memory. */ } }, [items]);
  const value = useMemo<RequestCartContextValue>(() => ({
    items,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addProduct: entry => { setItems(current => { const match = current.find(item => item.entry.product.id === entry.product.id); return match ? current.map(item => item.entry.product.id === entry.product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { entry, quantity: 1 }]; }); setIsOpen(true); },
    setQuantity: (productId, quantity) => setItems(current => quantity < 1 ? current.filter(item => item.entry.product.id !== productId) : current.map(item => item.entry.product.id === productId ? { ...item, quantity } : item)),
    removeProduct: productId => setItems(current => current.filter(item => item.entry.product.id !== productId)),
    clearCart: () => setItems([]),
  }), [items, isOpen]);
  return <RequestCartContext.Provider value={value}>{children}</RequestCartContext.Provider>;
}

export function useRequestCart() { const context = useContext(RequestCartContext); if (!context) throw new Error("useRequestCart must be used within RequestCartProvider"); return context; }
