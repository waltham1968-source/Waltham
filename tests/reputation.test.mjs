import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePerson,personVisibilityReport,visibilityScore} from '../netlify/functions/lib/reputation.mjs';
import handler from '../netlify/functions/digital-reputation.mjs';
import {readFileSync} from 'node:fs';
test('self-search validates names, optional context and explicit acknowledgement',()=>{
 assert.equal(validatePerson({name:'  Søren   O’Neill ',self:true,locale:'da'}).name,'Søren O’Neill');
 assert.throws(()=>validatePerson({name:'Søren O’Neill'}));
 assert.throws(()=>validatePerson({name:'<script>test</script>',self:true}));
 assert.throws(()=>validatePerson({name:'Søren O’Neill',self:true,context:'x'.repeat(121)}));
});
test('incomplete searches cannot be presented as low visibility',()=>{
 assert.throws(()=>personVisibilityReport({status:'incomplete',output:[]},{context:'Oslo'}));
 assert.throws(()=>personVisibilityReport({status:'completed',output:[]},{context:'Oslo'}));
});
test('method and consent validation never call external search',async()=>{
 assert.equal((await handler(new Request('https://example.com/api/digital-reputation'))).status,405);
 assert.equal((await handler(new Request('https://example.com/api/digital-reputation',{method:'POST',body:JSON.stringify({name:'Test Person'})}))).status,400);
});
test('all language versions provide an ungated self-search without usage logging',()=>{
 for(const locale of ['no','dk','en','de']){
  const html=readFileSync(new URL(`../${locale}/digital-reputation.html`,import.meta.url),'utf8');
  assert.ok(html.includes('id="person-name"'));
  assert.ok(html.includes('type="checkbox" name="self" required'));
  assert.ok(html.includes('/js/digital-reputation.js'));
  assert.doesNotMatch(html,/visibility-usage|type="email"/);
  assert.ok(readFileSync(new URL(`../${locale}/index.html`,import.meta.url),'utf8').includes(`/${locale}/digital-reputation.html`));
 }
 assert.doesNotMatch(readFileSync(new URL('../js/digital-reputation.js',import.meta.url),'utf8'),/recordVisibilityUse|localStorage|innerHTML/);
});
test('configured handler searches with storage disabled and preserves cited sources',async()=>{
 const previousKey=process.env.OPENAI_API_KEY,previousFetch=globalThis.fetch;
 process.env.OPENAI_API_KEY='unit-test-key';
 try {
  globalThis.fetch=async (url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');
   const payload=JSON.parse(options.body);
   assert.equal(payload.store,false);assert.equal(payload.tool_choice,'required');
   assert.equal(payload.tools[0].type,'web_search');
   assert.deepEqual(JSON.parse(payload.input),{name:'Test Person',context:'Oslo'});
   return new Response(JSON.stringify({status:'completed',output:[{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:JSON.stringify({profile:{label:'Advisor',description:'Public professional profile',sources:['https://example.com']},findings:[{url:'https://example.com',title:'Profile',observation:'Advisor in Oslo',match:'matched',identityEvidence:'Oslo'}]}),annotations:[{type:'url_citation',url:'https://example.com',title:'Profile',start_index:8,end_index:11}]}]}]}));
  };
  const response=await handler(new Request('https://example.com/api/digital-reputation',{method:'POST',body:JSON.stringify({name:'Test Person',context:'Oslo',self:true,locale:'nb'})}));
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal((await response.json()).findings[0].url,'https://example.com/');
 }finally{globalThis.fetch=previousFetch;if(previousKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=previousKey;}
});
const searchResponse=(findings,profile=null)=>({status:'completed',output:[{type:'web_search_call',status:'completed',action:{sources:findings.map(f=>({url:f.url}))}},{type:'message',content:[{type:'output_text',text:JSON.stringify({findings,profile}),annotations:[]}]}]});
const hit=(url,match='matched')=>({url,match,title:'Public profile',observation:'Advisor in Oslo',identityEvidence:'Public role and Oslo match supplied context'});
test('multiple pages do not inflate visibility; uncertain hits and namesakes are excluded',()=>{
 const report=personVisibilityReport(searchResponse([hit('https://a.example/profile'),hit('https://www.a.example/about'),hit('https://b.example/one','uncertain'),hit('https://c.example/one','namesake')]),{context:'Oslo'});
 assert.equal(report.domainCount,1);assert.equal(report.score,2);assert.equal(report.uncertainCount,1);
});
test('name alone cannot establish identity or justify a visibility score',()=>{
 const report=personVisibilityReport(searchResponse([hit('https://a.example/profile')]),{context:''});
 assert.equal(report.score,null);assert.equal(report.profileStatus,'unclear');
 assert.equal(personVisibilityReport(searchResponse([]),{context:'Oslo'}).score,1);
});
test('unconsulted URLs cannot contribute to scores or profiles',()=>{
 const response=searchResponse([hit('https://invented.example/profile')]);response.output[0].action.sources=[];
 assert.throws(()=>personVisibilityReport(response,{context:'Oslo'}));
});
test('profile is sourced from the matched identity only',()=>{
 const findings=[hit('https://a.example/profile'),hit('https://b.example/article'),hit('https://other.example/person','namesake')];
 const report=personVisibilityReport(searchResponse(findings,{label:'Advisor',description:'Professional advisory work',sources:findings.map(f=>f.url)}),{context:'Oslo'});
 assert.equal(report.score,3);assert.equal(report.profileStatus,'corroborated');assert.equal(report.profile.sources.length,2);
 assert.ok(!report.profile.sources.some(url=>url.includes('other.example')));
});
test('visibility reaches ten only with broad sourced coverage, and never falls outside one to ten',()=>{
 assert.equal(visibilityScore(0),1);assert.equal(visibilityScore(15),10);assert.equal(visibilityScore(200),10);
});
