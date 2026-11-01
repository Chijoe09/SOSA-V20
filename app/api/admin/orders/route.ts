import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/supabaseServer";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json([]);
  const { data } = await db.from("orders").select("*").order("created_at", { ascending: false }).limit(5000);
  return NextResponse.json(data || []);
}
