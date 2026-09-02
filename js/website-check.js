document.querySelectorAll('[data-website-check]').forEach(component=>{
  const form=component.querySelector('form'),input=component.querySelector('input'),analysis=component.querySelector('[data-analysis]'),title=component.querySelector('[data-analysis-title]'),bar=component.querySelector('[data-progress]'),steps=[...component.querySelectorAll('[data-check-step]')],results=component.querySelector('[data-results]'),mail=component.querySelector('[data-mail-cta]'),page=component.dataset.sourcePage||window.location.href;
  const clean=value=>value.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0];
  form.addEventListener('submit',event=>{
    event.preventDefault();const domain=clean(input.value);
    if(!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)){input.setCustomValidity('Skriv en gyldig webadresse, for eksempel virksomhed.dk');input.reportValidity();input.focus();return}
    input.setCustomValidity('');input.value=domain;analysis.classList.add('active');results.classList.remove('visible');steps.forEach(step=>step.classList.remove('done'));bar.style.width='0';title.textContent='Første overblik over '+domain;
    const subject='Waltham | Digital Opportunity Scan: '+domain;
    const body='Hej Waltham,\n\nJeg vil gerne have en indledende vurdering af '+domain+'.\n\nDet vigtigste, hjemmesiden skal skabe, er:\n[Beskriv kort kunde, henvendelse, booking eller salg]\n\nI må gerne kontakte mig for en indledende og uforpligtende afklaring.\n\nJeg henvender mig fra denne side:\n'+page+'\n\nVenlig hilsen\n[Navn / Name]';
    mail.href='mailto:waltham@me.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    steps.forEach((step,index)=>setTimeout(()=>{step.classList.add('done');bar.style.width=((index+1)/steps.length*100)+'%';if(index===steps.length-1)results.classList.add('visible')},350+index*450));analysis.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  input.addEventListener('input',()=>input.setCustomValidity(''));
});
