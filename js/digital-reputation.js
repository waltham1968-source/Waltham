import {visibilityCopy} from './person-visibility-copy.mjs';
const form=document.querySelector('#reputation-check'),status=document.querySelector('#reputation-status'),results=document.querySelector('#reputation-results'),answer=document.querySelector('#reputation-answer'),assessment=document.querySelector('#visibility-assessment');
const copy=visibilityCopy[document.documentElement.lang]||visibilityCopy.nb;
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
 if(!data.findings.length)answer.append(element('p',copy.zero));
 for(const finding of data.findings){const article=element('article',undefined,'person-finding'),heading=element('h3');heading.append(sourceLink(finding.url,finding.title));article.append(element('p',copy[finding.match],'label'),heading,element('p',finding.observation));if(finding.identityEvidence)article.append(element('p',`${copy.evidence}: ${finding.identityEvidence}`,'muted'));answer.append(article);}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();
 const button=form.querySelector('[type=submit]');button.disabled=true;form.setAttribute('aria-busy','true');results.hidden=true;answer.replaceChildren();assessment.replaceChildren();status.textContent=status.dataset.loading;
 try {
  const response=await fetch('/api/digital-reputation',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:form.elements.name.value,context:form.elements.context.value,self:form.elements.self.checked,locale:document.documentElement.lang}),signal:AbortSignal.timeout(65000)});
  if(response.status===503){status.textContent=status.dataset.unavailable;return;}
  if(!response.ok)throw new Error('unavailable');
  const data=await response.json();showReport(data);
  status.textContent='';results.hidden=false;results.focus();results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch{status.textContent=status.dataset.error;}
 finally{button.disabled=false;form.removeAttribute('aria-busy');}
});
