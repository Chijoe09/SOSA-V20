import { createClient } from '@supabase/supabase-js';
import { DEFAULTS } from './settings';
export const sb=()=>{const u=process.env.SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;return u&&k?createClient(u,k,{auth:{persistSession:false}}):null};
export const isAdmin=(req:Request)=>!!process.env.ADMIN_PASSWORD&&req.headers.get('x-admin-password')===process.env.ADMIN_PASSWORD;
export const round7=(n:number)=>Math.round(n*1e7)/1e7;
export async function getSettings(db:any){
  const {data}=await db.from('settings').select('*');const o:any={...DEFAULTS};
  (data||[]).forEach((r:any)=>{o[r.key]=r.value});return o;
}
export const mapProduct=(r:any)=>({id:r.id,box:r.box,name:r.name,colours:r.colours||[],sizes:r.sizes||[],pricePi:Number(r.price_pi),stock:r.stock,images:r.images||[]});
export const PI_API='https://api.minepi.com/v2';
export const piHeaders=()=>({Authorization:`Key ${process.env.PI_API_KEY}`,'Content-Type':'application/json'});
