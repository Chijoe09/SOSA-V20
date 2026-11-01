import { NextResponse } from "next/server";
import { getCatalog, priceMap, reduceStock } from "@/lib/catalog.server";
import { getDb } from "@/lib/supabaseServer";
import { computeTotal } from "@/lib/pricing";
import { piComplete, piGet } from "@/lib/piApi";
const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) || {};
  const { paymentId, txid, lines, customer } = b;
  if (!paymentId || !txid || !Array.isArray(lines) || !customer) return err("Invalid request");
  const dt = b.deliveryType === "delivery" ? "delivery" : "pickup";
  const name = String(customer.name || "").trim().slice(0, 100);
  const phone = String(customer.phone || "").trim().slice(0, 30);
  const address = dt === "delivery" ? String(customer.address || "").trim().slice(0, 300) : null;
  if (!name || phone.replace(/\D/g, "").length < 7 || (dt === "delivery" && !address)) return err("Missing details");

  const catalog = await getCatalog();
  let expected: number;
  try { expected = computeTotal(lines, priceMap(catalog), dt); } catch { return err("Invalid cart"); }
  try {
    const pay = await piGet(paymentId);
    if (Math.abs(pay.amount - expected) > 1e-6) return err("Amount mismatch", 409);
  } catch { return err("Could not verify payment", 502); }

  const r = await piComplete(paymentId, txid);
  if (!r.ok) {
    const p = await piGet(paymentId).catch(() => null);
    if (!p?.status?.developer_completed) return err("Pi completion failed", 502);
  }

  // Payment is done -> now (and only now) save the order and reduce stock.
  let saved = false;
  try {
    const db = getDb();
    if (db) {
      const items = lines.map((l: any) => ({ id: l.id, qty: l.qty, size: l.size, color: l.color }));
      const { error } = await db.from("orders").insert({ paymentId, txid, customerName: name, phone, address, deliveryType: dt, productIds: items, totalPi: expected, status: "paid" });
      if (!error) { saved = true; await reduceStock(items); }
      else if (error.code === "23505") saved = true; // already processed
    }
  } catch {}
  return NextResponse.json({ ok: true, saved });
}
