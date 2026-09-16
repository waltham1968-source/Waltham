import {normalize,readPublic,allowed,analyze} from './lib/visibility.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const technicalError=error=>{
  const message=String(error?.message||'');
  if(/for stor|meget stor/i.test(message))return 'Vi kunne ikke hente hjemmesiden teknisk, fordi siden er meget stor. Det betyder ikke nødvendigvis, at AI ikke kan finde virksomheden. Store webshops kan kræve en dybere analyse.';
  if(/tidsgrænsen|timeout|timed out/i.test(message))return 'Vi kunne ikke hente hjemmesiden teknisk inden for tidsgrænsen. Det betyder ikke nødvendigvis, at AI ikke kan finde virksomheden. Siden kan være langsom eller kræve en anden hentemetode.';
  if(/403|forbidden|access denied|blocked/i.test(message))return 'Hjemmesiden ser ud til at afvise vores automatiske serverkald. Det betyder ikke nødvendigvis, at ChatGPT eller søgemaskiner ikke kan finde virksomheden.';
  if(/offentligt tilgængelig|private/i.test(message))return 'Adressen kunne ikke kontrolleres som en offentlig hjemmeside. Private adresser, interne netværk og særlige porte understøttes ikke.';
  if(/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(message))return 'Domænet kunne ikke slås op lige nu. Kontrollér webadressen, eller prøv igen senere.';
  return 'Vi kunne ikke hente hjemmesiden teknisk. Det betyder ikke nødvendigvis, at AI ikke kan finde virksomheden. Siden kan blokere automatiske kald, være meget tung, eller kræve en anden hentemetode.';
};
export default async req=>{
  if(req.method!=='POST')return json({error:'Brug POST.'},405);
  try{
    const raw=await req.text();if(raw.length>6000)return json({error:'Indtastningen er for lang.'},413);
    const input=JSON.parse(raw),url=normalize(input.url);
    const submittedUrl=url.href;
    const profile=Object.fromEntries(['company','offering','market','desired'].map(k=>[k,String(input[k]||'').trim().slice(0,400)]));
    let robots=await readPublic(new URL('/robots.txt',url)).catch(()=>null);
    if(robots?.status===200 && !allowed(robots.text,'WalthamVisibilityCheck',url.pathname+url.search))return json({error:'Hjemmesidens adgangsregler tillader ikke vores tjek af denne side. Det er en teknisk adgangsregel — ikke i sig selv et bevis på, at AI ikke kan finde virksomheden.'},422);
    const page=await readPublic(url);
    if(page.status===403 || page.status===406 || page.status===429)return json({error:'Hjemmesiden afviser vores automatiske serverkald. Det betyder ikke nødvendigvis, at ChatGPT eller søgemaskiner ikke kan finde virksomheden.'},422);
    if(page.status!==200 || !/text\/html|application\/xhtml\+xml/i.test(page.headers['content-type']||''))return json({error:'Siden kunne ikke læses som en almindelig hjemmeside. Det betyder ikke nødvendigvis, at AI ikke kan finde virksomheden. Prøv eventuelt en anden offentlig side på domænet.'},422);
    if(new URL(page.url).origin!==url.origin)robots=await readPublic(new URL('/robots.txt',page.url)).catch(()=>null);
    const declared=robots?.status===200?robots.text.match(/^\s*sitemap:\s*(https?:\/\/\S+)/im)?.[1]:null;
    const sitemapUrl=declared||new URL('/sitemap.xml',page.url).href;
    const sitemap=await readPublic(sitemapUrl).catch(()=>null);
    return json(analyze({page,robots,sitemap,profile,submittedUrl}));
  }catch(error){return json({error:technicalError(error)},422);}
};
export const config={path:'/api/ai-visibility',rateLimit:{windowLimit:5,windowSize:180,aggregateBy:['ip','domain']}};
