import { NextResponse } from 'next/server';
import { sb, isAdmin } from '@/lib/supabase';
import { castSetting } from '@/lib/settings';
import { seedItems } from '@/lib/catalog';
const row=(p:any)=>({id:p.id,box:p.box,name:p.name,colours:p.colours,sizes:p.sizes,price_pi:Number(p.pricePi),stock:Math.max(0,Math.floor(Number(p.stock)||0)),images:p.images||[],updated_at:new Date().toISOString()});
export async function POST(req:Request){
  if(!isAdmin(req))return NextResponse.json({error:'Unauthorized'},{status:401});
  const b=await req.json();if(b.action==='verify')return NextResponse.json({ok:true});
  const db=sb();if(!db)return NextResponse.json({error:'Supabase not configured'},{status:503});
  let r:any;
  switch(b.action){
    case 'settings.save': r=await db.from('settings').upsert(Object.entries(b.values).map(([key,v])=>({key,value:castSetting(key,v)}))); break;
    case 'product.upsert': r=await db.from('products').upsert(row(b.product)); break;
    case 'product.delete': r=await db.from('products').delete().eq('id',b.id); break;
    case 'seed': r=await db.from('products').upsert(seedItems().map(row)); break;
    case 'orders.list': r=await db.from('orders').select('*').order('created_at',{ascending:false}).limit(100); return NextResponse.json({orders:r.data||[]});
    case 'order.status': r=await db.from('orders').update({status:b.status}).eq('id',b.id); break;
    default: return NextResponse.json({error:'Unknown action'},{status:400});
  }
  return r.error?NextResponse.json({error:r.error.message},{status:500}):NextResponse.json({ok:true});
}
