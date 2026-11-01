import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminToken } from "@/lib/adminAuth";
export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) || {};
  const real = process.env.ADMIN_PASSWORD;
  const a = Buffer.from(String(password || "")), b = Buffer.from(real || "\0");
  if (!real || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sosa_admin", adminToken(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 8 });
  return res;
}
