// Defaults only — every value is editable in the Admin Control Room (stored in Supabase `settings`).
export const DEFAULTS:any={
  welcomeText:'Welcome To SOPHISTICATED SAMPLES, SOSA-outfits - Luxury street general wears, shoes, hand bags, jeans, shirts, natives wears, pay with pi - Start shopping.',
  welcomeSeconds:5, headerLine1:'SOPHISTICATED SAMPLES', headerLine2:'SOSA-outfits.',
  shareUrl:'https://sosa-v18.vercel.app', mainnetUrl:'https://sosa.pi', referralPi:0.000001,
  deliveryFee:0.0001, deliveryInfo:'0.0001 Pi (1-2 days Lagos, 4-7 days outside Lagos)',
  address:'No. 1, ODICHE STREET, COKER Aguda, ORILE, LAGOS.',
  whatsapp:'+2348087259800', email:'sophisticatedsamples@gmail.com',
  telegram:'', instagram:'', facebook:'', x:'', tiktok:'',
  mapSosaUrl:'https://maps.app.goo.gl/VJ5pD8zmLRVZJce38', mapPiUrl:'https://maps.app.goo.gl/VJ5pD8zmLRVZJce38',
  versionText:'http://sosa.pi v18', handkerchiefNote:'Only sold in packs of 12 pieces per dozen',
};
export const FIELDS:[string,string][]=[
  ['welcomeText','Welcome popup text'],['welcomeSeconds','Welcome popup seconds'],
  ['headerLine1','Header line 1'],['headerLine2','Header line 2'],
  ['shareUrl','Share App URL (testnet)'],['mainnetUrl','Mainnet URL (future)'],['referralPi','Referral reward (Pi)'],
  ['deliveryFee','Delivery fee (Pi)'],['deliveryInfo','Delivery info text'],['address','Shop / pickup address'],
  ['whatsapp','WhatsApp number'],['email','Official email'],['telegram','Telegram username (no @)'],
  ['instagram','Instagram URL'],['facebook','Facebook URL'],['x','X URL'],['tiktok','TikTok URL'],
  ['mapSosaUrl','Sosa Map link'],['mapPiUrl','Map of Pi link'],['versionText','Version text'],['handkerchiefNote','Handkerchief note'],
];
const NUM=new Set(['welcomeSeconds','deliveryFee','referralPi']);
export const castSetting=(k:string,v:any)=>NUM.has(k)?Number(v):v;
