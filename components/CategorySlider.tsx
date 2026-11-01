'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
export default function CategorySlider({boxes,active,onPick}:{boxes:any[];active:string;onPick:(s:string)=>void}){
  const ref=useRef<HTMLDivElement>(null);const [c,setC]=useState({l:0,r:0});
  const calc=useCallback(()=>{const el=ref.current;if(!el)return;let l=0,r=0;
    [...el.children].forEach((k:any)=>{if(k.offsetLeft+k.offsetWidth<=el.scrollLeft+4)l++;else if(k.offsetLeft>=el.scrollLeft+el.clientWidth-4)r++});setC({l,r})},[]);
  useEffect(()=>{calc();const el=ref.current;if(!el)return;const ro=new ResizeObserver(calc);ro.observe(el);window.addEventListener('resize',calc);return()=>{ro.disconnect();window.removeEventListener('resize',calc)}},[calc,boxes.length]);
  const by=(d:number)=>ref.current?.scrollBy({left:d*ref.current.clientWidth*.7,behavior:'smooth'});
  return(<div style={{position:'relative'}}>
    <button className="edge blink" style={{left:0}} onClick={()=>by(-1)} aria-label="Scroll categories left">{'<<<'} -{c.l}</button>
    <div ref={ref} onScroll={calc} className="slider">{boxes.map(b=>
      <button key={b.slug} aria-pressed={active===b.slug} onClick={()=>onPick(b.slug)}>{b.name}</button>)}</div>
    <button className="edge blink" style={{right:0}} onClick={()=>by(1)} aria-label="Scroll categories right">+{c.r} {'>>>'}</button>
  </div>);
}
