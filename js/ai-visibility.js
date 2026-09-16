(()=>{
const $=s=>document.querySelector(s), form=$('#check'), status=$('#status'), results=$('#results'); let report;
const text=(selector,value)=>$(selector).textContent=value;
const list=(selector,items)=>$(selector).replaceChildren(...items.map(value=>{const li=document.createElement('li');li.textContent=value;return li;}));
const header=$('.site-header'),menu=$('#menu'),menuButton=$('.menu-button');
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30));
menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));
form.addEventListener('submit',async event=>{
 event.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;results.hidden=true;status.className='';status.textContent='Vi undersøger hjemmesiden og dens adgangsregler …';form.setAttribute('aria-busy','true');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
 try{
  const response=await fetch('/api/ai-visibility',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:controller.signal});
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Analysetjenesten er ikke tilgængelig på denne visning. Åbn siden på en server med Walthams analysefunktion.');
  const data=await response.json();if(!response.ok)throw new Error(response.status===429?'Der er kø ved tjekket. Vent tre minutter og prøv igen.':data.error||'Tjekket kunne ikke gennemføres.');report=data;
  text('#result-domain',`${new URL(data.url).hostname} · ${new Date(data.checkedAt).toLocaleString('da-DK')}`);
  text('#score',data.score.toLocaleString('da-DK'));text('#score-summary',data.summary);text('#risk',data.risk);text('#coverage',`Datadækning: ${data.coverage} % af den fulde model. Risikoen gælder kun de målte dele.`);
  const failed=data.checks.filter(c=>c.pass===false),unknown=data.checks.filter(c=>c.pass===null);
  list('#actions',[...failed.map(c=>c.action),...unknown.map(c=>`Få afklaret: ${c.label.toLowerCase()}.`),'Undersøg faktiske AI-svar på relevante kundespørgsmål.'].slice(0,3));
  for(const area of ['access','understanding']){const checks=data.checks.filter(c=>c.area===area);text(`#${area}-summary`,`${checks.filter(c=>c.pass===true).length} af ${checks.length} signaler bekræftet. ${checks.filter(c=>c.pass===null).length? 'Nogle forhold kunne ikke måles.':'Se fundene nedenfor for forklaring og næste skridt.'}`);}
  text('#observed',data.perception.observed);text('#perception-status',data.perception.status);
  list('#perception',data.perception.comparisons.map(c=>`${c.term}: ${c.found?'findes i sidens tekst':'ikke fundet i den undersøgte tekst'}.`));list('#questions',data.presence.questions);list('#limitations',data.limitations);
  $('#findings').replaceChildren(...data.checks.map(c=>{const article=document.createElement('article');article.className='finding';const h=document.createElement('strong');h.textContent=`${c.pass===null?'Ikke målt':c.pass?'Bekræftet':'Se nærmere'} · ${c.label}`;const p=document.createElement('p');p.textContent=c.evidence;article.append(h,p);return article;}));
  status.textContent='Førstetjekket er klar.';results.hidden=false;results.focus();results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(error){status.className='error';status.textContent=error.name==='AbortError'?'Tjekket tog for lang tid. Prøv igen senere.':error.message;}
 finally{clearTimeout(timer);button.disabled=false;form.removeAttribute('aria-busy');}
});
$('#download').addEventListener('click',()=>{if(!report)return;const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='waltham-ai-visibility.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})();
