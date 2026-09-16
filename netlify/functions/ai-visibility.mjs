import {language,translator} from '../../js/visibility-copy.mjs';
import {localizeReport} from './lib/visibility-locale.mjs';
import {normalize,readPublic,allowed,analyze} from './lib/visibility.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export default async req=>{
  let locale=language((req.headers.get('accept-language')||'da').split(/[-,;]/)[0]),t=translator(locale);
  if(req.method!=='POST')return json({error:t('method')},405);
  try{
    const raw=await req.text();if(raw.length>6000)return json({error:t('large')},413);
    const input=JSON.parse(raw);locale=language(input.locale||locale);t=translator(locale);const url=normalize(input.url);
    const profile=Object.fromEntries(['company','offering','market','desired'].map(k=>[k,String(input[k]||'').trim().slice(0,400)]));
    let robots=await readPublic(new URL('/robots.txt',url)).catch(()=>null);
    if(robots?.status===200 && !allowed(robots.text,'WalthamVisibilityCheck',url.pathname+url.search))return json({error:t('blocked')},422);
    const page=await readPublic(url);
    if(page.status!==200 || !/text\/html|application\/xhtml\+xml/i.test(page.headers['content-type']||''))return json({error:t('notHtml')},422);
    if(new URL(page.url).origin!==url.origin)robots=await readPublic(new URL('/robots.txt',page.url)).catch(()=>null);
    const declared=robots?.status===200?robots.text.match(/^\s*sitemap:\s*(https?:\/\/\S+)/im)?.[1]:null;
    const sitemapUrl=declared||new URL('/sitemap.xml',page.url).href;
    const sitemap=await readPublic(sitemapUrl).catch(()=>null);
    return json(localizeReport(analyze({page,robots,sitemap,profile}),locale,profile));
  }catch{return json({error:t('failed')},400);}
};
export const config={path:'/api/ai-visibility',rateLimit:{windowLimit:5,windowSize:180,aggregateBy:['ip','domain']}};
