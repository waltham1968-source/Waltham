import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePerson,sourcedReport} from '../netlify/functions/lib/reputation.mjs';
import handler from '../netlify/functions/digital-reputation.mjs';
import {readFileSync} from 'node:fs';
test('self-search validates names, optional context and explicit acknowledgement',()=>{
 assert.equal(validatePerson({name:'  Søren   O’Neill ',self:true,locale:'da'}).name,'Søren O’Neill');
 assert.throws(()=>validatePerson({name:'Søren O’Neill'}));
 assert.throws(()=>validatePerson({name:'<script>test</script>',self:true}));
 assert.throws(()=>validatePerson({name:'Søren O’Neill',self:true,context:'x'.repeat(121)}));
});
test('only completed web searches with safe clickable citations produce an answer',()=>{
 const base={status:'completed',output:[{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:'A sourced observation [1]',annotations:[{type:'url_citation',start_index:22,end_index:25,url:'https://example.com/profile',title:'Profile'}]}]}]};
 assert.equal(sourcedReport(base).blocks.length,1);
 base.output[1].content[0].annotations[0].url='javascript:alert(1)';
 assert.equal(sourcedReport(base).blocks.length,0);
 base.output.pop();assert.equal(sourcedReport(base).blocks.length,0);
 base.output=[];assert.throws(()=>sourcedReport(base));
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
   return new Response(JSON.stringify({status:'completed',output:[{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:'Profile [1]',annotations:[{type:'url_citation',url:'https://example.com',title:'Profile',start_index:8,end_index:11}]}]}]}));
  };
  const response=await handler(new Request('https://example.com/api/digital-reputation',{method:'POST',body:JSON.stringify({name:'Test Person',context:'Oslo',self:true,locale:'nb'})}));
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal((await response.json()).blocks[0].citations[0].url,'https://example.com/');
 }finally{globalThis.fetch=previousFetch;if(previousKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=previousKey;}
});
