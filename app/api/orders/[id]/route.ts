import { NextResponse } from 'next/server';
import { sb } from '@/lib/supabase';
export const dynamic='force-dynamic';
export async function GET(_:Request,{params}:{params:{id:string}}){
  const db=sb();if(!db)return NextResponse.json({error:'no db'},{status:503});
  const {data}=await db.from('orders').select('id,seq,items,total,status').eq('id',params.id).single();
  if(!data)return NextResponse.json({error:'Not found'},{status:404});
  return NextResponse.json({id:data.id,receipt:'SOSA-'+String(data.seq).padStart(3,'0'),total:Number(data.total),items:data.items,status:data.status});
}
