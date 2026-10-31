import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const canonical='https://www.waltham.dk/dk/punkt-1-nyborg-reklamationsservice.html';
test('article is readable HTML with consistent canonical, social and structured metadata',()=>{
 const html=read('dk/punkt-1-nyborg-reklamationsservice.html');
 const meta=Object.fromEntries([...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)"/g)].map(m=>[m[1],m[2]]));
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert.equal(meta['og:url'],canonical);assert.ok(html.includes('rel="canonical" href="'+canonical+'"'));
 assert.equal(meta['og:title'],schema.headline);assert.equal(schema.mainEntityOfPage,canonical);
 assert.equal(schema.image[0],meta['og:image']);assert.equal(meta['og:type'],'article');
 assert.match(meta['og:image:alt'],/AI-illustration/);assert.ok(existsSync(new URL('..'+new URL(meta['og:image']).pathname,import.meta.url)));
 assert.equal((html.match(/<h1>/g)||[]).length,1);assert.match(html,/<p>Jeg forklarede problemet til Jan/);
 assert.match(html,/en ny reservedel bestilt/);assert.match(html,/den endelige løsning er ikke beskrevet/);
 assert.match(html,/<figcaption><strong>AI-illustration/);
 assert.match(html,/facebook.com\/sharer\/sharer.php\?u=https:\/\/www.waltham.dk\/dk\/punkt-1-nyborg/);
});
test('all updated homepages retain contact routes and use the localized evidence method',()=>{
 for(const [lang,method] of [['dk','HVAD · HVEM · BEVIS'],['no','HVA · HVEM · BEVIS'],['en','WHAT · WHO · PROOF']]){
  const html=read(lang+'/index.html');assert.ok(html.includes(method));
  assert.match(html,/data-netlify="true"/);assert.match(html,/name="waltham-sparring"/);assert.match(html,/netlify-honeypot="bot-field"/);
  assert.match(html,/id="arbejdsform"/);assert.match(html,/id="distribution"/);assert.match(html,/id="tilgang"/);
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.match(schema.description,/kommunikation|kommunikasjon|communication/);
 }
 assert.match(read('index.html'),/localStorage.getItem\("waltham-language"\)/);
 assert.match(read('index.html'),/location.replace\(target\)/);
 assert.ok(read('index.html').includes('HVAD · HVEM · BEVIS')); 
});
test('new story is discoverable through the archive, homepage and sitemap',()=>{
 for(const path of ['dk/logbog.html','dk/index.html','sitemap.xml','llms.txt'])assert.ok(read(path).includes('punkt-1-nyborg-reklamationsservice.html'));
});
