import {language,translator} from './visibility-copy.mjs';
(()=>{
const locale=language(document.documentElement.lang),t=translator(locale),formats={da:'da-DK',nb:'nb-NO',en:'en-GB',de:'de-DE'};
const $=s=>document.querySelector(s),form=$('#check'),status=$('#status'),results=$('#results');let report;
const text=(selector,value)=>$(selector).textContent=value;
const list=(selector,items)=>$(selector).replaceChildren(...items.map(value=>{const li=document.createElement('li');li.textContent=value;return li;}));
const hostLabel=data=>{const finalHost=new URL(data.url).hostname;const submittedHost=new URL(data.submittedUrl||data.url).hostname;return submittedHost===finalHost?finalHost:`${submittedHost} → ${finalHost}`;};
const header=$('.site-header'),menu=$('#menu'),menuButton=$('.menu-button');
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30));
menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));
form.addEventListener('submit',async event=>{
 event.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;results.hidden=true;status.className='';status.textContent=t('loading');form.setAttribute('aria-busy','true');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
 try{
  const response=await fetch('/api/ai-visibility',{method:'POST',headers:{'content-type':'application/json','accept-language':locale},body:JSON.stringify({...Object.fromEntries(new FormData(form)),locale}),signal:controller.signal});
  if(response.status===429)throw new Error(t('queue'));
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error(t('unavailable'));
  const data=await response.json();if(!response.ok)throw new Error(data.error||t('failed'));report=data;
  text('#result-domain',`${hostLabel(data)} · ${new Date(data.checkedAt).toLocaleString(formats[locale])}`);
  text('#score',data.score.toLocaleString(formats[locale]));text('#score-status',data.scoreStatus);text('#score-summary',data.summary);text('#risk',data.riskLabel||t(data.risk));text('#coverage',t('coverage',data));
  const failed=data.checks.filter(c=>c.pass===false),unknown=data.checks.filter(c=>c.pass===null);
  list('#actions',[...failed.map(c=>c.action),...unknown.map(c=>t('clarify',{label:c.label})),t('presenceAction')].slice(0,3));
  for(const area of ['access','understanding']){const checks=data.checks.filter(c=>c.area===area);text(`#${area}-summary`,t('confirmedCount',{passed:checks.filter(c=>c.pass===true).length,total:checks.length})+' '+t(checks.some(c=>c.pass===null)?'someUnknown':'seeFindings'));}
  text('#observed',data.perception.observed);text('#perception-status',data.perception.status+' · '+t('sourceNote'));
  list('#perception',data.perception.comparisons.map(c=>`${c.term}: ${t(c.found?'found':'notFound')}.`));list('#questions',data.presence.questions);list('#limitations',data.limitations);
  $('#findings').replaceChildren(...data.checks.map(c=>{const article=document.createElement('article');article.className='finding';const h=document.createElement('strong');h.textContent=`${t(c.pass===null?'unknown':c.pass?'confirmed':'review')} · ${c.label}`;const p=document.createElement('p');p.textContent=c.evidence;article.append(h,p);return article;}));
  status.textContent=t('ready');results.hidden=false;results.focus();results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(error){status.className='error';status.textContent=error.name==='AbortError'?t('timeout'):error instanceof TypeError?t('failed'):error.message;}
 finally{clearTimeout(timer);button.disabled=false;form.removeAttribute('aria-busy');}
});
$('#download').addEventListener('click',()=>{if(!report)return;const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`waltham-ai-visibility-${locale}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})();
