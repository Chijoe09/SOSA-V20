'use client';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { useShop } from '@/lib/shop';
export default function Header(){
  const {theme,setTheme}=useTheme();const [m,setM]=useState(false);useEffect(()=>setM(true),[]);
  const {settings,count,open,query,setQuery}=useShop();
  const taps=useRef<number[]>([]);
  const tap=()=>{const n=Date.now();taps.current=[...taps.current.filter(t=>n-t<3000),n];if(taps.current.length>=5){taps.current=[];open('admin')}};
  const next:any={system:'light',light:'dark',dark:'system'};
  const icon=!m?'◐':theme==='light'?'☀️':theme==='dark'?'🌙':'🖥️';
  async function share(){
    const url=settings.shareUrl;const text=`SOSA-outfits — Luxury street wears, pay with Pi. ${url}`;
    try{if(navigator.share)await navigator.share({title:'SOSA-outfits',text,url});else{await navigator.clipboard.writeText(url);alert('Link copied')}}catch{}
  }
  const rate=()=>{const n=Number(prompt('Rate SOSA 1-5'));if(n>=1&&n<=5){localStorage.setItem('sosa-rating-v18',String(n));alert('Thank you!')}};
  return(<header style={{padding:'8px 12px',borderBottom:'1px solid var(--line)',position:'sticky',top:0,background:'var(--bg)',zIndex:20}}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <img src="/logo.jpg" alt="SOSA logo" width={46} height={46} onClick={tap} style={{objectFit:'contain',borderRadius:8,background:'#fff',cursor:'pointer'}}/>
      <div style={{lineHeight:1.05,flex:1,minWidth:0}}>
        <div style={{fontWeight:900,fontSize:'clamp(15px,4.6vw,26px)',letterSpacing:.3}}>{settings.headerLine1}</div>
        <div className="grad" style={{fontWeight:800,fontSize:'clamp(14px,4vw,20px)'}}>{settings.headerLine2}</div>
      </div>
      <button aria-label="Colour mode" onClick={()=>setTheme(next[theme||'system'])}>{icon}</button>
      <button aria-label="Cart" onClick={()=>open('cart')} style={{position:'relative',fontSize:18}}>🛒
        <span className="badge">{count}</span></button>
    </div>
    <div style={{display:'flex',gap:6,marginTop:8}}>
      <input type="search" placeholder="Search products…" value={query} onChange={e=>setQuery(e.target.value)} style={{flex:1,minWidth:0}}/>
      <button onClick={rate}>⭐ Rate</button><button onClick={share}>Share</button>
    </div>
  </header>);
}
