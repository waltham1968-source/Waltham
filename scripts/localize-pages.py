"""Generate localized pages from Danish HTML and reviewed phrase translations."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape, unescape
import json,re
from urllib.parse import quote
ROOT=Path(__file__).resolve().parent.parent
source=json.loads((ROOT/'scripts/locales/source.json').read_text())
translations={}
for line in (ROOT/'scripts/locales/pages.tsv').read_text().splitlines():
 i,*values=line.split('|');assert len(values)==3,line
 translations[int(i)]=dict(zip(['no','en','de'],values))
invariant={3,4,5,12,16,17,18,19,32,35,38,51,83,84,88,94,97,114,116,120,122,124,141,143,145,147,149,168}
assert set(range(len(source)))==set(translations)|invariant
routes={'dk':['om-os','fastlaaste-situationer','ai-visibility-check'],'no':['om-oss','fastlaaste-situasjoner','ai-visibility-check'],'en':['about-us','business-deadlocks','ai-visibility-check'],'de':['ueber-uns','festgefahrene-situationen','ai-visibility-check']}
langs={'dk':'da','no':'nb','en':'en','de':'de'}
anchors={'no':{'arbejde':'arbeid','projekter':'prosjekter','tilgang':'tilnaerming','kontakt':'kontakt'},'en':{'arbejde':'work','projekter':'projects','tilgang':'approach','kontakt':'contact'},'de':{'arbejde':'arbeit','projekter':'projekte','tilgang':'ansatz','kontakt':'kontakt'}}
markets={'no':'nordisk-markedsinngang','en':'nordic-market-entry','de':'nordischer-markteintritt'}
def switcher(locale,page):
 links=''.join(f'<a href="/{l}/{routes[l][page]}" data-lang="{langs[l]}"'+(' aria-current="page"' if l==locale else '')+f'>{l.upper()}</a>' for l in routes)
 return f'<div class="language-switcher" aria-label="'+{'dk':'Sprog','no':'Språk','en':'Language','de':'Sprache'}[locale]+f'">{links}</div>'
def alternates(page):
 return ''.join(f'<link rel="alternate" hreflang="{langs[l]}" href="https://www.waltham.dk/{l}/{routes[l][page]}">' for l in routes)
class Localizer(HTMLParser):
 def __init__(self,locale):super().__init__(convert_charrefs=True);self.locale=locale;self.out=[];self.skip=0
 def tr(self,s):
  stripped=unescape(s).strip()
  if not stripped:return s
  if stripped not in source:raise ValueError('Missing source: '+stripped)
  i=source.index(stripped);value=translations.get(i,{}).get(self.locale,stripped)
  return s[:len(s)-len(s.lstrip())]+escape(value,quote=False)+s[len(s.rstrip()):]
 def handle_starttag(self,tag,attrs):
  if tag in ['script','style']:self.skip+=1
  translated=[]
  for k,v in attrs:
   if v is None:translated.append(k);continue
   if k in ['placeholder','aria-label'] or (tag=='meta' and k=='content' and dict(attrs).get('name')=='description'):
    v=unescape(self.tr(v))
   if tag=='html' and k=='lang':v=langs[self.locale]
   translated.append(k+'="'+escape(v,quote=True)+'"')
  self.out.append('<'+tag+(' '+' '.join(translated) if translated else '')+'>')
 def handle_endtag(self,tag):
  self.out.append('</'+tag+'>')
  if tag in ['script','style']:self.skip-=1
 def handle_data(self,data):self.out.append(data if self.skip else self.tr(data))
 def handle_entityref(self,name):self.out.append('&'+name+';')
 def handle_charref(self,name):self.out.append('&#'+name+';')
 def handle_decl(self,decl):self.out.append('<!'+decl+'>')
 def handle_comment(self,data):self.out.append('<!--'+data+'-->')
# Decode entities before parsing so complete phrases (e.g. headings with &) are translated together.
for page,slug in enumerate(routes['dk']):
 template=(ROOT/f'dk/{slug}.html').read_text()
 template=re.sub(r'<div class="language-switcher".*?</div>','',template,flags=re.S)
 template=re.sub(r'<link rel="alternate"[^>]*>','',template)
 for locale in routes:
  if locale=='dk':s=template
  else:
   p=Localizer(locale);p.feed(template);s=''.join(p.out)
   s=s.replace('/dk/',f'/{locale}/')
   for old,new in zip(routes['dk'],routes[locale]):s=s.replace(f'/{locale}/{old}',f'/{locale}/{new}')
   s=s.replace(f'/{locale}/nordisk-markedsindgang',f'/{locale}/{markets[locale]}')
   for old,new in anchors[locale].items():s=s.replace(f'/{locale}/#{old}',f'/{locale}/#{new}')
   for old in ['En%20samtale%20med%20Waltham','En%20fortrolig%20samtale']:
    subject={'no':'En fortrolig samtale med Waltham','en':'A confidential conversation with Waltham','de':'Ein vertrauliches Gespräch mit Waltham'}[locale]
    s=s.replace(old,quote(subject))
  s=re.sub(r'<link rel="canonical"[^>]*>',f'<link rel="canonical" href="https://www.waltham.dk/{locale}/{routes[locale][page]}">',s)
  s=s.replace('</head>',alternates(page)+'</head>')
  s=s.replace('</header>',switcher(locale,page)+'</header>')
  (ROOT/f'{locale}/{routes[locale][page]}.html').write_text('\n'.join(line.rstrip() for line in s.splitlines())+'\n')
# Home navigation and the fourth service card.
cards={
 'no':('Fastlåste situasjoner','Oversikt, avklaring og konkrete neste skritt når samarbeid eller beslutninger har låst seg.','Finn en vei videre →'),
 'en':('When business gets stuck','Clarity, perspective and practical next steps when working relationships or decisions have stalled.','Find a way forward →'),
 'de':('Festgefahrene Situationen','Überblick, Klärung und konkrete nächste Schritte, wenn Zusammenarbeit oder Entscheidungen feststecken.','Einen Weg nach vorn finden →')}
for locale,(heading,desc,cta) in cards.items():
 p=ROOT/f'{locale}/index.html';s=p.read_text().replace('/dk/ai-visibility-check',f'/{locale}/ai-visibility-check').replace('/dk/om-os',f'/{locale}/{routes[locale][0]}')
 if 'advisory-pages.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/css/advisory-pages.css"></head>')
 if f'/{locale}/{routes[locale][1]}' not in s:
  card=f'<article><span>04</span><h3>{heading}</h3><p>{desc}</p><a class="advisory-link" href="/{locale}/{routes[locale][1]}">{cta}</a></article>'
  s=re.sub(r'(<div class="focus-grid">.*?)(</div>)',lambda m:m[1].replace('class="focus-grid"','class="focus-grid focus-grid-four"')+card+m[2],s,count=1,flags=re.S)
 s=s.replace('a small, independent advisory firm','an independent advisory firm').replace('et lite, uavhengig rådgivningsmiljø','et uavhengig rådgivningsmiljø').replace('eine kleine, unabhängige Beratung','eine unabhängige Beratung')
 p.write_text(s)
p=ROOT/'sitemap.xml';s=p.read_text()
for locale in routes:
 for slug in routes[locale]:
  url=f'https://www.waltham.dk/{locale}/{slug}'
  if url not in s and url.replace('www.','') not in s:s=s.replace('</urlset>',f'  <url><loc>{url}</loc></url>\n</urlset>')
p.write_text(s)
print('Generated 12 localized pages and updated home navigation.')

# Shared UI/API messages are generated alongside the static pages.
messages={l:{} for l in ['da','nb','en','de']}
for row in (ROOT/'scripts/locales/results.tsv').read_text().splitlines():
 key,*values=row.split('|');assert len(values)==4,row
 for locale,value in zip(messages,values):messages[locale][key]=value
module=ROOT/'js/visibility-copy.mjs'
helpers=module.read_text().split('export function language',1)[1]
module.write_text('// Generated from scripts/locales/results.tsv.\nexport const copy = '+json.dumps(messages,ensure_ascii=False,indent=2)+';\nexport function language'+helpers)
