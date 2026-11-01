export const DELIVERY_FEE_PI = 0.0001;
export type DeliveryType = "pickup" | "delivery";
export type Line = { id: string; qty: number; size?: string; color?: string };

/** Shared by client + server. totalPi = sum(pricePi*qty) + (delivery ? fee : 0), 7 decimals for the Pi SDK. */
export function computeTotal(lines: Line[], priceById: Record<string, number>, deliveryType: DeliveryType) {
  let sum = 0;
  for (const l of lines) {
    const p = priceById[l.id];
    if (typeof p !== "number" || !Number.isInteger(l.qty) || l.qty < 1) throw new Error("bad line");
    sum += p * l.qty;
  }
  if (deliveryType === "delivery") sum += DELIVERY_FEE_PI;
  return parseFloat(sum.toFixed(7));
}
