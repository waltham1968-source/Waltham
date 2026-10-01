export function premiumMailto(value, locale='en') {
 let domain='';
 try {
  const input=String(value||'').trim();
  if(input){const url=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(input)?input:'https://'+input);if(['http:','https:'].includes(url.protocol)&&!url.username&&!url.password)domain=url.hostname;}
 } catch {}
 const copy={
  da:['Hej Waltham,','Jeg vil gerne høre mere om AI Visibility Premium.','Hjemmeside'],
  nb:['Hei Waltham,','Jeg vil gjerne høre mer om AI Visibility Premium.','Nettside'],
  en:['Hello Waltham,','I would like to hear more about AI Visibility Premium.','Website'],
  de:['Guten Tag Waltham,','Ich möchte mehr über AI Visibility Premium erfahren.','Website']
 }[locale]||['Hello Waltham,','I would like to hear more about AI Visibility Premium.','Website'];
 const body=copy[0]+'\n\n'+copy[1]+(domain?'\n\n'+copy[2]+': '+domain:'');
 return 'mailto:waltham@me.com?subject='+encodeURIComponent('AI Visibility Premium'+(domain?' – '+domain:''))+'&body='+encodeURIComponent(body);
}
