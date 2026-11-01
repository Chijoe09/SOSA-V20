'use client';
import { useEffect, useState } from 'react';
import { useShop } from '@/lib/shop';
export default function Welcome(){
  const {settings}=useShop();const [show,setShow]=useState(false);const [left,setLeft]=useState(5);
  useEffect(()=>{if(!sessionStorage.getItem('sosa-welcomed'))setShow(true)},[]);
  useEffect(()=>{if(show)setLeft(Number(settings.welcomeSeconds)||5)},[show,settings.welcomeSeconds]);
  useEffect(()=>{if(!show)return;const t=setInterval(()=>setLeft(l=>l-1),1000);return()=>clearInterval(t)},[show]);
  const go=()=>{sessionStorage.setItem('sosa-welcomed','1');setShow(false)};
  useEffect(()=>{if(show&&left<=0)go()},[left,show]);
  if(!show)return null;
  return(<div className="overlay"><div className="box" style={{textAlign:'center'}}>
    <img src="/logo.jpg" alt="SOSA" width={90} style={{borderRadius:12,background:'#fff'}}/>
    <p style={{fontSize:18,lineHeight:1.4}}>{settings.welcomeText}</p>
    <button className="cta" onClick={go}>Start Shopping</button>
    <small style={{display:'block',marginTop:8,opacity:.7}}>Opening shop in {Math.max(left,0)}s…</small>
  </div></div>);
}
