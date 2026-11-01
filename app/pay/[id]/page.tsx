'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { payWithPi } from '@/lib/pi';
import { fmt } from '@/lib/shop';
export default function Pay(){
  const {id}=useParams() as {id:string};const [o,setO]=useState<any>(null);const [m,setM]=useState('');
  useEffect(()=>{fetch(`/api/orders/${id}`).then(r=>r.json()).then(setO)},[id]);
  if(!o)return <p>Loading order…</p>;if(o.error)return <p>Order not found.</p>;
  return(<div style={{maxWidth:420,margin:'auto'}}><h2>Order {o.receipt}</h2>
    {o.items.map((i:any,k:number)=><div key={k}>{i.qty}× {i.name} ({i.color}/{i.size})</div>)}
    <p><b>Total {fmt(o.total)}</b> · {o.status}</p>
    {o.status!=='paid'?<button className="cta" onClick={()=>payWithPi(o,{done:()=>{setM('Payment received ✅');setO({...o,status:'paid'})},error:setM})}>Pay with Pi</button>:<p>Already paid ✅</p>}
    <p>{m}</p></div>);
}
