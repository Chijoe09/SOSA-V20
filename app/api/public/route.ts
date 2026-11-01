import { NextResponse } from 'next/server';
import { sb, getSettings, mapProduct } from '@/lib/supabase';
export const dynamic='force-dynamic';
export async function GET(){
  const db=sb();if(!db)return NextResponse.json({});
  const [settings,{data}]=await Promise.all([getSettings(db),db.from('products').select('*')]);
  return NextResponse.json({settings,products:(data||[]).map(mapProduct)});
}
