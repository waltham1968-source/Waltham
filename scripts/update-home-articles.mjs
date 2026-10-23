import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const locales = [
  { lang: 'dk', journal: 'logbog.html', label: 'Læs artiklen' },
  { lang: 'no', journal: 'loggbok.html', label: 'Les artikkelen' },
  { lang: 'en', journal: 'journal.html', label: 'Read the article' },
];
const months = [
  ['januar', 'january'], ['februar', 'february'], ['marts', 'mars', 'march'],
  ['april'], ['maj', 'mai', 'may'], ['juni', 'june'], ['juli', 'july'],
  ['august'], ['september'], ['oktober', 'october'], ['november'], ['december', 'desember'],
];
const plain = value => value.replace(/<[^>]*>/g, '').trim();
const attribute = (tag, name) => tag?.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];

function dateOf(article) {
  const text = plain(article.match(/<span\b[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');
  const match = text.match(/^(\d{1,2})\.?\s+([a-zæøå]+)\s+(\d{4})\b/i);
  if (!match) throw new Error(`Article needs a publication date: ${text}`);
  const month = months.findIndex(names => names.includes(match[2].toLowerCase()));
  const day = Number(match[1]), year = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  if (month < 0 || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
    throw new Error(`Invalid publication date: ${text}`);
  }
  return date.getTime();
}

export function latestArticles(html, lang) {
  const start = html.match(/<div\b[^>]*class=["'][^"']*\blogbook-list\b[^"']*["'][^>]*>/i);
  if (!start) throw new Error(`${lang}: logbook-list not found`);
  const section = html.slice(start.index + start[0].length).split(/<\/section>/i)[0];
  const seen = new Set();
  const articles = [...section.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)].map(([, article]) => {
    const title = plain(article.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || '');
    const description = plain(article.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '');
    const href = attribute(article.match(/<a\b[^>]*>/i)?.[0], 'href');
    if (!title || !description || !href) throw new Error(`${lang}: incomplete article card`);
    const url = new URL(href, `https://www.waltham.dk/${lang}/`);
    if (url.origin !== 'https://www.waltham.dk' || !url.pathname.startsWith(`/${lang}/`) || url.search || url.hash) {
      throw new Error(`${lang}: article must link to its own language: ${href}`);
    }
    const imageTag = article.match(/<img\b[^>]*>/i)?.[0];
    const image = attribute(imageTag, 'src');
    if (image && !/^\/assets\/[a-z0-9_./-]+$/i.test(image)) throw new Error(`Invalid image: ${image}`);
    return { title, description, href: url.pathname, image, date: dateOf(article) };
  }).sort((a, b) => b.date - a.date).filter(article => {
    if (seen.has(article.href)) return false;
    seen.add(article.href);
    return true;
  }).slice(0, 3);
  if (articles.length !== 3) throw new Error(`${lang}: at least three distinct articles required`);
  return articles;
}

function replaceCards(html, cards) {
  const pattern = /(<div class="knowledge-grid latest-grid">)\s*[\s\S]*?(\n      <\/div>)/g;
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== 1) throw new Error('Expected exactly one homepage article grid');
  return html.replace(pattern, (_, open, close) => `${open}\n${cards}${close}`);
}

export async function updateHomeArticles(root) {
  const changes = [];
  for (const { lang, journal, label } of locales) {
    const source = await readFile(resolve(root, lang, journal), 'utf8');
    const articles = latestArticles(source, lang);
    for (const article of articles) {
      for (const url of [article.href, article.image].filter(Boolean)) {
        const target = resolve(root, `.${url}`);
        if (relative(root, target).startsWith('..') || !(await stat(target)).isFile()) {
          throw new Error(`${lang}: missing article or image: ${url}`);
        }
      }
    }
    const cards = articles.map(({ title, description, href, image }) =>
      `        <article>${image ? `<img loading="lazy" src="${image}" alt="">` : ''}<h3>${title}</h3><p>${description}</p><a href="${href}">${label} →</a></article>`
    ).join('\n');
    for (const filename of lang === 'dk' ? ['dk/index.html', 'index.html'] : [`${lang}/index.html`]) {
      const path = resolve(root, filename);
      const before = await readFile(path, 'utf8');
      changes.push({ path, before, after: replaceCards(before, cards) });
    }
    console.log(`${lang}: ${articles.map(article => plain(article.title)).join(' | ')}`);
  }
  // Validate every locale and target before touching any homepage.
  for (const { path, before, after } of changes) {
    if (before !== after) await writeFile(path, after);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  updateHomeArticles(root).catch(error => { console.error(error.message); process.exitCode = 1; });
}
