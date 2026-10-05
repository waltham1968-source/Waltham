import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const locales = [
  ['dk', 'da', 'produkter.html', 'digitale-tjenester.html', 'Produkter og tjenester'],
  ['no', 'nb', 'produkter.html', 'digitale-tjenester.html', 'Produkter og tjenester'],
  ['en', 'en', 'products.html', 'digital-services.html', 'Products and services'],
  ['de', 'de', 'produkte.html', 'digitale-leistungen.html', 'Produkte und Leistungen'],
];
const read = path => readFileSync(resolve(root, path), 'utf8');
const serviceIds = ['ai-visibility', 'clearer-website', 'ai-clarity', 'google-profile'];

for (const [locale, lang, hub, page, label] of locales) {
  test(locale + ': menu, overview and four services stay connected', () => {
    const home = read(locale + '/index.html');
    const overview = read(locale + '/' + hub);
    const services = read(locale + '/' + page);
    assert.ok(home.includes('href="/' + locale + '/' + hub + '">' + label + '</a>'));
    for (const id of serviceIds) assert.ok(overview.includes('id="' + id + '"'), 'overview retains ' + id);
    for (const name of ['Digital Opportunity Scan', 'Market Intelligence Sprint', 'AI Opportunity Review']) {
      assert.ok(overview.includes('<h3>' + name + '</h3>'), name + ' preserved');
    }
    assert.equal((overview.match(/class="core-offer-grid"/g) || []).length, 1);
    assert.ok(services.includes('<html lang="' + lang + '">'));
    assert.equal((services.match(/class="offer-card"/g) || []).length, 4);
    assert.equal((services.match(/<li>/g) || []).length, 16);
    for (const id of serviceIds) assert.ok(services.includes('id="' + id + '"'));
    for (const amount of ['9500', '19500', '7500', '995', '1495']) {
      assert.ok(!services.replace(/[.,]/g, '').includes(amount), 'removed price ' + amount);
      assert.ok(!overview.replace(/[.,]/g, '').includes(amount), 'removed overview price ' + amount);
    }
    assert.doesNotMatch(services, /class="offer-price(?:-note)?"|DKK/);
    assert.doesNotMatch(overview, /class="offer-price(?:-note)?"|DKK/);
    assert.equal((services.match(/mailto:waltham@me.com/g) || []).length, 5);
    assert.doesNotMatch(services, /ovdal|mathias/i);
    assert.ok(services.includes('href="' + hub + '"'));
    assert.ok(read('sitemap.xml').includes('/' + locale + '/' + page));
  });

  test(locale + ': language switches stay on the equivalent page', () => {
    for (const filename of [hub, page]) {
      const html = read(locale + '/' + filename);
      assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
      for (const [other, otherLang, otherHub, otherPage] of locales) {
        const target = filename === hub ? otherHub : otherPage;
        const links = [...html.matchAll(/<a[^>]+href="([^"]+)"/g)].map(m => new URL(m[1], 'https://www.waltham.dk/' + locale + '/' + filename).pathname);
        assert.ok(links.includes('/' + other + '/' + target), other);
        if (filename === page) assert.ok(html.includes('hreflang="' + otherLang + '"'));
      }
    }
  });

  test(locale + ': product navigation and assets resolve locally', () => {
    for (const filename of [hub, page]) {
      const source = locale + '/' + filename;
      const html = read(source);
      for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        const href = match[1];
        if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue;
        const [path, fragment] = href.split('#');
        let target = path ? resolve(path.startsWith('/') ? root : dirname(resolve(root, source)), path.replace(/^\//, '')) : resolve(root, source);
        if (!existsSync(target) && existsSync(target + '.html')) target += '.html';
        if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, 'index.html');
        assert.ok(existsSync(target), source + ' → ' + href);
        if (fragment) assert.ok(readFileSync(target, 'utf8').includes('id="' + fragment + '"'), source + ' → missing #' + fragment);
      }
    }
  });
}
