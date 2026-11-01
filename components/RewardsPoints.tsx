"use client";
import { useCallback, useEffect, useState } from "react";

const POINTS_KEY = "sosa-points-v1", VOUCHERS_KEY = "sosa-vouchers-v1";
const REWARDS = [
  { cost: 100, label: "Free belt" },
  { cost: 500, label: "Custom shoe discount" },
];
type Voucher = { code: string; label: string; ts: number };
const read = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || "") as T; } catch { return d; } };

export default function RewardsPoints() {
  const [pts, setPts] = useState(0);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => { setPts(Number(localStorage.getItem(POINTS_KEY) || 0)); setVouchers(read<Voucher[]>(VOUCHERS_KEY, [])); }, []);
  useEffect(() => {
    load();
    window.addEventListener("sosa-points-updated", load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener("sosa-points-updated", load); window.removeEventListener("storage", load); };
  }, [load]);

  function redeem(cost: number, label: string) {
    if (pts < cost) return;
    const v: Voucher = { code: "SOSA-" + Math.random().toString(36).slice(2, 8).toUpperCase(), label, ts: Date.now() };
    localStorage.setItem(POINTS_KEY, String(pts - cost));
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify([v, ...vouchers]));
    load();
  }

  return (
    <div id="rewards" className="relative">
      <button onClick={() => setOpen(o => !o)} className="px-3 py-2 text-sm" aria-label="Rewards points">⭐ {pts} pts</button>
      {open && (
        <div className="absolute right-0 mt-1 w-64 z-50 p-3 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] space-y-2">
          <p className="text-xs opacity-60">1 Pi = 10 SOSA Points</p>
          {REWARDS.map(r => (
            <button key={r.cost} disabled={pts < r.cost} onClick={() => redeem(r.cost, r.label)}
              className="w-full flex justify-between text-sm px-2 py-2 border border-[var(--border)] rounded disabled:opacity-40">
              <span>{r.label}</span><b>{r.cost} pts</b>
            </button>
          ))}
          {vouchers.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)] text-xs space-y-1">
              <p className="opacity-60">My vouchers</p>
              {vouchers.map(v => <p key={v.code}>{v.label} — <b>{v.code}</b></p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
