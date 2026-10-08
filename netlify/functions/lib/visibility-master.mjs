// Waltham masterlist v1.3, recovered from the documented 7 October 2026 review.
export const METHOD_VERSION='1.3';
export const CHECKPOINTS=Object.freeze([
  ['readable',8,'access'],['crawlers',6,'access'],['indexable',6,'access'],['sitemap',3,'access'],
  ['identity',6,'understanding'],['offering',6,'understanding'],['market',5,'understanding'],
  ['expertise',7,'understanding'],['people',4,'understanding'],['history',4,'understanding'],
  ['answers',7,'content'],['entity',4,'content'],['cases',7,'content'],['reputation',6,'content'],
  ['consistency',5,'content'],['presence',8,'presence'],['accuracy',5,'presence'],['position',3,'presence']
].map(([id,weight,area],i)=>Object.freeze({id,checkpointId:String(i+1).padStart(2,'0'),weight,area})));

export function calculateScore(checks,{panelComplete=false}={}){
  if(checks.length!==CHECKPOINTS.length||CHECKPOINTS.some(def=>checks.filter(c=>c.id===def.id&&c.weight===def.weight).length!==1))throw new Error('All 18 fixed checkpoint weights are required.');
  if(checks.some(c=>c.fulfillment!==null&&(!Number.isFinite(c.fulfillment)||c.fulfillment<0||c.fulfillment>4)))throw new Error('Invalid checkpoint rating.');
  const relevant=checks.filter(c=>c.status!=='not_relevant');
  const measured=relevant.filter(c=>Number.isFinite(c.fulfillment));
  const relevantWeight=relevant.reduce((sum,c)=>sum+c.weight,0);
  const measuredWeight=measured.reduce((sum,c)=>sum+c.weight,0);
  const earned=measured.reduce((sum,c)=>sum+c.weight*c.fulfillment/4,0);
  const score=measuredWeight?Math.round(100*earned/measuredWeight):null;
  return {score,coverage:relevantWeight?Math.round(100*measuredWeight/relevantWeight):null,
    measuredWeight,relevantWeight,earned,scoreScale:100,methodVersion:METHOD_VERSION,
    scoreComplete:relevantWeight>0&&measuredWeight===relevantWeight&&panelComplete,
    risk:score===null?'Unknown':score<40?'High':score<70?'Medium':'Low'};
}

export function finalizeScore(report){
  report.checks=report.checks.map(c=>({...c,pointContribution:c.fulfillment===null?null:c.weight*c.fulfillment/4,
    pass:c.fulfillment===null?null:c.fulfillment===4?true:c.fulfillment===0?false:null,
    status:c.status==='not_relevant'?'not_relevant':c.fulfillment===null?'not_examined':c.fulfillment===4?'fulfilled':c.fulfillment===0?'not_fulfilled':'partial'}));
  Object.assign(report,calculateScore(report.checks,{panelComplete:report.aiPanel?.complete===true}));
  report.scoreStatus=report.scoreComplete?'Færdig':'Foreløbig';
  report.criticalFindings=report.checks.filter(c=>c.priority===1&&c.fulfillment!==null&&c.fulfillment<2).map(c=>c.checkpointId);
  return report;
}

const validUrl=value=>{try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}};
const dateValid=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));

