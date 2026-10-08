import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHECKPOINTS,calculateScore,applyReviewedEvidence,sourceInventory} from '../netlify/functions/lib/visibility-master.mjs';
import {analyze} from '../netlify/functions/lib/visibility.mjs';
const empty=()=>CHECKPOINTS.map(c=>({...c,fulfillment:null,status:'not_examined'}));
const page={url:'https://example.com/',status:200,headers:{},text:'<h1>Example</h1><p>'+('Useful business information '.repeat(100))+'</p>'};
const report=()=>analyze({page,robots:{status:404,text:''},sitemap:null});
const observation=(id,rating)=>({checkpointId:id,fulfillment:rating,evidence:'Reviewed concrete evidence',sources:['https://example.com/evidence'],date:'2026-10-08'});
test('the fixed master weights and checkpoint IDs match the documented model',()=>{
 assert.equal(CHECKPOINTS.length,18);assert.equal(CHECKPOINTS.reduce((s,c)=>s+c.weight,0),100);
 assert.deepEqual(CHECKPOINTS.map(c=>c.weight),[8,6,6,3,6,6,5,7,4,4,7,4,7,6,5,8,5,3]);
 assert.deepEqual(CHECKPOINTS.map(c=>c.checkpointId),Array.from({length:18},(_,i)=>String(i+1).padStart(2,'0')));
});
test('no observations produce no score; examined failures produce zero with coverage',()=>{
 const checks=empty();assert.equal(calculateScore(checks).score,null);assert.equal(calculateScore(checks).coverage,0);
 checks[0].fulfillment=0;const result=calculateScore(checks);assert.equal(result.score,0);assert.equal(result.coverage,8);assert.equal(result.risk,'High');
});
test('unknown checkpoints reduce coverage without becoming zero; not relevant needs exclusion',()=>{
 const checks=empty();checks[0].fulfillment=4;checks[1].fulfillment=0;
 assert.equal(calculateScore(checks).score,57);assert.equal(calculateScore(checks).coverage,14);
 checks[2].status='not_relevant';assert.equal(calculateScore(checks).coverage,15);
 for(const c of checks)c.status='not_relevant';assert.equal(calculateScore(checks).coverage,null);assert.equal(calculateScore(checks).score,null);
});
test('fractional panel ratings are rounded only after weighted aggregation',()=>{
 const checks=empty();checks[0].fulfillment=4;checks[15].fulfillment=4/3;
 const result=calculateScore(checks);assert.equal(result.score,67);assert.equal(result.earned,8+8/3);
 assert.equal(result.scoreComplete,false);
});
test('ratings and fixed weights cannot be fabricated through reviewed evidence',()=>{
 assert.throws(()=>applyReviewedEvidence(report(),[{checkpointId:'06',fulfillment:4}]),/require/);
 assert.throws(()=>applyReviewedEvidence(report(),[{checkpointId:'06',status:'not_relevant'}]),/reason/);
 assert.throws(()=>applyReviewedEvidence(report(),[observation('18',4)]),/themes/);
 const reviewed=applyReviewedEvidence(report(),[{...observation('06',3),weight:1000,id:'presence'}]);
 assert.equal(reviewed.checks.find(c=>c.checkpointId==='06').weight,6);assert.equal(reviewed.checks.find(c=>c.checkpointId==='06').id,'offering');
 const corrupt=empty();corrupt[0].weight=99;assert.throws(()=>calculateScore(corrupt),/fixed/);
});
test('reviewed external sources retain their meaning and a checkpoint can be reassessed after exclusion',()=>{
 const base=applyReviewedEvidence(report(),[{checkpointId:'06',status:'not_relevant',reason:'Documented exclusion for this review.'}]);
 const result=applyReviewedEvidence(base,[observation('06',3)],{sourceReviews:[{group:'customers',url:'https://customer.example/case',date:'2026-10-08',checkpointIds:['13'],observation:'Customer confirms delivery.',meaning:'Independent confirmation of a specific project.'}]});
 assert.equal(result.checks.find(c=>c.id==='offering').status,'partial');assert.equal(result.relevantWeight,100);
 assert.equal(result.sources.find(s=>s.group==='customers').meaning,'Independent confirmation of a specific project.');
 assert.throws(()=>applyReviewedEvidence(base,[],{sourceReviews:[{group:'media',url:'https://example.com'}]}),/require/);
});
test('AI visibility requires saved responses and metadata; failed runs remain missing',()=>{
 const panel={plannedQuestions:['Who can help?'],plannedCount:3,responses:[
 {question:'Who can help?',service:'test service',model:'test model',date:'2026-10-08',searchMode:'search',runId:'1',answer:'Example is relevant.',correctMention:true},
 {question:'Who can help?',service:'test service',model:'test model',date:'2026-10-08',searchMode:'search',runId:'2',answer:'Another business.',correctMention:false},
 {question:'Who can help?',service:'test service',model:'test model',date:'2026-10-08',searchMode:'search',runId:'3',valid:false}]};
 const result=applyReviewedEvidence(report(),[],{aiPanel:panel});
 assert.equal(result.checks.find(c=>c.id==='presence').fulfillment,2);assert.equal(result.aiPanel.validCount,2);assert.equal(result.aiPanel.complete,false);
 assert.throws(()=>applyReviewedEvidence(report(),[observation('16',4)]),/panel-only/);
 assert.throws(()=>applyReviewedEvidence(report(),[],{aiPanel:{...panel,responses:[panel.responses[0],panel.responses[0]]}}),/Duplicate/);
});
test('a high incomplete score never becomes complete without the planned AI panel',()=>{
 const checks=empty().map(c=>({...c,fulfillment:4}));
 assert.equal(calculateScore(checks).score,100);assert.equal(calculateScore(checks).scoreComplete,false);
 assert.equal(calculateScore(checks,{panelComplete:true}).scoreComplete,true);
});
test('source inventory distinguishes a discovered link from a verified profile and never invents absent profiles',()=>{
 const sources=sourceInventory([{...page,text:'<a href="https://www.linkedin.com/company/example/">Company</a><a href="https://linkedin.com/in/example/">Person</a><a href="https://facebook.com/example">Facebook</a><a href="javascript:alert(1)">Bad</a>'}],'2026-10-08');
 assert.equal(sources.length,10);assert.equal(sources.find(s=>s.group==='linkedin_company').status,'found_unread');
 assert.equal(sources.find(s=>s.group==='linkedin_person').status,'found_unread');assert.equal(sources.find(s=>s.group==='media').status,'not_examined');
 assert.equal(sources.find(s=>s.group==='media').url,null);assert.ok(sources.every(s=>s.checkpointIds.length));
});
test('missing schema or exact desired phrases do not create semantic or expertise failures',()=>{
 const result=analyze({page,robots:null,sitemap:null,profile:{desired:'specialist'}});
 for(const id of ['expertise','people','history','answers','entity','cases','reputation','consistency','presence','accuracy','position'])assert.equal(result.checks.find(c=>c.id===id).fulfillment,null,id);
 assert.equal(result.criticalFindings.length,0);
});
test('crawler restrictions on sampled paths are visible even when the homepage is allowed',()=>{
 const result=analyze({page,robots:{status:200,text:'User-agent: *\nDisallow: /services'},sitemap:null,pages:[page],attemptedPages:[page.url,'https://example.com/services']});
 assert.equal(result.checks.find(c=>c.id==='crawlers').fulfillment,0);assert.ok(result.criticalFindings.includes('02'));
});
test('all four customer pages use the new scale and expose source inventory and method version',()=>{
 for(const locale of ['dk','no','en','de']){
  const html=readFileSync(new URL(`../${locale}/ai-visibility-check.html`,import.meta.url),'utf8');
  assert.ok(html.includes(' / 100</span>'));assert.ok(html.includes('id="source-list"'));assert.ok(html.includes('id="method-version"'));
  assert.ok(!html.includes('1 + 9'));assert.ok(!html.includes('70 % af den fulde'));assert.ok(html.includes('16'));
 }
});
