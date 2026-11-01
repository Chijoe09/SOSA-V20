import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

export const adminToken = () => crypto.createHmac("sha256", process.env.ADMIN_PASSWORD || "x").update("sosa-admin").digest("hex");
export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const c = (await cookies()).get("sosa_admin")?.value;
  if (!c) return false;
  const a = Buffer.from(c), b = Buffer.from(adminToken());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
