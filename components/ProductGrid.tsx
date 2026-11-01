"use client";
import { useState } from "react";
import { useShop } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import { ProductBarcode } from "./BarcodePayment";

function Card({ p }: { p: any }) {
  const { add, setOpen } = useCart();
  const [size, setSize] = useState<string>(p.sizes?.[0] ?? "");
  const [color, setColor] = useState<string>(p.colors?.[0] ?? "");
  const sel = "flex-1 bg-transparent border border-[var(--border)] rounded p-1 text-sm";
  return (
    <div className="product-card space-y-2">
      <img src={p.image} alt={p.name} className="w-full aspect-square object-cover rounded" />
      <h3 className="font-medium">{p.name}</h3>
      <p>{p.pricePi} Pi</p>
      {p.stock <= 2 && <span className="text-xs text-red-500">Only {p.stock} left!</span>}
      <div className="flex gap-2">
        {p.sizes?.length > 0 && <select value={size} onChange={e => setSize(e.target.value)} className={sel}>{p.sizes.map((s: string) => <option key={s}>{s}</option>)}</select>}
        {p.colors?.length > 0 && <select value={color} onChange={e => setColor(e.target.value)} className={sel}>{p.colors.map((c: string) => <option key={c}>{c}</option>)}</select>}
      </div>
      <button onClick={() => { add({ id: p.id, name: p.name, image: p.image, pricePi: Number(p.pricePi), size, color }); setOpen(true); }}
        className="w-full py-2 rounded bg-[var(--fg)] text-[var(--bg)] text-sm">Add to cart</button>
      <ProductBarcode productId={p.id} />
    </div>
  );
}

export function ProductGrid() {
  const { products, category } = useShop();
  const list = products.filter(p => p.active && p.stock > 0 && (!category || p.category === category));
  if (list.length === 0) return null; // never "No products yet"
  return (
    <div id="new-arrivals" className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {list.map(p => <Card key={p.id} p={p} />)}
    </div>
  );
}
export default ProductGrid;
