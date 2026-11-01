import type { CartItem } from "@/lib/cart";
import { computeTotal, type DeliveryType } from "@/lib/pricing";
import { getPi, piAuth } from "@/lib/pi";
export type { DeliveryType };
export type Customer = { name: string; phone: string; address?: string };

const POINTS_KEY = "sosa-points-v1";
const toLines = (items: CartItem[]) => items.map(i => ({ id: i.id, size: i.size, color: i.color, qty: i.qty }));

export function cartTotal(items: CartItem[], dt: DeliveryType) {
  return computeTotal(toLines(items), Object.fromEntries(items.map(i => [i.id, i.pricePi])), dt);
}

function addPoints(pi: number) {
  try {
    localStorage.setItem(POINTS_KEY, String(Number(localStorage.getItem(POINTS_KEY) || 0) + Math.floor(pi * 10))); // 1 Pi = 10 pts
    window.dispatchEvent(new Event("sosa-points-updated"));
  } catch {}
}

async function post(url: string, body: unknown) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Request failed");
}

export async function payWithPi(items: CartItem[], dt: DeliveryType, customer: Customer, opts?: { onPaymentId?: (id: string, amountPi: number) => void }) {
  const Pi = getPi();
  if (!Pi) throw "Open SOSA in Pi Browser to pay";
  await piAuth(Pi);
  const lines = toLines(items);
  const totalPi = cartTotal(items, dt);
  return new Promise<{ paymentId: string; txid: string }>((resolve, reject) => {
    Pi.createPayment(
      { amount: totalPi, memo: "SOSA-" + Date.now(), metadata: { orderIds: items.map(c => c.id) } },
      {
        onReadyForServerApproval: async (paymentId: string) => {
          opts?.onPaymentId?.(paymentId, totalPi);
          try { await post("/api/pi/approve", { paymentId, lines, deliveryType: dt }); } catch (e: any) { reject(e.message); }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try { await post("/api/pi/complete", { paymentId, txid, lines, deliveryType: dt, customer }); addPoints(totalPi); resolve({ paymentId, txid }); }
          catch (e: any) { reject(e.message); }
        },
        onCancel: () => reject("Cancelled"),
        onError: (e: unknown) => reject(e instanceof Error ? e.message : "Payment error"),
      }
    );
  });
}
