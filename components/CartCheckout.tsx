'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useShop, fmt } from '@/lib/shop';
import { payWithPi, waLink } from '@/lib/pi';
import Img from './Img';
export default function CartCheckout(){
  const s=useShop();const {ui,open,lines,settings}=s;
  const [f,setF]=useState({name:'',phone:'',address:''});
  const [order,setOrder]=useState<any>(null);const [msg,setMsg]=useState('');const [busy,setBusy]=useState(false);
  const [mode,setMode]=useState<'form'|'qr'|'done'>('form');const [paid,setPaid]=useState<any>(null);
  if(!ui.cart&&!ui.checkout)return null;
  const close=()=>{open('cart',false);open('checkout',false)};
  async function create(){
    if(!f.name||!f.phone||(s.delivery==='delivery'&&!f.address)){setMsg('Please fill all required details.');return null}
    setBusy(true);setMsg('');
    const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      items:s.cart.map((c:any)=>({id:c.id,size:c.size,color:c.color,qty:c.qty})),delivery:s.delivery,customer:f})}).then(r=>r.json()).catch(()=>({error:'Network error'}));
    setBusy(false);if(r.error){setMsg(r.error);return null}setOrder(r);return r;
  }
  async function pi(){const o=order||await create();if(!o)return;
    payWithPi(o,{done:r=>{setPaid(r);setMode('done');s.clear()},error:m=>setMsg(m)})}
  async function qr(){const o=order||await create();if(o)setMode('qr')}
  return(<div className="overlay"><div className="box">
    <button style={{float:'right'}} onClick={close}>✕</button>
    {ui.cart&&<>
      <h3>Cart ({s.count})</h3>
      {!lines.length&&<p>Your cart is empty.</p>}
      {lines.map((l:any)=><div key={`${l.id}|${l.size}|${l.color}`} className="row">
        <div style={{width:60}}><Img src={l.p.images[0]} name={l.p.name}/></div>
        <div style={{flex:1,minWidth:0}}><b>{l.p.name}</b><br/><small>{l.color} / {l.size}</small><br/><small>{fmt(l.p.pricePi)}</small></div>
        <div style={{display:'flex',gap:4,alignItems:'center'}}>
          <button onClick={()=>s.setQty(l,-1)}>−</button><b>{l.qty}</b><button onClick={()=>s.setQty(l,1)}>+</button>
          <button aria-label="Remove" onClick={()=>s.remove(l)}>✕</button></div></div>)}
      {!!lines.length&&<>
        <button onClick={s.clear}>Clear All</button>
        <h4>Delivery Options</h4>
        <label><input type="radio" checked={s.delivery==='delivery'} onChange={()=>s.setDelivery('delivery')}/> Delivery (+{fmt(settings.deliveryFee)})</label><br/>
        <label><input type="radio" checked={s.delivery==='pickup'} onChange={()=>s.setDelivery('pickup')}/> Self Pickup (Free)</label>
        <p>Subtotal {fmt(s.subtotal)} + Delivery {fmt(s.fee)} = <b>Total {fmt(s.total)}</b></p>
        <button className="cta" onClick={()=>{open('cart',false);open('checkout')}}>Proceed to Checkout</button></>}
    </>}
    {ui.checkout&&mode==='form'&&<>
      <h3>Checkout</h3>
      <input placeholder="Full Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
      <input placeholder="Phone / WhatsApp" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
      <textarea placeholder={s.delivery==='delivery'?'Delivery Address':'Delivery Address (not needed for pickup)'} value={f.address} onChange={e=>setF({...f,address:e.target.value})}/>
      {s.delivery==='pickup'&&<small>Pickup: {settings.address}</small>}
      <h4>Order Summary</h4>
      {lines.map((l:any)=><div key={`${l.id}|${l.size}|${l.color}`}><small>{l.qty}× {l.p.name} ({l.color}/{l.size}) — {fmt(l.p.pricePi*l.qty)}</small></div>)}
      <p>Delivery {fmt(s.fee)} · <b>Total {fmt(s.total)}</b></p>
      {msg&&<p className="out">{msg}</p>}
      <div style={{display:'grid',gap:8}}>
        <button className="cta" disabled={busy||!lines.length} onClick={pi}>Pay with Pi</button>
        <button className="cta" disabled={busy||!lines.length} onClick={qr}>Pay with Barcode QR</button>
        <button onClick={()=>{open('checkout',false);open('cart')}}>← Back</button></div>
    </>}
    {ui.checkout&&mode==='qr'&&order&&<div style={{textAlign:'center'}}>
      <h3>Scan in Pi Browser</h3>
      <div style={{background:'#fff',padding:12,display:'inline-block'}}><QRCodeSVG value={`${settings.shareUrl}/pay/${order.id}`} size={220}/></div>
      <p>Order {order.receipt} · <b>{fmt(order.total)}</b></p>
      <button onClick={()=>setMode('form')}>← Back</button></div>}
    {ui.checkout&&mode==='done'&&paid&&<div style={{textAlign:'center'}}>
      <h3>Payment received ✅</h3><p>Receipt <b>{paid.receipt}</b> · {fmt(paid.total)}</p>
      <a className="cta" href={waLink(settings.whatsapp,paid)} target="_blank" rel="noreferrer">Send receipt on WhatsApp</a>
      <p><button onClick={()=>{setMode('form');setOrder(null);close()}}>Continue shopping</button></p></div>}
  </div></div>);
}
