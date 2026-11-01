import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Returns null (never throws) when env is missing, so the shop keeps working on static products. */
export function getDb() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
