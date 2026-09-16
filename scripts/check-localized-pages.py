"""Check routing and language metadata across the three product page families."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parent.parent
routes={'dk':['om-os','fastlaaste-situationer','ai-visibility-check'],'no':['om-oss','fastlaaste-situasjoner','ai-visibility-check'],'en':['about-us','business-deadlocks','ai-visibility-check'],'de':['ueber-uns','festgefahrene-situationen','ai-visibility-check']}
langs={'dk':'da','no':'nb','en':'en','de':'de'}
class Page(HTMLParser):
 def __init__(self,path):
  super().__init__();self.links=[];self.ids=[];self.lang=None;self.alternates=[];self.canonical=[];self.switch=[];self.modules=[];self.feed(path.read_text())
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='html':self.lang=a.get('lang')
  if 'id' in a:self.ids.append(a['id'])
  if t=='a' and 'data-lang' in a:self.switch.append(a)
  if t=='link' and a.get('rel')=='alternate':self.alternates.append(a)
  if t=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
  if t in ['a','link','script']:self.links.append(a.get('href',a.get('src','')))
  if t=='script' and a.get('type')=='module':self.modules.append(a.get('src'))
for locale,slugs in routes.items():
 home=Page(ROOT/f'{locale}/index.html')
 for slug in slugs:assert f'/{locale}/{slug}' in home.links,(locale,slug,'homepage entry')
 for family,slug in enumerate(slugs):
  path=ROOT/f'{locale}/{slug}.html';p=Page(path)
  assert p.lang==langs[locale],path
  assert len(p.ids)==len(set(p.ids)),path
  assert p.canonical==[f'https://www.waltham.dk/{locale}/{slug}'],path
  assert {a['hreflang'] for a in p.alternates}==set(langs.values()),path
  assert len(p.switch)==4,path
  for a in p.switch:
   targetLocale=next(k for k,v in langs.items() if v==a['data-lang'])
   assert a['href']==f'/{targetLocale}/{routes[targetLocale][family]}',(path,a)
   assert (a.get('aria-current')=='page')==(targetLocale==locale),(path,a)
  if family==2:assert '/js/ai-visibility.js' in p.modules,path
  for link in p.links:
   url=urlsplit(link)
   if not url.scheme and not url.netloc and (url.path.startswith('/') or link.startswith('#')):
    target=ROOT/url.path.lstrip('/') if url.path else path
    if target.is_dir():target=target/'index.html'
    if not target.exists():target=Path(str(target)+'.html')
    assert target.exists(),(path,link)
    if url.fragment:assert url.fragment in Page(target).ids,(path,link,'anchor')
 print(locale+': page content, navigation, alternate links and module loading OK')
