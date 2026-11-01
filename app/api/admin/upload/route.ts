import { NextResponse } from 'next/server';
import { sb, isAdmin } from '@/lib/supabase';
export async function POST(req:Request){
  if(!isAdmin(req))return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=sb();if(!db)return NextResponse.json({error:'Supabase not configured'},{status:503});
  const f=await req.formData();const file=f.get('file') as File;const pid=String(f.get('productId')||'misc');
  if(!file)return NextResponse.json({error:'No file'},{status:400});
  const path=`${pid}/${Date.now()}-${file.name.replace(/[^\w.-]/g,'_')}`;
  const {error}=await db.storage.from('products').upload(path,Buffer.from(await file.arrayBuffer()),{contentType:file.type});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({url:db.storage.from('products').getPublicUrl(path).data.publicUrl});
}
