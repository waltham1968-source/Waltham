const form=document.querySelector('#reputation-check'),status=document.querySelector('#reputation-status'),results=document.querySelector('#reputation-results'),answer=document.querySelector('#reputation-answer');
const header=document.querySelector('.site-header'),menu=document.querySelector('#menu'),menuButton=document.querySelector('.menu-button');
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30));
menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));
form.addEventListener('submit',async event=>{
 event.preventDefault();
 const button=form.querySelector('[type=submit]');button.disabled=true;form.setAttribute('aria-busy','true');results.hidden=true;answer.replaceChildren();status.textContent=status.dataset.loading;
 try {
  const response=await fetch('/api/digital-reputation',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:form.elements.name.value,context:form.elements.context.value,self:form.elements.self.checked,locale:document.documentElement.lang}),signal:AbortSignal.timeout(65000)});
  if(response.status===503){status.textContent=status.dataset.unavailable;return;}
  if(!response.ok)throw new Error('unavailable');
  const data=await response.json();
  if(!data.blocks?.length){status.textContent=status.dataset.empty;return;}
  for(const block of data.blocks){
   const paragraph=document.createElement('div');paragraph.className='reputation-block';let offset=0;
   for(const citation of block.citations){
    if(citation.start<offset)continue;
    paragraph.append(document.createTextNode(block.text.slice(offset,citation.start)));
    const link=document.createElement('a');link.href=citation.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=`[${citation.title}]`;paragraph.append(link);offset=citation.end;
   }
   paragraph.append(document.createTextNode(block.text.slice(offset)));answer.append(paragraph);
  }
  status.textContent='';results.hidden=false;results.focus();results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch{status.textContent=status.dataset.error;}
 finally{button.disabled=false;form.removeAttribute('aria-busy');}
});
