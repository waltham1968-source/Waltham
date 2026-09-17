import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyze} from '../netlify/functions/lib/visibility.mjs';
import {localizeReport} from '../netlify/functions/lib/visibility-locale.mjs';
import {copy,translator,language} from '../js/visibility-copy.mjs';
import handler from '../netlify/functions/ai-visibility.mjs';
const profile={company:'Example Business',market:'Oslo',offering:'consulting',desired:'local'};
const page={url:'https://example.com',headers:{},text:'<h1>Example Business</h1><meta name="description" content="An original description of the business and services in Oslo.">'+ 'local '.repeat(120)};
const raw=analyze({page,robots:{status:200,text:'User-agent: *\nDisallow: /private'},sitemap:{status:404,text:''},profile});
test('all four locales contain the same complete message set',()=>{
 for(const locale of ['da','nb','en','de'])assert.deepEqual(Object.keys(copy[locale]),Object.keys(copy.da));
 assert.equal(language('no'),'nb');assert.equal(language('unsupported'),'da');
});
test('localized reports preserve measurements and original website excerpts',()=>{
 for(const locale of ['da','nb','en','de']){
  const result=localizeReport(raw,locale,profile),t=translator(locale);
  assert.equal(result.score,raw.score);assert.equal(result.coverage,raw.coverage);
  assert.deepEqual(result.checks.map(c=>c.pass),raw.checks.map(c=>c.pass));
  assert.equal(result.perception.observed,raw.perception.observed);
  assert.equal(result.checks.find(c=>c.id==='offering').evidence,raw.description);
  assert.equal(result.checks.find(c=>c.id==='identity').evidence,t('identity.text',profile));
  assert.equal(result.presence.questions[0],t('q1',profile));
  assert.equal(result.checks.find(c=>c.id==='crawlers').evidence.includes(t('allowed')),true);
  assert.equal(result.locale,locale);
 }
});
test('unknown and missing measurements are localized without invented evidence',()=>{
 const report=analyze({page:{...page,text:'<h1>Only a heading</h1>'},robots:null,sitemap:null});
 for(const locale of ['nb','en','de']){
  const r=localizeReport(report,locale),t=translator(locale);
  assert.equal(r.checks.find(c=>c.id==='crawlers').evidence,t('crawlers.unknown'));
  assert.equal(r.checks.find(c=>c.id==='sitemap').evidence,t('sitemap.unknown'));
  assert.equal(r.checks.find(c=>c.id==='identity').evidence,t('identity.no'));
  assert.equal(r.perception.status,t('perceptionMissing'));
  assert.deepEqual(r.presence.competitors,[]);
 }
});
test('API validation errors respect requested language including invalid JSON',async()=>{
 for(const locale of ['da','nb','en','de']){
  const r=await handler(new Request('http://localhost/api/ai-visibility',{method:'POST',headers:{'accept-language':locale},body:'{'}));
  assert.equal(r.status,400);assert.equal((await r.json()).error,translator(locale)('failed'));
  const method=await handler(new Request('http://localhost/api/ai-visibility',{headers:{'accept-language':locale}}));
  assert.equal(method.status,405);assert.equal((await method.json()).error,translator(locale)('method'));
 }
});
test('translations match their editable source',()=>{
 for(const line of readFileSync(new URL('../scripts/locales/results.tsv',import.meta.url),'utf8').trim().split('\n')){
  const [key,...values]=line.split('|');for(const [i,locale] of ['da','nb','en','de'].entries())assert.equal(copy[locale][key],values[i]);
 }
});
test('home menus and language switches keep the selected visibility locale',()=>{
 for(const [path,lang] of [['dk','da'],['no','nb'],['en','en'],['de','de']]){
  const html=readFileSync(new URL(`../${path}/ai-visibility-check.html`,import.meta.url),'utf8');
  const home=readFileSync(new URL(`../${path}/index.html`,import.meta.url),'utf8');
  assert.ok(home.includes(`href="/${path}/ai-visibility-check"`));
  assert.ok(html.includes(`<html lang="${lang}">`));
  assert.ok(html.includes('type="module" src="/js/ai-visibility.js"'));
  assert.ok(html.includes('id="score-status"'));
  for(const target of ['dk','no','en','de'])assert.ok(html.includes(`href="/${target}/ai-visibility-check"`));
  if(path!=='dk')assert.ok(!home.includes('href="/dk/ai-visibility-check"'));
 }
});
test('localization preserves submitted and redirected URLs',()=>{
 const result=analyze({page,robots:null,sitemap:null,submittedUrl:'https://original.example'});
 for(const locale of ['da','nb','en','de']){
  const r=localizeReport(result,locale);
  assert.equal(r.submittedUrl,'https://original.example');assert.equal(r.url,page.url);
 }
});