// Deliberately separate from public form input. A reviewed observation needs concrete evidence.
export function applyReviewedEvidence(report,observations,{aiPanel,sourceReviews=[]}={}){
  const result=structuredClone(report);
  for(const review of sourceReviews){
    if(!SOURCE_GROUPS.some(([group])=>group===review.group)||!validUrl(review.url)||!dateValid(review.date)||!review.observation?.trim()||!review.meaning?.trim()||!review.checkpointIds?.length||!review.checkpointIds.every(id=>CHECKPOINTS.some(c=>c.checkpointId===id)))throw new Error('Reviewed sources require a source group, URL, date, checkpoint IDs, observation and meaning.');
    const existing=result.sources.find(s=>s.group===review.group&&(s.url===review.url||s.url===null));
    const row={group:review.group,url:review.url,date:review.date,checkpointIds:review.checkpointIds,observation:review.observation,meaning:review.meaning,recommendation:review.recommendation||null,status:'verified'};
    if(existing)Object.assign(existing,row);else result.sources.push(row);
  }
  if(aiPanel){
    if(!Array.isArray(aiPanel.plannedQuestions)||!aiPanel.plannedQuestions.length||!Array.isArray(aiPanel.responses))throw new Error('A pre-defined AI test panel is required.');
    const keys=new Set();
    for(const response of aiPanel.responses){
      if(!aiPanel.plannedQuestions.includes(response.question)||!response.service||!response.model||!dateValid(response.date)||!response.searchMode||!response.runId)throw new Error('Incomplete AI test metadata.');
      const key=JSON.stringify([response.question,response.service,response.model,response.runId]);
      if(keys.has(key))throw new Error('Duplicate AI test response.');keys.add(key);
      if(response.valid!==false&&(!response.answer||typeof response.correctMention!=='boolean'))throw new Error('Valid AI responses require saved answers and reviewed mentions.');
    }
    const valid=aiPanel.responses.filter(r=>r.valid!==false);
    if(!Number.isInteger(aiPanel.plannedCount)||aiPanel.plannedCount<1||aiPanel.plannedCount<aiPanel.responses.length)throw new Error('Invalid planned test count.');
    result.aiPanel={...aiPanel,validCount:valid.length,mentionCount:valid.filter(r=>r.correctMention).length,complete:valid.length===aiPanel.plannedCount};
    const checkpoint=result.checks.find(c=>c.id==='presence');
    checkpoint.fulfillment=valid.length?4*result.aiPanel.mentionCount/valid.length:null;
    checkpoint.evidence=`${result.aiPanel.mentionCount}/${valid.length} relevante, korrekte omtaler; ${aiPanel.plannedCount} planlagte testsvar.`;
    checkpoint.evidenceKey=null;checkpoint.sources=valid.flatMap(r=>(r.sources||[]).filter(validUrl));
    checkpoint.scope='documented-ai-panel';
  }
  const seen=new Set();
  for(const observation of observations){
    const checkpoint=result.checks.find(c=>c.checkpointId===observation.checkpointId);
    if(!checkpoint||checkpoint.id==='presence'||seen.has(checkpoint.id))throw new Error('Unknown, duplicate or panel-only checkpoint.');
    seen.add(checkpoint.id);
    if(observation.status==='not_relevant'){
      if(!observation.reason?.trim())throw new Error('Not relevant requires a reason.');
      Object.assign(checkpoint,{status:'not_relevant',fulfillment:null,evidence:observation.reason,evidenceKey:null});continue;
    }
    if(!Number.isInteger(observation.fulfillment)||observation.fulfillment<0||observation.fulfillment>4||!observation.evidence?.trim()||!observation.sources?.length||!observation.sources.every(validUrl)||!dateValid(observation.date))throw new Error('Reviewed checkpoints require rating 0–4, observation, source URLs and date.');
    if(checkpoint.id==='position'&&!observation.positionThemes?.length)throw new Error('Position requires previously documented themes.');
    Object.assign(checkpoint,{status:'reviewed',fulfillment:observation.fulfillment,evidence:observation.evidence,sources:observation.sources,date:observation.date,
      priority:[1,2,3].includes(observation.priority)?observation.priority:checkpoint.priority,
      positionThemes:observation.positionThemes,evidenceKey:null,scope:'reviewed-evidence'});
  }
  return finalizeScore(result);
}

export const SOURCE_GROUPS=Object.freeze([
  ['linkedin_company',['09','14','15']],['linkedin_person',['09','10']],
  ['facebook_company',['14','15']],['facebook_public',['09','10','14']],
  ['google_maps',['05','07','14','15']],['reviews',['14','15']],
  ['registers',['05','09','15']],['professional',['08','10','14']],
  ['media',['14']],['customers',['08','13','14']]
]);
export function sourceInventory(pages,date){
  const links=[];
  for(const page of pages)for(const match of page.text.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)){
    try{const url=new URL(match[1].replace(/&amp;/g,'&'),page.url);if(!validUrl(url.href)||url.username||url.password)continue;links.push({url:url.href,foundOn:page.url});}catch{}
  }
  return SOURCE_GROUPS.flatMap(([group,checkpointIds])=>{
    const matches=links.filter(({url})=>{
      const u=new URL(url),host=u.hostname.replace(/^www\./,'');
      if(group==='linkedin_company')return host==='linkedin.com'&&u.pathname.startsWith('/company/');
      if(group==='linkedin_person')return host==='linkedin.com'&&u.pathname.startsWith('/in/');
      if(group==='facebook_company')return host==='facebook.com'||host==='fb.com';
      if(group==='google_maps')return (host==='google.com'&&u.pathname.startsWith('/maps'))||host==='maps.google.com'||host==='maps.app.goo.gl';
      if(group==='reviews')return host==='trustpilot.com'||host.endsWith('.trustpilot.com');
      if(group==='registers')return ['virk.dk','datacvr.virk.dk','proff.dk','proff.no','brreg.no'].includes(host);
      return false;
    });
    const unique=[...new Map(matches.map(link=>[link.url,link])).values()];
    return unique.length?unique.map(link=>({group,checkpointIds,...link,status:'found_unread',date,observation:null,meaning:null,recommendation:null})): [{group,checkpointIds,url:null,status:'not_examined',date,observation:null,meaning:null,recommendation:null}];
  });
}
