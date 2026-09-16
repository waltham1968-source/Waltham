import {normalize,readPublic,allowed,analyze} from './lib/visibility.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export default async req=>{
  if(req.method!=='POST')return json({error:'Brug POST.'},405);
  try{
    const raw=await req.text();if(raw.length>6000)return json({error:'Indtastningen er for lang.'},413);
    const input=JSON.parse(raw),url=normalize(input.url);
    const profile=Object.fromEntries(['company','offering','market','desired'].map(k=>[k,String(input[k]||'').trim().slice(0,400)]));
    let robots=await readPublic(new URL('/robots.txt',url)).catch(()=>null);
    if(robots?.status===200 && !allowed(robots.text,'WalthamVisibilityCheck',url.pathname+url.search))return json({error:'Hjemmesidens adgangsregler tillader ikke vores tjek af denne side.'},422);
    const page=await readPublic(url);
    if(page.status!==200 || !/text\/html|application\/xhtml\+xml/i.test(page.headers['content-type']||''))return json({error:'Siden kunne ikke læses som en almindelig hjemmeside. Prøv forsiden.'},422);
    if(new URL(page.url).origin!==url.origin)robots=await readPublic(new URL('/robots.txt',page.url)).catch(()=>null);
    const declared=robots?.status===200?robots.text.match(/^\s*sitemap:\s*(https?:\/\/\S+)/im)?.[1]:null;
    const sitemapUrl=declared||new URL('/sitemap.xml',page.url).href;
    const sitemap=await readPublic(sitemapUrl).catch(()=>null);
    return json(analyze({page,robots,sitemap,profile}));
  }catch{return json({error:'Tjekket kunne ikke gennemføres. Kontrollér webadressen, eller prøv igen senere. Private adresser understøttes ikke.'},400);}
};
export const config={path:'/api/ai-visibility',rateLimit:{windowLimit:5,windowSize:180,aggregateBy:['ip','domain']}};
