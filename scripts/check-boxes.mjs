// Run: node scripts/check-boxes.mjs - WARN only, never fails build
import fs from 'fs';
const src=fs.readFileSync('lib/catalog.ts','utf8');
const parents=new Set([...src.matchAll(/parent:\s*'([^']+)'/g)].map(m=>m[1]));
const slugs=[...src.matchAll(/slug:\s*'([^']+)'/g)].map(m=>m[1]).filter(s=>!parents.has(s));
let bad=0;
for(const s of slugs){const d=`public/products/${s}`;const n=fs.existsSync(d)?fs.readdirSync(d).filter(f=>/\.(jpe?g|png|webp)$/i.test(f)).length:0;
if(n<6){bad++;console.log(`EMPTY/short: ${s} (${n}/6)`)}}
console.log(bad?`${bad} boxes need photos - ALLOWED FOR NOW`:'All boxes OK');process.exit(0);
