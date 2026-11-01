"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

type P = { id: string; name: string; pricePi: number; category: string; image: string; stock: number; active: boolean; [k: string]: any };
type O = { id: string; paymentId: string; txid: string; customerName: string; phone: string; deliveryType: string; productIds: any; totalPi: number; status: string; created_at: string };

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || "Error"), { status: r.status });
  return d;
}
const DAY = 86400000;
const sum = (o: O[]) => parseFloat(o.reduce((s, x) => s + Number(x.totalPi || 0), 0).toFixed(7));
const box = "p-2 rounded border border-[var(--border)] bg-transparent";

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState(""), [err, setErr] = useState("");
  const [tab, setTab] = useState<"sales" | "products">("sales");
  const [products, setProducts] = useState<P[]>([]);
  const [orders, setOrders] = useState<O[]>([]);
  const [range, setRange] = useState<"daily" | "weekly" | "monthly" | "all">("all");
  const [q, setQ] = useState("");
  const [f, setF] = useState({ name: "", pricePi: "", category: "", image: "", stock: "" });

  const load = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([api("/api/admin/products"), api("/api/admin/orders")]);
      setProducts(p); setOrders(o); setAuthed(true);
    } catch (e: any) { if (e.status === 401) setAuthed(false); else { setErr(e.message); setAuthed(true); } }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function login() {
    setErr("");
    try { await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password: pw }) }); setPw(""); load(); }
    catch (e: any) { setErr(e.message); }
  }
  async function mutate(url: string, init: RequestInit) {
    setErr("");
    try { setProducts(await api(url, init)); } catch (e: any) { setErr(e.message); }
  }
  const patch = (id: string, p: object) => mutate("/api/admin/products", { method: "PATCH", body: JSON.stringify({ id, patch: p }) });

  async function add() {
    await mutate("/api/admin/products", { method: "POST", body: JSON.stringify(f) });
    setF({ name: "", pricePi: "", category: "", image: "", stock: "" });
  }
  function exportJs() {
    const body = `// /data/products.js — exported from SOSA admin\nexport const PRODUCTS = ${JSON.stringify(products, null, 2)};\n\nexport function getProductsWithFallback(supabaseProducts) {\n  if (!supabaseProducts || supabaseProducts.length === 0) return PRODUCTS;\n  return supabaseProducts;\n}\n`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/javascript" })); a.download = "products.js"; a.click();
  }

  const stats = useMemo(() => {
    const now = Date.now(), midnight = new Date().setHours(0, 0, 0, 0);
    const since = (t: number) => orders.filter(o => +new Date(o.created_at) >= t);
    return { daily: sum(since(midnight)), weekly: sum(since(now - 7 * DAY)), monthly: sum(since(now - 30 * DAY)), all: sum(orders), count: orders.length, customers: new Set(orders.map(o => o.phone)).size };
  }, [orders]);

  const rows = useMemo(() => {
    const now = Date.now();
    const from = range === "daily" ? new Date().setHours(0, 0, 0, 0) : range === "weekly" ? now - 7 * DAY : range === "monthly" ? now - 30 * DAY : 0;
    const s = q.trim().toLowerCase();
    return orders.filter(o => +new Date(o.created_at) >= from && (!s || (o.phone || "").toLowerCase().includes(s) || (o.customerName || "").toLowerCase().includes(s)));
  }, [orders, range, q]);

  if (authed === null) return <p className="p-6">Loading…</p>;
  if (!authed) return (
    <div className="p-6 max-w-sm mx-auto space-y-3">
      <h1 className="font-bold text-lg">SOSA Control Room</h1>
      <input type="password" className={box + " w-full"} placeholder="Admin password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
      {err && <p className="text-red-500 text-sm">{err}</p>}
      <button onClick={login} className="w-full py-2 rounded bg-[var(--fg)] text-[var(--bg)]">Enter</button>
    </div>
  );

  const Card = ({ t, v }: { t: string; v: string | number }) => (
    <div className="p-3 rounded border border-[var(--border)]"><p className="text-xs opacity-60">{t}</p><p className="text-lg font-bold">{v}</p></div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        {(["sales", "products"] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded border border-[var(--border)] capitalize ${tab === t ? "bg-[var(--fg)] text-[var(--bg)]" : ""}`}>{t}</button>)}
        <button onClick={load} className="ml-auto text-sm underline">Refresh</button>
      </div>
      {err && <p className="text-red-500 text-sm">{err}</p>}

      {tab === "sales" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card t="Daily (today)" v={`${stats.daily} Pi`} /><Card t="Weekly (7d)" v={`${stats.weekly} Pi`} />
            <Card t="Monthly (30d)" v={`${stats.monthly} Pi`} /><Card t="All-time" v={`${stats.all} Pi`} />
            <Card t="Total orders" v={stats.count} /><Card t="Total Pi sold" v={`${stats.all} Pi`} /><Card t="Total customers" v={stats.customers} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={range} onChange={e => setRange(e.target.value as any)} className={box}>
              <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="all">All</option>
            </select>
            <input className={box + " flex-1 min-w-40"} placeholder="Search phone or name" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs whitespace-nowrap">
              <thead><tr className="text-left opacity-60">{["Date", "Customer", "Phone", "Items", "Pi", "Type", "Payment ID", "TxID", "Status"].map(h => <th key={h} className="p-2">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map(o => (
                  <tr key={o.id} className="border-t border-[var(--border)]">
                    <td className="p-2">{new Date(o.created_at).toLocaleString()}</td><td className="p-2">{o.customerName}</td><td className="p-2">{o.phone}</td>
                    <td className="p-2">{(Array.isArray(o.productIds) ? o.productIds : []).map((l: any) => `${l.id}×${l.qty}`).join(", ")}</td>
                    <td className="p-2">{o.totalPi}</td><td className="p-2">{o.deliveryType}</td>
                    <td className="p-2 max-w-32 truncate" title={o.paymentId}>{o.paymentId}</td><td className="p-2 max-w-32 truncate" title={o.txid}>{o.txid}</td><td className="p-2">{o.status}</td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={9} className="p-4 text-center opacity-60">No orders</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "products" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <input className={box} placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
            <input className={box} type="number" step="any" placeholder="pricePi" value={f.pricePi} onChange={e => setF({ ...f, pricePi: e.target.value })} />
            <input className={box} list="cats" placeholder="Category" value={f.category} onChange={e => setF({ ...f, category: e.target.value })} />
            <datalist id="cats">{Array.from(new Set(products.map(p => p.category))).map(c => <option key={c} value={c} />)}</datalist>
            <input className={box} placeholder="/images/file.jpg" value={f.image} onChange={e => setF({ ...f, image: e.target.value })} />
            <input className={box} type="number" placeholder="Stock" value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} />
            <button onClick={add} className="rounded bg-[var(--fg)] text-[var(--bg)]">Add product</button>
          </div>
          <button onClick={exportJs} className="text-sm underline">Download products.js (commit to /data to make changes permanent in code)</button>
          <ul className="divide-y divide-[var(--border)]">
            {products.map(p => (
              <li key={p.id} className={`py-3 flex flex-wrap items-center gap-2 ${p.active ? "" : "opacity-50"}`}>
                <img src={p.image} alt="" className="w-12 h-12 object-cover rounded" />
                <div className="flex-1 min-w-40"><p className="font-medium text-sm">{p.name}</p><p className="text-xs opacity-60">{p.id} · {p.category}</p></div>
                <input key={p.id + p.pricePi} type="number" step="any" defaultValue={p.pricePi} className={box + " w-24"}
                  onBlur={e => { const v = Number(e.target.value); if (v > 0 && v !== p.pricePi) patch(p.id, { pricePi: v }); }} />
                <div className="flex items-center gap-1">
                  <button onClick={() => patch(p.id, { stock: Math.max(0, p.stock - 1) })} className="w-8 h-8 border border-[var(--border)] rounded">−</button>
                  <span className="w-8 text-center">{p.stock}</span>
                  <button onClick={() => patch(p.id, { stock: p.stock + 1 })} className="w-8 h-8 border border-[var(--border)] rounded">+</button>
                </div>
                <button onClick={() => patch(p.id, { active: !p.active })} className="text-sm underline">{p.active ? "Active" : "Hidden"}</button>
                <button onClick={() => confirm(`Delete ${p.name}?`) && mutate("/api/admin/products?id=" + encodeURIComponent(p.id), { method: "DELETE" })} className="text-sm text-red-500">Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
