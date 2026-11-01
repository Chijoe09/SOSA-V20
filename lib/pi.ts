"use client";
export function payWithPi(amount: number, cb: { done: () => void; error: (e: any) => void }) {
  // @ts-ignore
  const Pi = (window as any).Pi;
  if (!Pi) {
    cb.error("Pi SDK not loaded");
    return;
  }
  Pi.createPayment(
    { amount, memo: "SOSA Order", metadata: { amount } },
    {
      onReadyForServerApproval: (paymentId: string) => {
        fetch("/api/pi/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId }) });
      },
      onReadyForServerCompletion: (paymentId: string, txid: string) => {
        fetch("/api/pi/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId, txid }) })
          .then(() => cb.done())
          .catch(cb.error);
      },
      onCancel: () => cb.error("Payment cancelled"),
      onError: (e: any) => cb.error(e),
    }
  );
}
export const initPi = () => {};
export default payWithPi;
