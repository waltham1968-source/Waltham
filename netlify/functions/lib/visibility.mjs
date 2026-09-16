import dns from 'node:dns/promises';
import https from 'node:https';
import http from 'node:http';
import net from 'node:net';

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
  if(redirects>3) throw new Error('For mange viderestillinger.');
  const host=url.hostname.replace(/^\[|\]$/g,'');
  const addresses=await dns.lookup(host,{all:true});
  if (!addresses.length || addresses.some(x=>!publicAddress(x.address))) throw new Error('Adressen skal være offentligt tilgængelig.');
  const address=addresses[0];
  const result=await new Promise((resolve,reject)=>{
    const request=(url.protocol==='https:'?https:http).get(url,{
      headers:{'user-agent':'WalthamVisibilityCheck/1.0 (+https://waltham.dk)','accept-encoding':'identity'},
      lookup:(_host,options,cb)=>options.all?cb(null,[address]):cb(null,address.address,address.family)
    },response=>{
      let bytes=0; const chunks=[];
      response.on('data',chunk=>{bytes+=chunk.length;if(bytes>1_000_000)request.destroy(new Error('Siden er for stor til dette hurtige tjek.'));else chunks.push(chunk);});
      response.on('error',reject);
      response.on('end',()=>resolve({status:response.statusCode,headers:response.headers,text:Buffer.concat(chunks).toString('utf8'),url:url.href}));
    });
    const timer=setTimeout(()=>request.destroy(new Error('Hjemmesiden svarede ikke inden for tidsgrænsen.')),7000);
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
export function analyze({page,robots,sitemap,profile={}}){
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
  const add=(area,label,pass,weight,evidence,action)=>checks.push({area,label,pass,weight,evidence,action});
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
  return {version:'1.0',url:page.url,checkedAt:new Date().toISOString(),score,scoreStatus:'Foreløbig',coverage:weight,risk:score<4?'High':score<7?'Medium':'Low',title,description,checks,bots,
    summary:'Et første billede af hjemmesidens tilgængelighed og tydelighed. Scoren dokumenterer ikke, om AI anbefaler virksomheden.',
    presence:{status:'Ikke målt',questions:[`Hvilke virksomheder kan hjælpe med ${profile.offering||'[ydelse]'} i ${profile.market||'[område]'}?`,`Hvem vil du anbefale til ${profile.offering||'[ydelse]'} for ${profile.market||'[målgruppe]'}, og hvorfor?`,`Hvilke alternativer er der til ${profile.company||title||'[virksomheden]'}?`],competitors:[]},
    perception:{status:desired.length?'Indledende tekstmatch':'Mangler ønsket billede',observed:description||title||text.slice(0,250),comparisons:perception,note:'Ordmatch er et samtalegrundlag, ikke en vurdering af kundernes faktiske opfattelse. En fuld vurdering kræver virksomhedens mål og en kvalitativ gennemgang.'},
    limitations:['Kun den indtastede side, adgangsregler og én sideoversigt undersøges.','Tilladelse i adgangsregler dokumenterer ikke faktisk adgang gennem firewall eller placering i søgeresultater.','Forståelse vurderes via enkle signaler; tekst og virksomhedsdata kan være ufuldstændige eller forældede.','AI Presence udgør 30 % af den fulde model og er endnu ikke målt. Manglende målinger tæller ikke som nul.']};
}
