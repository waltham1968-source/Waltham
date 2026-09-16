import {copy,language,translator} from '../../../js/visibility-copy.mjs';
export function localizeReport(report,requested,profile={}) {
  const locale=language(requested),t=translator(locale);
  const r=structuredClone(report);
  r.locale=locale;r.scoreStatus=t('preliminary');r.riskLabel=t(r.risk);r.summary=t('summary');
  r.checks=r.checks.map(c=>{
    const original=c.evidence;let evidence=original;
    const staticKey=Object.keys(copy.da).find(k=>k.startsWith(c.id+'.') && !k.endsWith('.label') && !k.endsWith('.action') && copy.da[k]===original);
    if(staticKey)evidence=t(staticKey);
    else if(c.id==='readable')evidence=t('readable.evidence',{count:original.match(/^\d+/)?.[0]||'0'});
    else if(c.id==='crawlers' && c.pass!==null)evidence=Object.entries(r.bots).map(([name,ok])=>`${name}: ${t(ok?'allowed':'restricted')}`).join(' · ');
    else if(c.id==='identity' && original.startsWith('Virksomhedsnavnet “'))evidence=t('identity.text',{company:profile.company});
    else if(c.id==='market' && original.startsWith('Søgt efter “'))evidence=t('market.search',{market:profile.market});
    return {...c,label:t(c.id+'.label'),action:t(c.id+'.action'),evidence};
  });
  const params={company:profile.company||r.title||t('company'),offering:profile.offering||t('offering'),market:profile.market||t('market')};
  r.presence.status=t('unknown');r.presence.questions=['q1','q2','q3'].map(k=>t(k,params));
  r.perception.status=t(r.perception.comparisons.length?'perceptionMatch':'perceptionMissing');
  r.perception.note=t('perceptionNote');
  r.limitations=['limit1','limit2','limit3','limit4'].map(k=>t(k));
  r.sourceNote=t('sourceNote');
  return r;
}
