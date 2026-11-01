'use client';
import { useCatalog } from '@/lib/store';
import { fmtPi } from '@/lib/catalog';
import { useState } from 'react';
export default function BoxGrid({onAdd}:{onAdd:(id:string,size:string,color:string)=>void}){
  const {boxes,items}=useCatalog(); const [open,setOpen]=useState<string>(boxes[0].slug);
  const [colour,setColour]=useState('All');
  const top=boxes.filter(b=>!b.parent); const kids=boxes.filter(b=>b.parent===open);
  const slugs=[open,...kids.map(k=>k.slug)];
  const list=items.filter(i=>slugs.includes(i.box)&&(colour==='All'||i.colours.includes(colour)));
  const cols=['All',...Array.from(new Set(items.filter(i=>slugs.includes(i.box)).flatMap(i=>i.colours)))];
  return(<section>
    <nav style={{display:'flex',gap:8,overflowX:'auto'}}>{top.map(b=><button key={b.slug} onClick={()=>{setOpen(b.slug);setColour('All')}} aria-pressed={open===b.slug}>{b.name}</button>)}</nav>
    <nav style={{display:'flex',gap:6,overflowX:'auto'}}>{cols.map(c=><button key={c} onClick={()=>setColour(c)} aria-pressed={colour===c}>{c}</button>)}</nav>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12}}>
      {list.map(i=><Card key={i.id} i={i} onAdd={onAdd}/>)}
    </div></section>);
}
function Card({i,onAdd}:{i:any;onAdd:any}){
  const [s,setS]=useState(i.sizes[0]);const [c,setC]=useState(i.colours[0]);
  return(<article>
    <img src={i.images[0]} alt={i.name} loading="lazy" onError={e=>{(e.currentTarget as HTMLImageElement).src='/logo.jpg'}} style={{width:'100%',aspectRatio:'1',objectFit:'cover'}}/>
    <h4>{i.name}</h4><b>{fmtPi(i.pricePi)}</b>
    <select value={c} onChange={e=>setC(e.target.value)}>{i.colours.map((x:string)=><option key={x}>{x}</option>)}</select>
    <select value={s} onChange={e=>setS(e.target.value)}>{i.sizes.map((x:string)=><option key={x}>{x}</option>)}</select>
    <button onClick={()=>onAdd(i.id,s,c)}>Add</button></article>);
}
