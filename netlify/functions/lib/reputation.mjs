export function validatePerson(input) {
  const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
  const context = typeof input.context === 'string' ? input.context.trim() : '';
  if (input.self !== true || name.length < 3 || name.length > 120 || !/^[\p{L}\p{M} .’'\-]+$/u.test(name) || context.length > 120) throw new Error('invalid');
  return {name, context, locale: ['nb','da','en','de'].includes(input.locale) ? input.locale : 'nb'};
}
const sourceUrl = raw => {
  try {
    const url=new URL(raw);
    if(!['https:','http:'].includes(url.protocol)||url.username||url.password)return null;
    url.hash='';return url.href;
  }catch{return null;}
};
export function visibilityScore(count) {
  const thresholds=[0,1,2,3,4,6,8,10,12,15];
  return thresholds.reduce((score,threshold,index)=>count>=threshold?index+1:score,1);
}
export function personVisibilityReport(response, person) {
  if(response.status!=='completed'||!response.output?.some(item=>item.type==='web_search_call'&&item.status==='completed'))throw new Error('incomplete');
  const messages=response.output.filter(item=>item.type==='message').flatMap(item=>item.content||[]).filter(item=>item.type==='output_text');
  const known=new Set();
  for(const item of response.output){
    for(const source of item.type==='web_search_call'?item.action?.sources||[]:[]){const url=sourceUrl(source.url);if(url)known.add(url);}
  }
  for(const message of messages){for(const a of message.annotations||[]){if(a.type==='url_citation'){const url=sourceUrl(a.url);if(url)known.add(url);}}}
  const raw=messages.map(item=>item.text).join('\n').trim().replace(/^```(?:json)?\s*|\s*```$/g,'');
  const parsed=JSON.parse(raw);
  if(!Array.isArray(parsed.findings))throw new Error('invalid report');
  const seen=new Set();
  const findings=parsed.findings.slice(0,30).flatMap(item=>{
    const url=sourceUrl(item.url);
    if(!url||!known.has(url)||seen.has(url)||!['matched','uncertain','namesake'].includes(item.match))return [];
    seen.add(url);
    // A full-name match alone cannot establish that the hit belongs to this user.
    const match=item.match==='matched'&&(!person.context||!String(item.identityEvidence||'').trim())?'uncertain':item.match;
    return [{url,title:String(item.title||new URL(url).hostname).slice(0,250),observation:String(item.observation||'').slice(0,800),match,identityEvidence:String(item.identityEvidence||'').slice(0,500)}];
  });
  if(parsed.findings.length&&!findings.length)throw new Error('unverified sources');
  const matched=findings.filter(item=>item.match==='matched');
  const domainCount=new Set(matched.map(item=>new URL(item.url).hostname.replace(/^www\./,''))).size;
  const ambiguous=!matched.length&&findings.some(item=>item.match==='uncertain');
  // Scores describe the sampled, source-backed footprint, not the entire internet.
  const score=ambiguous?null:visibilityScore(domainCount);
  const profileUrls=(Array.isArray(parsed.profile?.sources)?parsed.profile.sources:[]).map(sourceUrl).filter(url=>matched.some(item=>item.url===url));
  const profile=profileUrls.length&&String(parsed.profile?.label||'').trim()?{
    label:String(parsed.profile.label).slice(0,150),description:String(parsed.profile.description||'').slice(0,600),sources:[...new Set(profileUrls)]
  }:null;
  return {score,domainCount,matchedCount:matched.length,uncertainCount:findings.filter(item=>item.match==='uncertain').length,
    profile,profileStatus:profile?(new Set(profile.sources.map(url=>new URL(url).hostname.replace(/^www\./,''))).size>=2?'corroborated':'limited'):'unclear',findings};
}
