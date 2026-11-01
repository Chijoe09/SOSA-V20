'use client';
import { useEffect, useState, useCallback } from 'react';
import { Item, Box, BOXES, seedItems } from './catalog';
const KEY='sosa-catalog-v18';
interface State{ items:Item[]; boxes:Box[]; referralPi:number }
const init=():State=>({items:seedItems(),boxes:BOXES,referralPi:0.000001});
export function useCatalog(){
  const [s,set]=useState<State>(init());
  useEffect(()=>{try{const r=localStorage.getItem(KEY);if(r)set(JSON.parse(r))}catch{}},[]);
  const save=useCallback((fn:(p:State)=>State)=>set(p=>{const n=fn(p);try{localStorage.setItem(KEY,JSON.stringify(n))}catch{}return n}),[]);
  return {...s,
    updateItem:(id:string,patch:Partial<Item>)=>save(p=>({...p,items:p.items.map(i=>i.id===id?{...i,...patch}:i)})),
    addItem:(it:Item)=>save(p=>({...p,items:[...p.items,it]})),
    removeItem:(id:string)=>save(p=>({...p,items:p.items.filter(i=>i.id!==id)})),
    addBox:(b:Box)=>save(p=>({...p,boxes:[...p.boxes,b]})),
    setReferral:(n:number)=>save(p=>({...p,referralPi:n})),
    reset:()=>save(()=>init())};
}
