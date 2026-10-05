import {visibilityCopy,mentionCopy} from './person-visibility-copy.mjs';
const form=document.querySelector('#reputation-check'),status=document.querySelector('#reputation-status'),results=document.querySelector('#reputation-results'),answer=document.querySelector('#reputation-answer'),assessment=document.querySelector('#visibility-assessment');
const copy={...(visibilityCopy[document.documentElement.lang]||visibilityCopy.nb),...(mentionCopy[document.documentElement.lang]||mentionCopy.nb)};
const header=document.querySelector('.site-header'),menu=document.querySelector('#menu'),menuButton=document.querySelector('.menu-button');
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30));
menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));
const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const sourceLink=(url,title)=>{const link=element('a',title);link.href=url;link.target='_blank';link.rel='noopener noreferrer';return link;};
function showReport(data){
 const visibility=element('article',undefined,'person-metric'),profile=element('article',undefined,'person-metric');
 visibility.append(element('p',copy.visibility,'label'),element('p',data.score===null?'—':`${data.score} / 10`,'person-score'),element('h3',data.score===null?copy.pending:data.score>=8?copy.high:data.score>=5?copy.medium:copy.low),element('p',`${data.domainCount} ${copy.count}`));
 if(data.score===null)visibility.append(element('p',copy.ambiguity,'muted'));
 profile.append(element('p',copy.profile,'label'),element('h3',data.profile?.label||copy.none),element('p',copy[data.profileStatus]||copy.unclear,'profile-certainty'));
 if(data.profile){profile.append(element('p',data.profile.description),element('p',copy.sources,'label'));const links=element('ul');for(const url of data.profile.sources){const li=element('li');li.append(sourceLink(url,new URL(url).hostname));links.append(li);}profile.append(links);}
 const method=element('details',undefined,'person-method');method.append(element('summary',copy.methodTitle),element('p',copy.method));assessment.replaceChildren(visibility,profile,method);
 answer.append(element('h2',copy.mentionsTitle),element('p',`${data.mentionCount||0} ${copy.mentionCount} · ${data.ownCount||0} ${copy.ownCount}`),element('p',copy.scope,'muted'));
 const controls=element('div',undefined,'mention-filters'),list=element('div'),empty=element('p',copy.noFiltered);
 const kinds={profile:copy.profileKind,article:copy.article,social:copy.social,podcast:copy.podcast,event:copy.event,register:copy.register,other:copy.other};
 const filter=(labelText,options)=>{const label=element('label',labelText),select=element('select');for(const [value,text] of options){const option=element('option',text);option.value=value;select.append(option);}label.append(select);controls.append(label);return select;};
 const kindFilter=filter(copy.filterKind,[['all',copy.all],...Object.entries(kinds)]),ownerFilter=filter(copy.filterOwner,[['all',copy.all],...['third_party','own','unknown'].map(key=>[key,copy[key]])]);
 answer.append(controls,list);
 const renderFindings=()=>{
  list.replaceChildren();
  const selected=data.findings.filter(f=>(kindFilter.value==='all'||f.kind===kindFilter.value)&&(ownerFilter.value==='all'||f.ownership===ownerFilter.value));
  if(!selected.length){list.append(empty);return;}
  for(const finding of selected){const article=element('article',undefined,'person-finding'),heading=element('h3');heading.append(sourceLink(finding.url,finding.title));article.append(element('p',`${kinds[finding.kind]||copy.other} · ${copy[finding.ownership]||copy.unknown} · ${copy[finding.match]}`,'label'),heading,element('p',new URL(finding.url).hostname,'muted'),element('p',finding.publishedAt?`${copy.published}: ${finding.publishedAt}`:copy.dateUnknown,'muted'),element('p',finding.observation));if(finding.identityEvidence)article.append(element('p',`${copy.evidence}: ${finding.identityEvidence}`,'muted'));list.append(article);}
 };
 kindFilter.addEventListener('change',renderFindings);ownerFilter.addEventListener('change',renderFindings);renderFindings();
}
form.addEventListener('submit',async event=>{
 event.preventDefault();
 const button=form.querySelector('[type=submit]');button.disabled=true;form.setAttribute('aria-busy','true');results.hidden=true;answer.replaceChildren();assessment.replaceChildren();status.textContent=status.dataset.loading;
 try {
  const response=await fetch('/api/digital-reputation',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:form.elements.name.value,context:form.elements.context.value,criteria:Object.fromEntries(['aliases','places','organizations','roles','usernames','websites','topics','period'].map(key=>[key,form.elements[key].value])),self:form.elements.self.checked,locale:document.documentElement.lang}),signal:AbortSignal.timeout(65000)});
  if(response.status===503){status.textContent=status.dataset.unavailable;return;}
  if(!response.ok)throw new Error('unavailable');
  const data=await response.json();showReport(data);
  status.textContent='';results.hidden=false;results.focus();results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch{status.textContent=status.dataset.error;}
 finally{button.disabled=false;form.removeAttribute('aria-busy');}
});
