// SOSA COLLECTIONS v18 — 24 boxes, 6 items each. Photos: public/products/<slug>/1.jpg … 6.jpg
export type Kind = 'shoe'|'cloth'|'jeansM'|'jeansF'|'belt'|'misc';
export interface Box { slug:string; name:string; kind:Kind; noun:string; colours:string[]; sizes:string[]; parent?:string }
export interface Item { id:string; box:string; name:string; colours:string[]; sizes:string[]; pricePi:number; stock:number; images:string[] }

const CL=['M','L','XL','XXL','3XL'], SH=['37','38','39','40','41','42'], SHM=['40','41','42','43','44','45','46'];
const BS=['32','34','36','38','40','42','44'];
const C=(...c:string[])=>c;
const std=C('Black','Brown','Tan','White');

export const BOXES: Box[] = [
 {slug:'male-native',name:'Male Native Wears',kind:'cloth',noun:'Native Set',colours:std,sizes:CL},
 {slug:'female-native',name:'Female Native Wears',kind:'cloth',noun:'Native Gown',colours:std,sizes:CL},
 {slug:'ankara-coated',name:'Female Native Ankara Coated Customized Wears',kind:'cloth',noun:'Ankara Coated',colours:std,sizes:CL},
 {slug:'ankara-coated-jackets',name:'Ankara Coated Jackets',kind:'cloth',noun:'Ankara Jacket',colours:std,sizes:CL,parent:'ankara-coated'},
 {slug:'ankara-coated-gowns',name:'Ankara Coated Gowns',kind:'cloth',noun:'Ankara Gown',colours:std,sizes:CL,parent:'ankara-coated'},
 {slug:'ankara-coated-sets',name:'Ankara Coated Matching Sets',kind:'cloth',noun:'Matching Set',colours:std,sizes:CL,parent:'ankara-coated'},
 {slug:'men-shoes-leather',name:'Men Shoes Box1 Leather',kind:'shoe',noun:'Leather Loafer',colours:C('Black','Brown','Tan'),sizes:SHM},
 {slug:'men-shoes-sneakers',name:'Men Shoes Box2 Sneakers',kind:'shoe',noun:'Sneaker',colours:C('White','Black','Grey'),sizes:SHM},
 {slug:'female-shoes-heels',name:'Female Shoes Box1 High Heels/Wedge',kind:'shoe',noun:'Heel',colours:C('Black','Nude','Red','Gold'),sizes:SH},
 {slug:'female-shoes-flats',name:'Female Shoes Box2 Flat/Sneakers',kind:'shoe',noun:'Flat',colours:C('Black','White','Nude','Pink'),sizes:SH},
 {slug:'men-palm',name:'Men Footwear Palm',kind:'shoe',noun:'Palm Slide',colours:C('Black','Brown','Tan'),sizes:SHM},
 {slug:'female-palm',name:'Female Footwear Palm',kind:'shoe',noun:'Palm Slide',colours:C('Black','Brown','Gold','Nude'),sizes:SH},
 {slug:'men-bags',name:'Men Hand Bags',kind:'misc',noun:'Cross Bag',colours:C('Black','Brown','Tan'),sizes:['One Size']},
 {slug:'female-bags',name:'Female Hand Bags',kind:'misc',noun:'Hand Bag',colours:C('Black','Coral','Teal','Brown','Nude'),sizes:['One Size']},
 {slug:'male-tops',name:'Male Tops',kind:'cloth',noun:'Top',colours:std,sizes:CL},
 {slug:'female-tops',name:'Female Tops',kind:'cloth',noun:'Top',colours:std,sizes:CL},
 {slug:'men-suits',name:'Men Suits',kind:'cloth',noun:'Suit',colours:C('Black','Brown','White','Dark Blue','Grey','Light Blue'),sizes:CL},
 {slug:'female-suits',name:'Female Suits',kind:'cloth',noun:'Suit',colours:C('Black','Brown','Dark Red','Dark Blue','Light Blue'),sizes:CL},
 {slug:'male-singlet',name:'Male Singlet/Boxers',kind:'cloth',noun:'Singlet & Boxer',colours:C('White','Black','Grey'),sizes:CL},
 {slug:'female-bracelet-pants',name:'Female Bracelet/Pants',kind:'cloth',noun:'Bracelet & Pants',colours:C('Black','Gold','Nude'),sizes:CL},
 {slug:'men-belts',name:'Men Buckle Belts',kind:'belt',noun:'Buckle Belt',colours:C('Black','Brown','Tan'),sizes:BS},
 {slug:'female-belts',name:'Female Buckle Belts',kind:'belt',noun:'Buckle Belt',colours:C('Black','Brown','Gold','Nude'),sizes:BS},
 {slug:'laces-stockings',name:'Laces/Stockings',kind:'misc',noun:'Lace & Stocking',colours:C('Black','White','Nude'),sizes:['One Size']},
 {slug:'men-jeans',name:'Men Jeans',kind:'jeansM',noun:'Jeans',colours:C('Black','Blue','Dark Blue','Grey','Brown','White'),sizes:['30','32','34','36','38','40']},
 {slug:'female-jeans',name:'Female Jeans',kind:'jeansF',noun:'Jeans',colours:C('Black','Blue','Light Blue','White','Grey'),sizes:['28','30','32','34','36','38']},
 {slug:'face-cap',name:'Face Cap',kind:'misc',noun:'Face Cap',colours:C('Black','White','Brown','Dark Blue'),sizes:['One Size']},
 {slug:'handkerchief',name:'Handkerchief',kind:'misc',noun:'Handkerchief',colours:C('White','Blue','Gold','Red'),sizes:['One Size']},
 {slug:'sport-kits',name:'Unisex Designers Sport Wears & Kits',kind:'cloth',noun:'Sport Kit',colours:C('Black','White','Blue','Red'),sizes:CL},
 {slug:'sport-kits-men',name:'Sport Wears & Kits (For Men)',kind:'cloth',noun:'Men Sport Kit',colours:C('Black','White','Blue','Red'),sizes:CL,parent:'sport-kits'},
 {slug:'sport-kits-female',name:'Sport Wears & Kits (For Female)',kind:'cloth',noun:'Female Sport Kit',colours:C('Black','White','Pink','Red'),sizes:CL,parent:'sport-kits'},
];

const STYLES=['Classic','Royal','Lagos','Executive','Heritage','Signature'];
const PRICES=[0.05,0.04,0.03,0.05,0.04,0.03];
export const ITEMS_PER_BOX=6;

export function seedItems(): Item[] {
  return BOXES.filter(b=>!BOXES.some(x=>x.parent===b.slug)).flatMap(b => STYLES.slice(0,ITEMS_PER_BOX).map((s,i)=>({
    id:`${b.slug}-${i+1}`, box:b.slug, name:`${s} ${b.noun}`,
    colours:b.colours, sizes:b.sizes, pricePi:PRICES[i], stock:20,
    images:[`/products/${b.slug}/${i+1}.jpg`],
  })));
}
export const fmtPi=(n:number)=>`${n.toFixed(2)} π`;
export const BUSINESS={legal:'SOPHISTICATED SAMPLES MERCHANDISE',brand:'SOSA COLLECTIONS',bn:'BN 2229053',crbn:'177764',reg:'27 Sept 2012',tm:'Trademark accepted, Class 18 (May 2017)',address:'No. 1, ODICHE STREET, COKER Aguda, ORILE, LAGOS.',phone:'+2348087259800'};
