import { NextResponse } from "next/server";
import { piComplete } from "@/lib/piApi";
// Completes a payment Pi reports as incomplete (so it can't block new payments). Order details aren't available here.
export async function POST(req: Request) {
  const { payment } = (await req.json().catch(() => ({}))) || {};
  const txid = payment?.transaction?.txid, id = payment?.identifier;
  if (!id || !txid) return NextResponse.json({ ok: false }, { status: 400 });
  const r = await piComplete(id, txid);
  return NextResponse.json({ ok: r.ok });
}
