import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog.server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json((await getCatalog()).filter(p => p.active));
}
