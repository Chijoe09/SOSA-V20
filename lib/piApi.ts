import "server-only";
const BASE = "https://api.minepi.com/v2/payments";
const hdr = () => ({ Authorization: `Key ${process.env.PI_API_KEY}`, "Content-Type": "application/json" });
export const piGet = async (id: string) => {
  const r = await fetch(`${BASE}/${encodeURIComponent(id)}`, { headers: hdr(), cache: "no-store" });
  if (!r.ok) throw new Error("pi get " + r.status);
  return r.json();
};
export const piApprove = (id: string) => fetch(`${BASE}/${encodeURIComponent(id)}/approve`, { method: "POST", headers: hdr() });
export const piComplete = (id: string, txid: string) => fetch(`${BASE}/${encodeURIComponent(id)}/complete`, { method: "POST", headers: hdr(), body: JSON.stringify({ txid }) });
