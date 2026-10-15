import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

for (const locale of ['dk', 'no', 'en', 'de']) {
  test(locale + ': homepage uses the shared consulting structure', () => {
    const html = readFileSync(new URL('../' + locale + '/index.html', import.meta.url), 'utf8');
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(headings.length, 1);
    assert.equal(headings[0][1], 'Waltham<br>Consulting');
    assert.match(html, /class="consulting-hero"/);
    assert.match(html, /class="capability-grid"/);
    assert.equal((html.match(/<article>/g) || []).length, 6);
    assert.match(html, /class=["']dialog-form["']/);
    assert.match(html, /href="\/css\/consulting-home\.css"/);
  });

  test(locale + ': homepage uses the shared wave identity and legacy section anchor', () => {
    const html = readFileSync(new URL('../' + locale + '/index.html', import.meta.url), 'utf8');
    assert.match(html, /url\("\/assets\/waltham-wave-background-v1\.webp"\)/);
    assert.match(html, /id="fokus"><span id="tilgang"/);
    assert.ok(readFileSync(new URL('../assets/waltham-wave-background-v1.webp', import.meta.url)).length > 0);
  });
}
