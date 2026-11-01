import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getCatalog, nextId, removeProduct, saveProduct } from "@/lib/catalog.server";
export const dynamic = "force-dynamic";
const deny = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const nodb = () => NextResponse.json({ error: "Admin saves need SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Vercel env" }, { status: 503 });
const bad = (m: string) => NextResponse.json({ error: m }, { status: 400 });

export async function GET() {
  if (!(await isAdmin())) return deny();
  return NextResponse.json(await getCatalog());
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return deny();
  const b = await req.json().catch(() => ({}));
  const pricePi = Number(b.pricePi), stock = Number(b.stock);
  if (!b.name || !b.category || !b.image || !(pricePi > 0) || !Number.isInteger(stock) || stock < 0) return bad("name, pricePi (number), category, image, stock required");
  const cat = await getCatalog();
  const row = { id: nextId(cat), name: String(b.name).slice(0, 120), pricePi, category: String(b.category).slice(0, 60), image: String(b.image).slice(0, 300), stock, active: true };
  if (!(await saveProduct(row))) return nodb();
  return NextResponse.json(await getCatalog());
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return deny();
  const { id, patch } = await req.json().catch(() => ({}));
  const cur = (await getCatalog()).find(p => p.id === id);
  if (!cur || !patch) return bad("Unknown product");
  const next: any = { ...cur };
  if (patch.stock !== undefined) { const s = Number(patch.stock); if (!Number.isInteger(s) || s < 0) return bad("Bad stock"); next.stock = s; }
  if (patch.pricePi !== undefined) { const p = Number(patch.pricePi); if (!(p > 0)) return bad("Bad price"); next.pricePi = p; }
  if (patch.active !== undefined) next.active = !!patch.active;
  for (const k of ["name", "category", "image"]) if (typeof patch[k] === "string" && patch[k].trim()) next[k] = patch[k].trim();
  if (!(await saveProduct(next))) return nodb();
  return NextResponse.json(await getCatalog());
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return deny();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return bad("id required");
  if (!(await removeProduct(id))) return nodb();
  return NextResponse.json(await getCatalog());
}
