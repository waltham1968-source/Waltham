import dns from 'node:dns/promises';
import https from 'node:https';
import http from 'node:http';
import net from 'node:net';

const MAX_PAGE_BYTES=3_000_000;
const REQUEST_TIMEOUT_MS=10000;
const FETCH_HEADERS={
  'user-agent':'Mozilla/5.0 (compatible; WalthamVisibilityCheck/1.1; +https://waltham.dk/dk/ai-visibility-check)',
  'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
  'accept-language':'da-DK,da;q=0.9,en;q=0.7',
  'accept-encoding':'identity'
};

// Resolve once and pin the approved address to the connection (including redirects).
export function publicAddress(ip) {
  if (net.isIP(ip) === 6) return /^2[0-9a-f]{3}:/i.test(ip) && !/^2001:(?:0:|db8:|10:|20:)/i.test(ip) && !/^2002:/i.test(ip);
  if (net.isIP(ip) !== 4) return false;
  const [a,b,c] = ip.split('.').map(Number);
  return !(a===0 || a===10 || a===127 || a>=224 || (a===100 && b>=64 && b<=127) || (a===169 && b===254) || (a===172 && b>=16 && b<=31) || (a===192 && (b===168 || b===0 || (b===2))) || (a===198 && (b===18 || b===19 || (b===51 && c===100))) || (a===203 && b===0 && c===113));
}
export function normalize(raw) {
  if (typeof raw !== 'string' || raw.length>500 || !raw.trim()) throw new Error('Skriv en gyldig webadresse.');
  const value=raw.trim();
  const url=new URL(value.includes('://') ? value : `https://${value}`);
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80','443'].includes(url.port))) throw new Error('Brug en offentlig webadresse uden login eller særlig port.');
  url.hash=''; return url;
}
export async function readPublic(raw, redirects=0) {
  const url=normalize(String(raw));
  if(redirects>5) throw new Error('For mange viderestillinger.');
  const host=url.hostname.replace(/^\[|\]$/g,'');
  const addresses=await dns.lookup(host,{all:true});
  const publicAddresses=addresses.filter(x=>publicAddress(x.address));
  if (!publicAddresses.length) throw new Error('Adressen skal være offentligt tilgængelig.');
  const address=publicAddresses.find(x=>x.family===4)||publicAddresses[0];
  const result=await new Promise((resolve,reject)=>{
    const request=(url.protocol==='https:'?https:http).get(url,{
      headers:FETCH_HEADERS,
      lookup:(_host,options,cb)=>options.all?cb(null,[address]):cb(null,address.address,address.family)
    },response=>{
      let bytes=0; const chunks=[];
      response.on('data',chunk=>{bytes+=chunk.length;if(bytes>MAX_PAGE_BYTES)request.destroy(new Error('Siden er meget stor. Vi kunne ikke hente nok indhold til et hurtigt førstetjek.'));else chunks.push(chunk);});
      response.on('error',reject);
      response.on('end',()=>resolve({status:response.statusCode,headers:response.headers,text:Buffer.concat(chunks).toString('utf8'),url:url.href}));
    });
    const timer=setTimeout(()=>request.destroy(new Error('Hjemmesiden svarede ikke inden for tidsgrænsen.')),REQUEST_TIMEOUT_MS);
    request.on('error',reject); request.on('close',()=>clearTimeout(timer));
  });
  if([301,302,303,307,308].includes(result.status) && result.headers.location) return readPublic(new URL(result.headers.location,url).href,redirects+1);
  return result;
}
export function allowed(text,bot,path='/') {
  const groups=[];let group=null;let rulesStarted=false;
  for(const line of text.split(/\r?\n/)){
    const match=line.replace(/#.*/,'').match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);if(!match)continue;
    const key=match[1].toLowerCase(),value=match[2];
    if(key==='user-agent'){
      if(!group||rulesStarted){group={agents:[],rules:[]};groups.push(group);rulesStarted=false;}
      group.agents.push(value.toLowerCase());
    }else if(group&&['allow','disallow'].includes(key)){rulesStarted=true;if(value)group.rules.push({allow:key==='allow',path:value});}
  }
  const token=bot.toLowerCase();
  const specific=groups.filter(g=>g.agents.includes(token));
  const selected=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
  const matching=selected.flatMap(g=>g.rules).filter(r=>{
    const end=r.path.endsWith('$');const p=end?r.path.slice(0,-1):r.path;
    return new RegExp('^'+p.split('*').map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')+(end?'$':'')).test(path);
  }).sort((a,b)=>b.path.replace(/[*$]/g,'').length-a.path.replace(/[*$]/g,'').length || Number(b.allow)-Number(a.allow));
  return matching[0]?.allow ?? true;
}
const decode=text=>text.replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_,v)=>{const n=v[0].toLowerCase()==='x'?parseInt(v.slice(1),16):Number(v);return n>0&&n<=0x10ffff?String.fromCodePoint(n):' ';}).replace(/&(?:oslash|aring|aelig|Oslash|Aring|AElig|quot|apos|amp|nbsp);/g,m=>({'&oslash;':'ø','&aring;':'å','&aelig;':'æ','&Oslash;':'Ø','&Aring;':'Å','&AElig;':'Æ','&quot;':'"','&apos;':"'",'&amp;':'&','&nbsp;':' '}[m]));
const clean=text=>decode(text).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(m=>[m[1].toLowerCase(),m[2]??m[3]??m[4]]));
const excerpt=(value,max=240)=>value.length>max?`${value.slice(0,max).trimEnd()}…`:value;
export function describeImpression(html,{url,title,description,business,profile={}}){
  const headings=[...html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m=>({level:Number(m[1]),text:clean(m[2])})).filter(x=>x.text);
  const h1=headings.find(x=>x.level===1)?.text||'';
  const sections=headings.filter(x=>x.level>1 && x.text.length>=4 && x.text.length<=95 && !/^(about|om os|om oss|kontakt|contact|menu|learn more|læs mere|les mer|our impact|vores mission|our mission|our mission in action|portfolio(?: highlights)?|referencer|references)$/i.test(x.text)).slice(0,8);
  const paragraphs=[...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(m=>clean(m[1])).filter(x=>x.length>=45 && x.length<=900);
  const identity=business?.name?String(business.name):profile.company && clean(html).toLocaleLowerCase().includes(profile.company.toLocaleLowerCase())?profile.company:title.split(/\s+[|—–-]\s+/)[0];
  const mainMessage=description||paragraphs[0]||h1||'';
  const offerCandidates=sections.map(x=>x.text).filter(x=>!/^\d|^(why|hvorfor|hvordan|how|what|hvad|case|blog|news|nyheder|nyheter)/i.test(x)).slice(0,5);
  const desired=String(profile.desired||'').split(/[,;\n]/).map(x=>x.trim()).filter(Boolean).slice(0,6);
  const sourceText=clean(html).toLocaleLowerCase();
  return {
    scope:'single-page-text',identity:excerpt(identity||'',120),headline:excerpt(h1,180),mainMessage:excerpt(mainMessage,300),openingText:excerpt(paragraphs[0]||'',300),offerCandidates,
    evidence:[...(h1?[{kind:'heading',text:excerpt(h1,180),url}]:[]),...(description?[{kind:'description',text:excerpt(description,300),url}]:[]),...sections.slice(0,5).map(x=>({kind:'section',text:x.text,url}))],
    questions:[...(!identity?['identity']:[]),...(!description?['description']:[]),...(!offerCandidates.length?['offer']:[]),...(offerCandidates.length>=4?['priority']:[])],
    desired:desired.map(term=>({term,status:sourceText.includes(term.toLocaleLowerCase())?'visible':'unverified'}))
  };
}
export function internalPages(html,base,max=3){
  const origin=new URL(base).origin,seen=new Set([new URL(base).pathname]);const pages=[];
  for(const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)){
    try{
      const url=new URL(decode(match[1]),base);url.hash='';url.search='';
      if(url.origin!==origin || seen.has(url.pathname) || /\.(?:pdf|jpg|jpeg|png|webp|svg|zip|xml|txt)$/i.test(url.pathname))continue;
      seen.add(url.pathname);pages.push(url.href);if(pages.length>=max)break;
    }catch{}
  }
  return pages;
}
export function pageRecommendations(page,profile={}){
  const html=page.text,metas=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>attrs(m[0]));
  const title=clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
  const description=decode(metas.find(m=>m.name?.toLowerCase()==='description')?.content||'').trim();
  const heading=clean(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
  const text=clean(html).toLocaleLowerCase();const tasks=[];
  if(!title)tasks.push({priority:1,code:'title'});
  if(!description)tasks.push({priority:1,code:'description'});
  if(!heading)tasks.push({priority:1,code:'heading'});
  if(!/mailto:|tel:/i.test(html))tasks.push({priority:2,code:'contact'});
  if(describeImpression(html,{url:page.url,title,description,profile}).offerCandidates.length>=4)tasks.push({priority:2,code:'priorityOffer'});
  const desired=String(profile.desired||'').split(/[,;\n]/).map(x=>x.trim()).filter(Boolean).slice(0,6);
  if(desired.length && desired.every(x=>!text.includes(x.toLocaleLowerCase())))tasks.push({priority:2,code:'desired'});
  return {url:page.url,title:title||new URL(page.url).pathname,tasks};
}
export function analyze({page,robots,sitemap,profile={},submittedUrl=page.url}){
  const html=page.text,text=clean(html), lower=text.toLocaleLowerCase('da');
  const title=clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
  const metas=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>attrs(m[0]));
  const description=decode(metas.find(m=>m.name?.toLowerCase()==='description')?.content||'');
  const searchable=(text+' '+description).toLocaleLowerCase('da');
  const directives=metas.filter(m=>['robots','googlebot','bingbot','oai-searchbot'].includes(m.name?.toLowerCase())).map(m=>m.content).join(' ')+ ' '+(page.headers['x-robots-tag']||'');
  const noindex=/\b(noindex|none)\b/i.test(directives);
  let entities=[];
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    if(attrs(m[1]).type?.toLowerCase()!=='application/ld+json')continue;
    try{const walk=x=>{if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object'){if(x['@type'])entities.push(x);Object.values(x).filter(v=>v&&typeof v==='object').forEach(walk);}};walk(JSON.parse(m[2]));}catch{}
  }
  const business=entities.find(e=> /Organization|Business|Bank|Corporation|Store|Service|Agency|Clinic|Restaurant|Hotel/i.test([e['@type']].flat().join(' ')));
  const robotKnown=robots && ((robots.status===200 && !/<html/i.test(robots.text)) || [404,410].includes(robots.status));
  const botnames=['OAI-SearchBot','Claude-SearchBot','PerplexityBot','Googlebot','bingbot'];
  const bots=Object.fromEntries(botnames.map(b=>[b,robotKnown?allowed(robots.status===200?robots.text:'',b,new URL(page.url).pathname+new URL(page.url).search):null]));
  const checks=[];
  const add=(area,label,pass,weight,evidence,action)=>checks.push({id:['readable','crawlers','indexable','sitemap','identity','offering','market','entity'][checks.length],area,label,pass,weight,evidence,action});
  add('access','Indhold kan læses',text.split(/\s+/).length>=100,10,`${text.split(/\s+/).length} ord i den hentede side.`,'Gør virksomhedens vigtigste indhold læsbart uden interaktion.');
  add('access','Adgang for søgetjenester',robotKnown?Object.values(bots).every(Boolean):null,20,robotKnown?Object.entries(bots).map(([b,v])=>`${b}: ${v?'tilladt':'begrænset'}`).join(' · '):'Adgangsregler kunne ikke verificeres.','Gennemgå adgangsreglerne for søgetjenester. Et bevidst fravalg kan være korrekt.');
  add('access','Siden må vises i søgeresultater',!noindex,5,noindex?'Der er fundet en regel, som begrænser indeksering.':'Ingen noindex-regel fundet i den hentede side eller svarheader.','Undersøg, om udelukkelsen fra søgeresultater er tilsigtet.');
  const sitemapOk=sitemap?.status===200 && /<(?:[\w-]+:)?(?:urlset|sitemapindex)\b/i.test(sitemap.text);
  add('access','Oversigt over hjemmesidens sider',sitemap && [200,404,410].includes(sitemap.status)?sitemapOk:null,5,sitemapOk?'En XML-sideoversigt blev fundet.':sitemap && [200,404,410].includes(sitemap.status)?'Ingen gyldig sideoversigt på den undersøgte adresse.':'Sideoversigten kunne ikke kontrolleres.','Tilføj en opdateret sideoversigt, og henvis til den fra hjemmesidens adgangsregler.');
  add('understanding','Virksomheden er identificeret',Boolean(business?.name || (profile.company && lower.includes(profile.company.toLowerCase()))),8,business?.name?String(business.name):profile.company && lower.includes(profile.company.toLowerCase())?`Virksomhedsnavnet “${profile.company}” findes i sidens tekst.`:'Intet verificeret virksomhedsnavn fundet i de undersøgte signaler.','Skriv virksomhedens navn tydeligt, og forbind det med en entydig virksomhedsprofil.');
  add('understanding','Tilbuddet er beskrevet',Boolean(description.length>=50 && /<h1\b/i.test(html)),8,description||'Ingen kort sidebeskrivelse fundet.','Beskriv konkret, hvad I tilbyder, og hvem det hjælper.');
  add('understanding','Geografi eller målgruppe er angivet',Boolean(business?.address || business?.areaServed || business?.audience || (profile.market && searchable.includes(profile.market.toLowerCase()))),7,business?.address?'Adresse fundet i virksomhedsdata.':business?.areaServed||business?.audience?'Område eller målgruppe fundet i virksomhedsdata.':profile.market?`Søgt efter “${profile.market}” i sidens tekst.`:'Geografi/målgruppe ikke verificeret.','Angiv tydeligt jeres område og målgruppe på relevante sider.');
  add('understanding','Sammenhængende virksomhedsprofil',Boolean(business?.name && (business.url||business['@id']) && (business.sameAs||business.telephone||business.address)),7,business?'Virksomhedsdata fundet; navn, identitet og kontakt kontrolleret.':'Ingen genkendelig virksomhedsprofil i strukturerede data.','Knyt navn, webadresse og kontaktoplysninger sammen i hjemmesidens virksomhedsdata.');
  const measured=checks.filter(c=>c.pass!==null),weight=measured.reduce((s,c)=>s+c.weight,0),earned=measured.reduce((s,c)=>s+(c.pass?c.weight:0),0);
  const score=Number((1+9*earned/weight).toFixed(1));
  const desired=String(profile.desired||'').split(/[,;\n]/).map(s=>s.trim()).filter(Boolean).slice(0,6);
  const perception=desired.map(term=>({term,found:searchable.includes(term.toLowerCase())}));
  return {version:'2.0',submittedUrl,url:page.url,checkedAt:new Date().toISOString(),score,scoreStatus:'Foreløbig',coverage:weight,risk:score<4?'High':score<7?'Medium':'Low',title,description,checks,bots,
    impression:describeImpression(html,{url:page.url,title,description,business,profile}),
    summary:'Et første billede af hjemmesidens tilgængelighed og tydelighed. Scoren dokumenterer ikke, om AI anbefaler virksomheden.',
    presence:{status:'Ikke målt',questions:[`Hvilke virksomheder kan hjælpe med ${profile.offering||'[ydelse]'} i ${profile.market||'[område]'}?`,`Hvem vil du anbefale til ${profile.offering||'[ydelse]'} for ${profile.market||'[målgruppe]'}, og hvorfor?`,`Hvilke alternativer er der til ${profile.company||title||'[virksomheden]'}?`],competitors:[]},
    perception:{status:desired.length?'Indledende tekstmatch':'Mangler ønsket billede',observed:description||title||text.slice(0,250),comparisons:perception,note:'Ordmatch er et samtalegrundlag, ikke en vurdering af kundernes faktiske opfattelse. En fuld vurdering kræver virksomhedens mål og en kvalitativ gennemgang.'},
    limitations:['Kun den indtastede side, adgangsregler og én sideoversigt undersøges.','Tilladelse i adgangsregler dokumenterer ikke faktisk adgang gennem firewall eller placering i søgeresultater.','Forståelse vurderes via enkle signaler; tekst og virksomhedsdata kan være ufuldstændige eller forældede.','AI Presence udgør 30 % af den fulde model og er endnu ikke målt. Manglende målinger tæller ikke som nul.']};
}
