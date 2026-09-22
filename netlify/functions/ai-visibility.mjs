import {language,translator} from '../../js/visibility-copy.mjs';
import {localizeReport} from './lib/visibility-locale.mjs';
import {normalize,readPublic,allowed,analyze,internalPages,pageRecommendations} from './lib/visibility.mjs';
import {googleReviews} from './lib/google-places.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const technicalError=(error,t)=>{
  const message=String(error?.message||'');
  if(/for stor|meget stor/i.test(message))return t('fetchLarge');
  if(/tidsgrænsen|timeout|timed out/i.test(message))return t('fetchTimeout');
  if(/403|forbidden|access denied|blocked/i.test(message))return t('fetchBlocked');
  if(/offentligt tilgængelig|private/i.test(message))return t('fetchPrivate');
  if(/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(message))return t('fetchDns');
  return t('fetchFailed');
};
export default async req=>{
  let locale=language((req.headers.get('accept-language')||'da').split(/[-,;]/)[0]),t=translator(locale);
  if(req.method!=='POST')return json({error:t('method')},405);
  try{
    const raw=await req.text();if(raw.length>6000)return json({error:t('large')},413);
    const input=JSON.parse(raw);locale=language(input.locale||locale);t=translator(locale);const url=normalize(input.url);
    const submittedUrl=url.href;
    const profile=Object.fromEntries(['company','offering','market','desired'].map(k=>[k,String(input[k]||'').trim().slice(0,400)]));
    let robots=await readPublic(new URL('/robots.txt',url)).catch(()=>null);
    if(robots?.status===200 && !allowed(robots.text,'WalthamVisibilityCheck',url.pathname+url.search))return json({error:t('blocked')},422);
    const page=await readPublic(url);
    if(page.status===403 || page.status===406 || page.status===429)return json({error:t('fetchBlocked')},422);
    if(page.status!==200 || !/text\/html|application\/xhtml\+xml/i.test(page.headers['content-type']||''))return json({error:t('notHtml')},422);
    if(new URL(page.url).origin!==url.origin)robots=await readPublic(new URL('/robots.txt',page.url)).catch(()=>null);
    const declared=robots?.status===200?robots.text.match(/^\s*sitemap:\s*(https?:\/\/\S+)/im)?.[1]:null;
    const sitemapUrl=declared||new URL('/sitemap.xml',page.url).href;
    const sitemap=await readPublic(sitemapUrl).catch(()=>null);
    const report=analyze({page,robots,sitemap,profile,submittedUrl});
    const candidates=internalPages(page.text,page.url,3);
    const extra=await Promise.all(candidates.map(async candidate=>{
      if(robots?.status===200 && !allowed(robots.text,'WalthamVisibilityCheck',new URL(candidate).pathname))return null;
      try{const result=await readPublic(candidate);return result.status===200 && new URL(result.url).origin===new URL(page.url).origin && /text\/html|application\/xhtml\+xml/i.test(result.headers['content-type']||'')?result:null;}catch{return null;}
    }));
    report.pages=[page,...extra.filter(Boolean)].map(p=>pageRecommendations(p,profile));
    report.google={searchCrawlerAllowed:report.bots.Googlebot,indexable:report.checks.find(c=>c.id==='indexable')?.pass??null,reviewsCount:null,reviewsRating:null,reviewsUrl:null,aiMentionsCount:null,searchPresence:null};
    const place=await googleReviews({name:profile.company||report.impression.identity,siteUrl:page.url,key:process.env.GOOGLE_PLACES_API_KEY});
    if(place){report.google.reviewsCount=place.count;report.google.reviewsRating=place.rating;report.google.reviewsUrl=place.url;}
    return json(localizeReport(report,locale,profile));
  }catch(error){return json({error:error instanceof SyntaxError?t('failed'):technicalError(error,t)},error instanceof SyntaxError?400:422);}
};
export const config={path:'/api/ai-visibility',rateLimit:{windowLimit:5,windowSize:180,aggregateBy:['ip','domain']}};
