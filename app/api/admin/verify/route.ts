import { NextResponse } from 'next/server';
// Set ADMIN_PASSWORD=5454 in Vercel env. Never hard-code in client bundle.
export async function POST(req:Request){
  const {password}=await req.json().catch(()=>({}));
  const ok=!!process.env.ADMIN_PASSWORD && password===process.env.ADMIN_PASSWORD;
  return NextResponse.json({ok},{status:ok?200:401});
}
