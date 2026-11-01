"use client";
import { useState } from "react";
import { useCart, lineKey } from "@/lib/cart";
import { payWithPi, cartTotal, type DeliveryType } from "@/lib/pay";
import BarcodePayment from "./BarcodePayment";

const PICKUP_TXT = "📦 Pickup: No.1, ODICHE STREET, COKER Aguda, ORILE, LAGOS.";
const DELIVERY_TXT = "🚚 Delivery: 0.0001 Pi (1-2 days Lagos, 4-7 outside)";
const money = (n: number) => parseFloat(n.toFixed(7));

export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button onClick={() => setOpen(true)} aria-label="Open cart" className="relative px-3 py-2">
      🛍{count > 0 && <span className="absolute -top-0 -right-0 rounded-full bg-white text-black text-xs px-1.5">{count}</span>}
    </button>
  );
}

export default function CartDrawer() {
  const { items, count, subtotalPi, open, setOpen, inc, dec, remove, clear } = useCart();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [dtype, setDtype] = useState<DeliveryType>("pickup");
  const [name, setName] = useState(""), [phone, setPhone] = useState(""), [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(""), [done, setDone] = useState(false);
  const [pay, setPay] = useState<{ id: string; amount: number } | null>(null);

  const total = items.length ? cartTotal(items, dtype) : 0;
  const field = "w-full p-2 rounded border border-[var(--border)] bg-transparent";

  function validate() {
    if (!name.trim()) return "Enter your name";
    if (phone.replace(/\D/g, "").length < 7) return "Enter a valid phone number";
    if (dtype === "delivery" && !address.trim()) return "Enter your delivery address";
    return "";
  }

  async function checkout() {
    const e = validate();
    if (e) return setMsg(e);
    setBusy(true); setMsg("");
    try {
      await payWithPi(items, dtype, { name: name.trim(), phone: phone.trim(), address: dtype === "delivery" ? address.trim() : undefined },
        { onPaymentId: (id, amount) => setPay({ id, amount }) });
      setPay(null); clear(); setStep("cart"); setDone(true);
    } catch (e: any) { setPay(null); setMsg(typeof e === "string" ? e : "Payment failed"); }
    setBusy(false);
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}
      <aside id="cart-drawer" className={`fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-[var(--bg)] text-[var(--fg)] border-l border-[var(--border)] transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <header className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold">{step === "cart" ? `Cart (${count})` : "Checkout"}</h2>
          <div className="flex gap-3">
            {step === "cart" && items.length > 0 && <button onClick={clear} className="text-sm underline">Clear cart</button>}
            {step === "checkout" && !busy && <button onClick={() => setStep("cart")} className="text-sm underline">Back</button>}
            <button onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>
        </header>

        {step === "cart" ? (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
              {items.length === 0 && <li className="p-6 text-center opacity-60">{done ? "✓ Payment complete — thank you!" : "Your cart is empty"}</li>}
              {items.map(i => {
                const k = lineKey(i);
                return (
                  <li key={k} className="flex gap-3 p-4">
                    <img src={i.image} alt={i.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{i.name}</p>
                      <p className="text-xs opacity-60">{[i.size && `Size ${i.size}`, i.color].filter(Boolean).join(" · ")}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => dec(k)} aria-label="Decrease" className="w-7 h-7 border border-[var(--border)] rounded">−</button>
                        <span className="w-6 text-center">{i.qty}</span>
                        <button onClick={() => inc(k)} aria-label="Increase" className="w-7 h-7 border border-[var(--border)] rounded">+</button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => remove(k)} aria-label={`Remove ${i.name}`} className="text-lg leading-none">✕</button>
                      <p className="text-sm">{money(i.pricePi * i.qty)} Pi</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            {items.length > 0 && (
              <footer className="p-4 border-t border-[var(--border)] space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><b>{money(subtotalPi)} Pi</b></div>
                <button onClick={() => { setDone(false); setMsg(""); setStep("checkout"); }} className="w-full py-3 rounded bg-[var(--fg)] text-[var(--bg)]">Checkout</button>
              </footer>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(["pickup", "delivery"] as const).map(t => (
                <button key={t} onClick={() => { setDtype(t); setMsg(""); }}
                  className={`py-2 rounded border border-[var(--border)] text-sm ${dtype === t ? "bg-[var(--fg)] text-[var(--bg)]" : ""}`}>
                  {t === "pickup" ? "Self Pickup" : "Delivery"}
                </button>
              ))}
            </div>
            <p className="text-sm">{dtype === "pickup" ? PICKUP_TXT : DELIVERY_TXT}</p>

            <input className={field} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
            <input className={field} type="tel" inputMode="numeric" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
            {dtype === "delivery" && <textarea className={field} rows={3} placeholder="Delivery address" value={address} onChange={e => setAddress(e.target.value)} autoComplete="street-address" />}

            <div className="pt-2 border-t border-[var(--border)] text-sm space-y-1">
              <div className="flex justify-between"><span>Items ({count})</span><span>{money(subtotalPi)} Pi</span></div>
              {dtype === "delivery" && <div className="flex justify-between"><span>Delivery</span><span>0.0001 Pi</span></div>}
              <div className="flex justify-between font-semibold"><span>Total</span><span>{total} Pi</span></div>
            </div>
            {msg && <p className="text-sm text-red-500">{msg}</p>}
            {pay && <BarcodePayment paymentId={pay.id} amountPi={pay.amount} />}
            <button disabled={busy} onClick={checkout} className="w-full py-3 rounded bg-[var(--fg)] text-[var(--bg)] disabled:opacity-50">
              {busy ? "Processing…" : `Pay ${total} Pi`}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
