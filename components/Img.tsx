'use client';
import { useEffect, useState } from 'react';
export default function Img({src,name}:{src?:string;name:string}){
  const [bad,setBad]=useState(false);useEffect(()=>setBad(false),[src]);
  if(!src||bad)return <div style={{aspectRatio:'1',display:'grid',placeItems:'center',background:'var(--line)',borderRadius:8,textAlign:'center',padding:8,fontSize:12}}>{name}</div>;
  return <img src={src} alt={name} loading="lazy" onError={()=>setBad(true)} style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:8}}/>;
}
