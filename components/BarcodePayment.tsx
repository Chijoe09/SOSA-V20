"use client";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";

/** sosa-001 -> SOSA-001-NG (knowledge-base barcode format) */
export const productBarcode = (id: string) => `${id.replace(/^sosa-/i, "SOSA-").toUpperCase()}-NG`;

function Code128({ value, height = 50, svgRef }: { value: string; height?: number; svgRef?: React.RefObject<SVGSVGElement | null> }) {
  const local = useRef<SVGSVGElement>(null);
  const ref = (svgRef ?? local) as React.RefObject<SVGSVGElement>;
  useEffect(() => {
    if (ref.current) {
      try { JsBarcode(ref.current, value, { format: "CODE128", height, displayValue: true, margin: 4, fontSize: 12, background: "#ffffff", lineColor: "#000000" }); } catch {}
    }
  }, [value, height, ref]);
  return <svg ref={ref} className="max-w-full" />;
}

/** Inventory barcode shown under each product (Lagos store scan) */
export function ProductBarcode({ productId }: { productId: string }) {
  return <div className="inline-block bg-white rounded"><Code128 value={productBarcode(productId)} height={34} /></div>;
}

type Props = { paymentId: string; amountPi: number; expiresInSec?: number; onExpire?: () => void };

/** Payment QR (scan inside Pi Browser) + printable Code128 for the physical store */
export default function BarcodePayment({ paymentId, amountPi, expiresInSec = 900, onExpire }: Props) {
  const [left, setLeft] = useState(expiresInSec);
  const barRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const t = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (left === 0) onExpire?.(); }, [left, onExpire]);

  const expired = left <= 0;
  const qr = `pi://pay?id=${encodeURIComponent(paymentId)}&amount=${amountPi}&app=sosa.pi`;
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");

  function print() {
    const svg = barRef.current?.outerHTML;
    if (!svg) return;
    const w = window.open("", "_blank", "width=420,height=320");
    if (!w) return;
    w.document.write(`<body style="font-family:sans-serif;text-align:center"><h3>SOSA — ${amountPi} Pi</h3>${svg}<p style="font-size:12px">${paymentId}</p></body>`);
    w.document.close(); w.focus(); w.print();
  }

  return (
    <div id="barcode" className="text-center space-y-3">
      <p className="text-sm font-medium">Scan in Pi Browser to pay <b>{amountPi} Pi</b></p>
      {/* QR stays black-on-white in every theme so it always scans */}
      <div className={`inline-block bg-white p-3 rounded ${expired ? "opacity-30" : ""}`}>
        <QRCodeSVG value={qr} size={176} level="M" />
      </div>
      <p className={`text-sm tabular-nums ${expired ? "text-red-500" : ""}`}>{expired ? "Expired — start checkout again" : `Expires in ${mm}:${ss}`}</p>
      <div className="inline-block bg-white rounded"><Code128 value={paymentId} svgRef={barRef} height={40} /></div>
      <div><button onClick={print} className="text-sm underline">Print barcode (store)</button></div>
    </div>
  );
}
