import test from 'node:test';
import assert from 'node:assert/strict';
import {usagePayload, recordVisibilityUse} from '../js/visibility-usage.mjs';
test('records hostname and time without path, query, fragment or contact data', () => {
 const data = usagePayload('https://WWW.Example.com/private?email=secret#detail', new Date('2026-10-05T12:00:00Z'));
 assert.equal(data.get('domain'), 'example.com');
 assert.equal(data.get('tested-at'), '2026-10-05T12:00:00.000Z');
 assert.doesNotMatch(data.toString(), /secret|private|detail/);
 assert.equal(usagePayload('example.com').get('domain'), 'example.com');
 assert.throws(() => usagePayload('https://user:password@example.com'));
 assert.throws(() => usagePayload('javascript:alert(1)'));
});
test('submits to native form storage and reports rejection', async () => {
 await recordVisibilityUse('example.com', async (url, options) => {
  assert.equal(url, '/no/ai-visibility-check');
  assert.equal(new URLSearchParams(options.body).get('form-name'), 'visibility-usage');
  return {ok: true};
 });
 await assert.rejects(recordVisibilityUse('example.com', async () => ({ok:false})));
});
