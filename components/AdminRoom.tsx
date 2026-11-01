'use client';
import { useEffect, useState } from 'react';
import { useShop } from '@/lib/shop';
import { FIELDS } from '@/lib/settings';
import Img from './Img';
export default function AdminRoom(){
  const {ui,open,settings,products,boxes,reload}=useShop();
  const [pw,setPw]=useState('');const [ok,setOk]=useState(false);const [tab,setTab]=useState('settings');
  const [vals,setVals]=useState<any>({});const [orders,setOrders]=useState<any[]>([]);const [box,setBox]=useState(boxes[0].slug);const [note,setNote]=useState('');
  useEffect(()=>{const p=sessionStorage.getItem('sosa-admin');if(p){setPw(p);setOk(true)}},[]);
  useEffect(()=>setVals(settings),[settings,ui.admin]);
  if(!ui.admin)return null;
  const H=()=>({'Content-Type':'application/json','x-admin-password':pw});
  const api=async(body:any)=>{const r=await fetch('/api/admin',{method:'POST',headers:H(),body:JSON.stringify(body)}).then(r=>r.json());setNote(r.error||'Saved ✓');return r};
  async function login(){const r=await api({action:'verify'});if(r.ok){setOk(true);sessionStorage.setItem('sosa-admin',pw)}}
  async function loadOrders(){const r=await api({action:'orders.list'});setOrders(r.orders||[])}
  const upload=async(p:any,file?:File)=>{if(!file)return;const fd=new FormData();fd.append('file',file);fd.append('productId',p.id);
    const r=await fetch('/api/admin/upload',{method:'POST',headers:{'x-admin-password':pw},body:fd}).then(r=>r.json());
    if(r.url){await api({action:'product.upsert',product:{...p,images:[r.url,...p.images.slice(1)]}});reload()}else setNote(r.error)};
  const close=()=>open('admin',false);
  return(<div className="overlay"><div className="box" style={{maxWidth:760}}>
    <button style={{float:'right'}} onClick={close}>✕</button><h3>Admin Control Room</h3>
    {!ok?<div><input type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)}/><button onClick={login}>Enter</button><small> {note}</small></div>:<>
      <div style={{display:'flex',gap:6}}>{['settings','products','orders'].map(t=><button key={t} aria-pressed={tab===t} onClick={()=>{setTab(t);if(t==='orders')loadOrders()}}>{t}</button>)}</div>
      <small>{note}</small>
      {tab==='settings'&&<div style={{display:'grid',gap:6}}>
        {FIELDS.map(([k,l])=><label key={k}><small>{l}</small><input style={{width:'100%'}} value={vals[k]??''} onChange={e=>setVals({...vals,[k]:e.target.value})}/></label>)}
        <button className="cta" onClick={async()=>{await api({action:'settings.save',values:vals});reload()}}>Save settings</button></div>}
      {tab==='products'&&<div style={{display:'grid',gap:8}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          <select value={box} onChange={e=>setBox(e.target.value)}>{boxes.map((b:any)=><option key={b.slug} value={b.slug}>{b.name}</option>)}</select>
          <button onClick={async()=>{await api({action:'product.upsert',product:{id:`${box}-${Date.now()}`,box,name:'New Item',colours:['Black'],sizes:['One Size'],pricePi:0,stock:0,images:[]}});reload()}}>+ Add product</button>
          <button onClick={async()=>{if(confirm('Write the starter catalog to the database?')){await api({action:'seed'});reload()}}}>Seed catalog</button></div>
        {products.filter((p:any)=>p.box===box).map((p:any)=><Row key={p.id} p={p} api={api} upload={upload} reload={reload}/>)}</div>}
      {tab==='orders'&&<div>{!orders.length&&<p>No orders yet.</p>}{orders.map(o=><div key={o.id} className="row" style={{display:'block'}}>
        <b>SOSA-{String(o.seq).padStart(3,'0')}</b> · {o.total} Pi · {o.status}<br/><small>{o.customer_name} · {o.phone} · {o.delivery_method}{o.address?` · ${o.address}`:''}</small><br/>
        <small>{(o.items||[]).map((i:any)=>`${i.qty}× ${i.name} (${i.color}/${i.size})`).join(', ')}</small><br/>
        {['paid','delivered','cancelled'].map(st=><button key={st} onClick={async()=>{await api({action:'order.status',id:o.id,status:st});loadOrders()}}>{st}</button>)}</div>)}</div>}
    </>}
  </div></div>);
}
function Row({p,api,upload,reload}:any){
  const [v,setV]=useState({...p,colours:p.colours.join(', '),sizes:p.sizes.join(', ')});
  const L=(s:string)=>s.split(',').map(x=>x.trim()).filter(Boolean);
  const save=async()=>{await api({action:'product.upsert',product:{...p,...v,colours:L(v.colours),sizes:L(v.sizes),pricePi:Number(v.pricePi),stock:Number(v.stock)}});reload()};
  return(<div className="row" style={{alignItems:'flex-start'}}>
    <div style={{width:70}}><Img src={p.images[0]} name={p.name}/></div>
    <div style={{flex:1,display:'grid',gap:4}}>
      <input value={v.name} onChange={e=>setV({...v,name:e.target.value})}/>
      <div style={{display:'flex',gap:4}}>Pi <input type="number" step="any" value={v.pricePi} onChange={e=>setV({...v,pricePi:e.target.value})} style={{width:110}}/>
        Stock <input type="number" value={v.stock} onChange={e=>setV({...v,stock:e.target.value})} style={{width:80}}/></div>
      <input placeholder="Colours, comma separated" value={v.colours} onChange={e=>setV({...v,colours:e.target.value})}/>
      <input placeholder="Sizes, comma separated" value={v.sizes} onChange={e=>setV({...v,sizes:e.target.value})}/>
      <input type="file" accept="image/*" onChange={e=>upload(p,e.target.files?.[0])}/>
      <div><button className="cta" onClick={save}>Save</button> <button onClick={async()=>{if(confirm('Delete?')){await api({action:'product.delete',id:p.id});reload()}}}>Delete</button></div></div></div>);
}
