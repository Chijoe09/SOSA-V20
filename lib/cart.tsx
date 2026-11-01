"use client";
import { createContext, useContext, useEffect, useMemo, useReducer, useState, ReactNode } from "react";

export type CartItem = { id: string; name: string; image: string; pricePi: number; size?: string; color?: string; qty: number };
export const lineKey = (i: Pick<CartItem, "id" | "size" | "color">) => `${i.id}|${i.size ?? ""}|${i.color ?? ""}`;
const KEY = "sosa-cart-v1";

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "qty">; qty?: number }
  | { type: "inc" | "dec" | "remove"; key: string }
  | { type: "clear" };

function reducer(s: CartItem[], a: Action): CartItem[] {
  switch (a.type) {
    case "hydrate": return a.items;
    case "add": {
      const k = lineKey(a.item), q = a.qty ?? 1;
      return s.some(i => lineKey(i) === k)
        ? s.map(i => (lineKey(i) === k ? { ...i, qty: i.qty + q } : i))
        : [...s, { ...a.item, qty: q }];
    }
    case "inc": return s.map(i => (lineKey(i) === a.key ? { ...i, qty: i.qty + 1 } : i));
    // qty 1 + "-" removes that line only
    case "dec": return s.flatMap(i => (lineKey(i) !== a.key ? [i] : i.qty <= 1 ? [] : [{ ...i, qty: i.qty - 1 }]));
    // X removes ONE line only, whatever its qty
    case "remove": return s.filter(i => lineKey(i) !== a.key);
    case "clear": return [];
  }
}

type Ctx = {
  items: CartItem[]; count: number; subtotalPi: number; open: boolean; setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  inc: (key: string) => void; dec: (key: string) => void; remove: (key: string) => void; clear: () => void;
};
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", items: JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const value = useMemo<Ctx>(() => ({
    items, open, setOpen,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotalPi: Math.round(items.reduce((s, i) => s + i.pricePi * i.qty, 0) * 1000) / 1000,
    add: (item, qty) => dispatch({ type: "add", item, qty }),
    inc: key => dispatch({ type: "inc", key }),
    dec: key => dispatch({ type: "dec", key }),
    remove: key => dispatch({ type: "remove", key }),
    clear: () => dispatch({ type: "clear" }),
  }), [items, open]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
};
