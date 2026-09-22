import {language,translator} from './visibility-copy.mjs';
(()=>{
const locale=language(document.documentElement.lang),t=translator(locale),formats={da:'da-DK',nb:'nb-NO',en:'en-GB',de:'de-DE'};
const $=s=>document.querySelector(s),form=$('#check'),status=$('#status'),results=$('#results');let report;
const text=(selector,value)=>$(selector).textContent=value;
const list=(selector,items)=>$(selector).replaceChildren(...items.map(value=>{const li=document.createElement('li');li.textContent=value;return li;}));
const hostLabel=data=>{const finalHost=new URL(data.url).hostname;const submittedHost=new URL(data.submittedUrl||data.url).hostname;return submittedHost===finalHost?finalHost:`${submittedHost} → ${finalHost}`;};
const impressionCopy={
 da:{identity:'Afsender',message:'Hovedbudskab',offers:'Mulige tilbud',questions:'Det er stadig uklart',desired:'Ønsket billede',none:'Ikke tydeligt på den undersøgte side',visible:'står på siden',unverified:'ikke dokumenteret med samme ord',identityQ:'Hvilken virksomhed står bag?',descriptionQ:'Hvad tilbyder virksomheden konkret?',offerQ:'Hvad kan en kunde købe?',priorityQ:'Flere retninger vises; hvad er det vigtigste tilbud?',source:'Se ordlyden på siden'},
 nb:{identity:'Avsender',message:'Hovedbudskap',offers:'Mulige tilbud',questions:'Dette er fortsatt uklart',desired:'Ønsket inntrykk',none:'Ikke tydelig på den undersøkte siden',visible:'står på siden',unverified:'ikke dokumentert med samme ord',identityQ:'Hvilken virksomhet står bak?',descriptionQ:'Hva tilbyr virksomheten konkret?',offerQ:'Hva kan en kunde kjøpe?',priorityQ:'Flere retninger vises; hva er hovedtilbudet?',source:'Se ordlyden på siden'},
 en:{identity:'Sender',message:'Main message',offers:'Possible offerings',questions:'Still unclear',desired:'Desired impression',none:'Not clear on the page examined',visible:'appears on the page',unverified:'not evidenced in the same words',identityQ:'Which business is behind the site?',descriptionQ:'What does the business actually offer?',offerQ:'What can a customer buy?',priorityQ:'Several directions appear; which offer matters most?',source:'Read the page wording'},
 de:{identity:'Absender',message:'Hauptbotschaft',offers:'Mögliche Angebote',questions:'Weiterhin unklar',desired:'Gewünschtes Bild',none:'Auf der untersuchten Seite nicht deutlich',visible:'steht auf der Seite',unverified:'nicht mit denselben Worten belegt',identityQ:'Welches Unternehmen steht dahinter?',descriptionQ:'Was bietet das Unternehmen konkret an?',offerQ:'Was kann ein Kunde kaufen?',priorityQ:'Mehrere Richtungen werden genannt; welches Angebot ist zentral?',source:'Wortlaut auf der Seite ansehen'}
}[locale];
const v2Copy={
 da:{yes:'Ja',no:'Nej',unknown:'Ikke verificeret',none:'Ingen automatiske opgaver på denne side',title:'Skriv en entydig sidetitel',description:'Skriv en konkret sidebeskrivelse til søgeresultater',heading:'Tilføj en tydelig hovedoverskrift',contact:'Gør kontaktvejen tydelig på siden',desired:'Gennemgå, om det ønskede billede faktisk formidles',priorityOffer:'Vis hvilket tilbud der er vigtigst for kunden',priority:'Prioritet',reviews:'anmeldelser',source:'Se hos Google'},
 nb:{yes:'Ja',no:'Nei',unknown:'Ikke verifisert',none:'Ingen automatiske oppgaver på denne siden',title:'Skriv en entydig sidetittel',description:'Skriv en konkret sidebeskrivelse for søkeresultater',heading:'Legg til en tydelig hovedoverskrift',contact:'Gjør kontaktveien tydelig på siden',desired:'Gå gjennom om det ønskede inntrykket faktisk formidles',priorityOffer:'Vis hvilket tilbud som er viktigst for kunden',priority:'Prioritet',reviews:'anmeldelser',source:'Se hos Google'},
 en:{yes:'Yes',no:'No',unknown:'Not verified',none:'No automatic tasks for this page',title:'Write a distinct page title',description:'Write a concrete search description',heading:'Add a clear main heading',contact:'Make the contact path clear on this page',desired:'Review whether the desired impression is conveyed',priorityOffer:'Show which offer matters most to the customer',priority:'Priority',reviews:'reviews',source:'View on Google'},
 de:{yes:'Ja',no:'Nein',unknown:'Nicht bestätigt',none:'Keine automatischen Aufgaben für diese Seite',title:'Eindeutigen Seitentitel schreiben',description:'Konkrete Suchbeschreibung schreiben',heading:'Klare Hauptüberschrift ergänzen',contact:'Kontaktweg auf der Seite verdeutlichen',desired:'Prüfen, ob das gewünschte Bild vermittelt wird',priorityOffer:'Das wichtigste Angebot für Kunden hervorheben',priority:'Priorität',reviews:'Bewertungen',source:'Bei Google ansehen'}
}[locale];
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
  list('#questions',data.presence.questions);list('#limitations',data.limitations);
  const impression=data.impression;
  text('#impression-identity',impression.identity||impressionCopy.none);
  text('#impression-message',impression.mainMessage||impressionCopy.none);
  text('#impression-opening',impression.openingText||impressionCopy.none);
  list('#impression-offers',impression.offerCandidates.length?impression.offerCandidates:[impressionCopy.none]);
  const questionKeys={identity:'identityQ',description:'descriptionQ',offer:'offerQ',priority:'priorityQ'};
  list('#impression-questions',impression.questions.length?impression.questions.map(q=>impressionCopy[questionKeys[q]]):[impressionCopy.none]);
  list('#impression-desired',impression.desired.length?impression.desired.map(x=>`${x.term}: ${impressionCopy[x.status]}`):[impressionCopy.none]);
  const source=$('#impression-source');source.href=data.url;source.textContent=impressionCopy.source;
  const measured=value=>value===null?v2Copy.unknown:value?v2Copy.yes:v2Copy.no;
  text('#google-crawler',measured(data.google.searchCrawlerAllowed));text('#google-indexable',measured(data.google.indexable));
  const reviewNode=$('#google-reviews');reviewNode.textContent=data.google.reviewsCount===null?v2Copy.unknown:`${data.google.reviewsCount} ${v2Copy.reviews}${data.google.reviewsRating===null?'':` · ${data.google.reviewsRating.toLocaleString(formats[locale])}/5`}`;
  if(data.google.reviewsUrl){const link=document.createElement('a');link.href=data.google.reviewsUrl;link.target='_blank';link.rel='noopener noreferrer';link.textContent=v2Copy.source;reviewNode.append(' · ',link);}
  for(const id of ['ai','search'])text(`#google-${id}`,v2Copy.unknown);
  $('#page-action-list').replaceChildren(...data.pages.map(page=>{
    const article=document.createElement('article'),heading=document.createElement('h4'),link=document.createElement('a'),ol=document.createElement('ol');
    link.href=page.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=page.title;heading.append(link);
    for(const task of page.tasks){const li=document.createElement('li');li.textContent=`${v2Copy.priority} ${task.priority}: ${v2Copy[task.code]}`;ol.append(li);}
    if(!page.tasks.length){const p=document.createElement('p');p.textContent=v2Copy.none;article.append(heading,p);}else article.append(heading,ol);
    return article;
  }));
  $('#findings').replaceChildren(...data.checks.map(c=>{const article=document.createElement('article');article.className='finding';const h=document.createElement('strong');h.textContent=`${t(c.pass===null?'unknown':c.pass?'confirmed':'review')} · ${c.label}`;const p=document.createElement('p');p.textContent=c.evidence;article.append(h,p);return article;}));
  status.textContent=t('ready');results.hidden=false;results.focus();results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(error){status.className='error';status.textContent=error.name==='AbortError'?t('timeout'):error instanceof TypeError?t('failed'):error.message;}
 finally{clearTimeout(timer);button.disabled=false;form.removeAttribute('aria-busy');}
});
$('#download').addEventListener('click',()=>{if(!report)return;const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`waltham-ai-visibility-${locale}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})();
