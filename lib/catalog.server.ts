import "server-only";
import { PRODUCTS } from "@/data/products";
import { getDb } from "./supabaseServer";

export type Product = { id: string; name: string; pricePi: number; category: string; image: string; stock: number; active: boolean; sizes?: string[]; colors?: string[]; description?: string };
const KEYS = ["id", "name", "pricePi", "category", "image", "stock", "active", "sizes", "colors", "description"];
const pick = (o: any) => Object.fromEntries(KEYS.filter(k => o[k] !== undefined && o[k] !== null).map(k => [k, o[k]]));

/** Static products first; Supabase rows override by id / add new ones. Never throws. */
export async function getCatalog(): Promise<Product[]> {
  const map = new Map<string, Product>(PRODUCTS.map(p => [p.id, { ...p } as Product]));
  try {
    const db = getDb();
    if (db) {
      const { data } = await db.from("products").select("*");
      (data || []).forEach((r: any) => map.set(r.id, { ...map.get(r.id), ...pick(r), pricePi: Number(r.pricePi) } as Product));
    }
  } catch {}
  return Array.from(map.values());
}

export const priceMap = (c: Product[]) => Object.fromEntries(c.map(p => [p.id, Number(p.pricePi)]));

export function nextId(c: Product[]) {
  const n = Math.max(0, ...c.map(p => Number(/^sosa-(\d+)$/.exec(p.id)?.[1] ?? 0)));
  return "sosa-" + String(n + 1).padStart(3, "0");
}

export async function saveProduct(row: any) {
  const db = getDb(); if (!db) return false;
  const { error } = await db.from("products").upsert({ ...pick(row), updated_at: new Date().toISOString() });
  return !error;
}

/** Static products can't be deleted (they're the fallback) -> hidden via active=false. */
export async function removeProduct(id: string) {
  const db = getDb(); if (!db) return false;
  const st = PRODUCTS.find(p => p.id === id);
  if (st) return saveProduct({ ...st, active: false });
  const { error } = await db.from("products").delete().eq("id", id);
  return !error;
}

/** Called ONLY after Pi completion. Seeds static rows if needed, then decrements. */
export async function reduceStock(lines: { id: string; qty: number }[]) {
  const db = getDb(); if (!db) return;
  const qty = new Map<string, number>();
  lines.forEach(l => qty.set(l.id, (qty.get(l.id) || 0) + l.qty));
  for (const [id, q] of Array.from(qty.entries())) { // array iteration: safe under tsconfig target es5
    const st = PRODUCTS.find(p => p.id === id);
    if (st) await db.from("products").upsert(pick(st), { onConflict: "id", ignoreDuplicates: true });
    await db.rpc("decrement_stock", { p_id: id, p_qty: q });
  }
}
