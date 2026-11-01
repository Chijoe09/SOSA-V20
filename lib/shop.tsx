"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { PRODUCTS } from "@/data/products";

type Ctx = { products: any[]; categories: string[]; category: string | null; setCategory: (c: string | null) => void; subCategory: string | null; setSubCategory: (c: string | null) => void; };

const Ctx = createContext<Ctx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<any[]>(PRODUCTS);
  const [category, setCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) setProducts(d); }).catch(() => {});
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.filter(p => p.active && p.stock > 0).map(p => p.category as string))), [products]);

  return <Ctx.Provider value={{ products, categories, category, setCategory, subCategory, setSubCategory }}>{children}</Ctx.Provider>;
}

export const useShop = () => { const c = useContext(Ctx); if (!c) throw new Error("useShop outside ShopProvider"); return c; };

export const fmt = (n: number) => `₦${Number(n).toLocaleString()}`;
