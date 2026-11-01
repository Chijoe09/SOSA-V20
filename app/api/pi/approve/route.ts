import { NextResponse } from "next/server";
import { getCatalog, priceMap } from "@/lib/catalog.server";
import { computeTotal } from "@/lib/pricing";
import { piApprove, piGet } from "@/lib/piApi";
const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });

export async function POST(req: Request) {
  const { paymentId, lines, deliveryType } = (await req.json().catch(() => ({}))) || {};
  if (!paymentId || !Array.isArray(lines) || !lines.length) return err("Invalid request");
  const dt = deliveryType === "delivery" ? "delivery" : "pickup";
  const catalog = await getCatalog();
  for (const l of lines) {
    const p = catalog.find(x => x.id === l.id);
    if (!p || !p.active || p.stock < l.qty) return err(`Out of stock: ${p?.name ?? l.id}`, 409);
  }
  let expected: number;
  try { expected = computeTotal(lines, priceMap(catalog), dt); } catch { return err("Invalid cart"); }
  try {
    const pay = await piGet(paymentId);
    if (Math.abs(pay.amount - expected) > 1e-6) return err("Prices changed — refresh and try again", 409);
  } catch { return err("Could not verify payment", 502); }
  const r = await piApprove(paymentId);
  return r.ok ? NextResponse.json({ ok: true }) : err("Pi approval failed", 502);
}
