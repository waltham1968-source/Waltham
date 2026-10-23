import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { latestArticles, updateHomeArticles } from '../scripts/update-home-articles.mjs';

const card = (lang, day, title = `Article ${day}`, href = `/${lang}/article-${day}.html`) =>
  `<article><img src="/assets/cover.jpg"><span>${day}${lang === 'en' ? ' October' : '. oktober'} 2026 · Topic</span><h2>${title}</h2><p>Summary &amp; detail.</p><a href="${href}">Read</a></article>`;
const journal = cards => `<section><div class="logbook-list">${cards.join('')}</div></section><section><article><h2>Unrelated content</h2></article></section>`;
const home = '<html><h1>Keep positioning</h1><div class="knowledge-grid latest-grid">\nOLD\n      </div><form name="keep-form"></form></html>';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'waltham-home-articles-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'assets/cover.jpg'), 'fixture');
  await writeFile(join(root, 'index.html'), home);
  for (const [lang, filename] of [['dk', 'logbog.html'], ['no', 'loggbok.html'], ['en', 'journal.html']]) {
    await mkdir(join(root, lang));
    // The newest entry is appended rather than placed first by the editor.
    await writeFile(join(root, lang, filename), journal([1, 2, 3, 4].map(day => card(lang, day, `${lang} ${day}`))));
    await writeFile(join(root, lang, 'index.html'), home);
    for (const day of [1, 2, 3, 4]) await writeFile(join(root, lang, `article-${day}.html`), 'fixture article');
  }
  return root;
}

test('selects by publication date in each language, ignores unrelated sections, deduplicates URLs', () => {
  for (const lang of ['dk', 'no', 'en']) {
    const source = journal([card(lang, 1), card(lang, 4), card(lang, 3), card(lang, 4), card(lang, 2)]);
    assert.deepEqual(latestArticles(source, lang).map(a => a.title), ['Article 4', 'Article 3', 'Article 2']);
  }
});

test('a new logbook entry updates all homepages and root on the next build, without changing positioning', async t => {
  const root = await fixture(t);
  await updateHomeArticles(root);
  for (const lang of ['dk', 'no', 'en']) {
    const html = await readFile(join(root, lang, 'index.html'), 'utf8');
    assert.deepEqual([...html.matchAll(/<h3>(.*?)<\/h3>/g)].map(m => m[1]), [`${lang} 4`, `${lang} 3`, `${lang} 2`]);
    assert.match(html, /<h1>Keep positioning<\/h1>/);
    assert.match(html, /<form name="keep-form">/);
    assert.match(html, /Summary &amp; detail\./);
    assert.ok(!html.includes('OLD'));
    for (const other of ['dk', 'no', 'en'].filter(x => x !== lang)) assert.ok(!html.includes(`href="/${other}/`));
  }
  const before = await readFile(join(root, 'dk/index.html'), 'utf8');
  assert.equal(await readFile(join(root, 'index.html'), 'utf8'), before);
  await updateHomeArticles(root);
  assert.equal(await readFile(join(root, 'dk/index.html'), 'utf8'), before);
});

test('missing selected article stops the build before any homepage is written', async t => {
  const root = await fixture(t);
  await rm(join(root, 'en/article-4.html'));
  await assert.rejects(updateHomeArticles(root), /ENOENT|missing article/);
  for (const filename of ['index.html', 'dk/index.html', 'no/index.html', 'en/index.html']) {
    assert.equal(await readFile(join(root, filename), 'utf8'), home);
  }
});

test('rejects cross-language links, invalid dates, or an incomplete list', () => {
  assert.throws(() => latestArticles(journal([card('dk', 1, 'Wrong locale', '/en/article.html')]), 'dk'), /own language/);
  assert.throws(() => latestArticles(journal([card('dk', 32)]), 'dk'), /Invalid publication date/);
  assert.throws(() => latestArticles(journal([card('en', 1)]), 'en'), /three distinct/);
});

test('a changed homepage structure fails without partially updating other languages', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'en/index.html'), '<html>Unexpected template</html>');
  await assert.rejects(updateHomeArticles(root), /exactly one homepage article grid/);
  assert.equal(await readFile(join(root, 'dk/index.html'), 'utf8'), home);
});
