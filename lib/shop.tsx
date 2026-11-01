"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { PRODUCTS } from "@/data/products";

type Ctx = { products: any[]; categories: string[]; category: string | null; setCategory: (c: string | null) => void };
const ShopCtx = createContext<Ctx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<any[]>(PRODUCTS); // static first = never empty
  const [category, setCategory] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/products").then(r => (r.ok ? r.json() : null)).then(d => { if (Array.isArray(d) && d.length) setProducts(d); }).catch(() => {});
  }, []);
  const categories = useMemo(() => Array.from(new Set(products.filter(p => p.active && p.stock > 0).map(p => p.category as string))), [products]);
  return <ShopCtx.Provider value={{ products, categories, category, setCategory }}>{children}</ShopCtx.Provider>;
}
export const useShop = () => { const c = useContext(ShopCtx); if (!c) throw new Error("useShop outside ShopProvider"); return c; };
