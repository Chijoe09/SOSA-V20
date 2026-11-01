import { NextResponse } from 'next/server';
import { sb, getSettings, round7 } from '@/lib/supabase';
export async function POST(req:Request){
  const db=sb();if(!db)return NextResponse.json({error:'Database not configured'},{status:503});
  const {items,delivery,customer}=await req.json();
  if(!Array.isArray(items)||!items.length||!customer?.name||!customer?.phone||(delivery==='delivery'&&!customer?.address))
    return NextResponse.json({error:'Missing details'},{status:400});
  const {data:prods}=await db.from('products').select('*').in('id',items.map((i:any)=>i.id));
  const lines:any[]=[];let subtotal=0;
  for(const i of items){
    const p=prods?.find((x:any)=>x.id===i.id);const qty=Math.floor(Number(i.qty));
    if(!p||qty<1)return NextResponse.json({error:'Item unavailable'},{status:400});
    if(p.stock<qty)return NextResponse.json({error:`${p.name} is out of stock`},{status:409});
    subtotal+=Number(p.price_pi)*qty;
    lines.push({id:p.id,name:p.name,size:i.size,color:i.color,qty,price:Number(p.price_pi)});
  }
  const s=await getSettings(db);const fee=delivery==='delivery'?Number(s.deliveryFee):0;
  subtotal=round7(subtotal);const total=round7(subtotal+fee);
  const {data,error}=await db.from('orders').insert({items:lines,subtotal,delivery_method:delivery,delivery_fee:fee,total,
    customer_name:customer.name,phone:customer.phone,address:customer.address||null}).select().single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({id:data.id,receipt:'SOSA-'+String(data.seq).padStart(3,'0'),total,subtotal,fee,items:lines});
}
