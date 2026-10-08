import {copy,language,translator} from '../../../js/visibility-copy.mjs';
export function localizeReport(report,requested,profile={}) {
  const locale=language(requested),t=translator(locale);
  const r=structuredClone(report);
  r.locale=locale;r.scoreStatus=t(r.scoreComplete?'complete':'preliminary');r.riskLabel=t(r.risk);r.summary=t('summary');
  r.checks=r.checks.map(c=>{
    const original=c.evidence;let evidence=original;
    const staticKey=Object.keys(copy.da).find(k=>k.startsWith(c.id+'.') && !k.endsWith('.label') && !k.endsWith('.action') && copy.da[k]===original);
    if(staticKey)evidence=t(staticKey);
    else if(c.id==='readable')evidence=t('readable.evidence',{count:original.match(/^\d+/)?.[0]||'0'});
    else if(c.id==='crawlers' && c.fulfillment!==null)evidence=original.replace(/\ballowed\b/g,t('allowed')).replace(/\brestricted\b/g,t('restricted'));
    else if(c.id==='identity' && original.startsWith('Virksomhedsnavnet “'))evidence=t('identity.text',{company:profile.company});
    else if(c.id==='market' && original.startsWith('Søgt efter “'))evidence=t('market.search',{market:profile.market});
    if(c.evidenceKey==='master.pending')evidence=t('master.pending');
    else if(c.evidenceKey==='master.signal')evidence=`${evidence} ${t('master.signal')}`;
    else if(c.evidenceKey==='master.readable')evidence=t('master.readable',{count:c.evidence});
    else if(c.evidenceKey==='master.sitemap')evidence=t('master.sitemap',{count:c.evidence});
    else if(c.evidenceKey==='master.sitemapMissing')evidence=t('master.sitemapMissing');
    else if(c.evidenceKey==='master.identity')evidence=`${evidence} ${t('master.identity')}`;
    return {...c,label:t('master.'+c.id+'.label'),action:t('master.'+c.id+'.action'),evidence,statusLabel:t('status.'+c.status)};
  });
  r.sources=r.sources.map(source=>({...source,label:t('source.'+source.group),statusLabel:t('source.'+source.status),
    meaning:source.status==='verified'?(source.googleTotals?t('source.googleTotals'):source.meaning):t('source.meaningPending')}));
  const params={company:profile.company||r.title||t('company'),offering:profile.offering||t('offering'),market:profile.market||t('market')};
  r.presence.status=t('unknown');r.presence.questions=['q1','q2','q3'].map(k=>t(k,params));
  r.perception.status=t(r.perception.comparisons.length?'perceptionMatch':'perceptionMissing');
  r.perception.note=t('perceptionNote');
  r.limitations=['limit1','limit2','limit3','limit4'].map(k=>t(k));
  r.sourceNote=t('sourceNote');
  return r;
}
