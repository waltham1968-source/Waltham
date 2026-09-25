import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

for (const locale of ['dk', 'no', 'en', 'de']) {
  test(locale + ': homepage keeps only the shared advisory headline', () => {
    const html = readFileSync(new URL('../' + locale + '/index.html', import.meta.url), 'utf8');
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(headings.length, 1);
    assert.equal(headings[0][1], 'Independent Business Advisory');
    assert.match(headings[0][0], /lang="en"/);
    const hero = html.match(/<section class="consulting-hero">([\s\S]*?)<\/section>/)[1];
    assert.doesNotMatch(hero, /Nye virksomheder|Nye virksomheter|New ventures|Neue Geschäftsmodelle/);
    assert.match(hero, /class="button primary"/);
    assert.match(html, /href="\.\.\/css\/consulting-home\.css"/);
  });

  test(locale + ': opening section reuses the human-and-machine illustration', () => {
    const html = readFileSync(new URL('../' + locale + '/index.html', import.meta.url), 'utf8');
    const intro = html.match(/<section class="section consulting-intro"[\s\S]*?<\/section>/)[0];
    assert.match(intro, /class="split consulting-intro-layout"/);
    assert.match(intro, /class="consulting-intro-illustration"/);
    assert.match(intro, /src="\.\.\/assets\/waltham-insight-human-verification\.webp"/);
    assert.match(intro, /width="1672" height="941" loading="lazy"/);
    assert.match(intro, /alt="[^\"]+"/);
    assert.ok(readFileSync(new URL('../assets/waltham-insight-human-verification.webp', import.meta.url)).length > 0);
  });
}
