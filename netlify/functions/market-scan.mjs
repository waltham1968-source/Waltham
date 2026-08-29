import dns from "node:dns/promises";
import net from "node:net";

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  },
});

const privateIp = ip => {
  if (net.isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  const value = ip.toLowerCase();
  return value === "::1" || value === "::" || value.startsWith("fc") ||
    value.startsWith("fd") || value.startsWith("fe8") || value.startsWith("fe9") ||
    value.startsWith("fea") || value.startsWith("feb") || value.startsWith("::ffff:127.");
};

async function safeUrl(raw) {
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Ugyldig webadresse');
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('Porten er ikke tillatt');
  const host = url.hostname.replace(/\.$/, '');
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('Adressen er ikke offentlig');
  const addresses = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map(item => item.address);
  if (!addresses.length || addresses.some(privateIp)) throw new Error('Adressen er ikke offentlig');
  url.hash = '';
  return url;
}

async function fetchPage(url, redirects = 0) {
  if (redirects > 3) throw new Error('For mange videresendinger');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  let response;
  try {
    response = await fetch(url, { redirect: 'manual', signal: controller.signal, headers: { 'user-agent': 'WalthamMarketScan/1.0 (+https://waltham.dk)' } });
  } finally { clearTimeout(timer); }
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get('location');
    if (!location) throw new Error('Ugyldig videresending');
    return fetchPage(await safeUrl(new URL(location, url).href), redirects + 1);
  }
  if (!response.ok) throw new Error(`Hjemmesiden svarte med status ${response.status}`);
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) throw new Error('Adressen viser ikke en vanlig hjemmeside');
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > 1_500_000) throw new Error('Hjemmesiden er for stor til førstesjekken');
  const html = (await response.text()).slice(0, 1_500_000);
  return { html, finalUrl: response.url || url.href };
}

const strip = html => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ').trim();
const match = (html, pattern) => (html.match(pattern)?.[1] || '').replace(/<[^>]+>/g, '').trim();
const count = (html, pattern) => (html.match(pattern) || []).length;

function audit(html, finalUrl) {
  const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) ||
    match(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const h1Count = count(html, /<h1\b/gi);
  const links = [...html.matchAll(/<a\b[^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);
  const socialNames = ['linkedin.com', 'facebook.com', 'instagram.com', 'youtube.com', 'tiktok.com'];
  const socialFound = socialNames.filter(name => links.some(link => link.includes(name)));
  const issues = [];
  if (!title || title.length < 20 || title.length > 65) issues.push('Sidetittelen bør beskrive tilbudet tydeligere i søkeresultater.');
  if (!description || description.length < 70) issues.push('Metabeskrivelsen mangler eller er for kort til å forklare verdien i Google.');
  if (h1Count !== 1) issues.push(h1Count ? 'Siden har flere hovedoverskrifter; én tydelig H1 gir bedre struktur.' : 'Siden mangler en tydelig hovedoverskrift (H1).');
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) issues.push('Canonical-adresse mangler og bør angi den foretrukne siden.');
  if (!/<script[^>]+type=["']application\/ld\+json["']/i.test(html)) issues.push('Strukturerte data mangler; Organization eller LocalBusiness kan styrke synligheten.');
  if (!/<meta[^>]+property=["']og:(title|description|image)["']/i.test(html)) issues.push('Delingsmetadata mangler, slik at lenken kan se svak ut i sosiale medier.');
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) issues.push('Mobilinnstillingen viewport mangler.');
  if (!/(kontakt|contact|book|bestil|bestill|request|få tilbud)/i.test(strip(html))) issues.push('En tydelig kontakt- eller bestillingshandling er vanskelig å finne.');
  const socialIssues = [];
  if (!socialFound.some(x => x.includes('linkedin'))) socialIssues.push('Ingen tydelig LinkedIn-profil er koblet fra hjemmesiden.');
  if (!socialFound.some(x => x.includes('facebook') || x.includes('instagram'))) socialIssues.push('Ingen Facebook- eller Instagram-profil er koblet fra hjemmesiden.');
  if (!links.some(link => /google\.[^/]+\/maps|g\.page|maps\.app\.goo\.gl/i.test(link))) socialIssues.push('Google Business-/Maps-profil er ikke synlig koblet fra hjemmesiden.');
  if (!/<meta[^>]+property=["']og:image["']/i.test(html)) socialIssues.push('Siden mangler et definert bilde for deling i sosiale medier.');
  return {
    url: finalUrl, title: title || new URL(finalUrl).hostname, description,
    websiteIssues: issues.slice(0, 8), socialIssues: socialIssues.slice(0, 5),
    signals: { words: strip(html).split(' ').filter(Boolean).length, links: links.length, socialProfiles: socialFound.length, h1Count },
    pageText: strip(html).slice(0, 14000),
  };
}

function responseText(data) {
  return (data.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('');
}

async function findLeads(auditResult, market) {
  if (!process.env.OPENAI_API_KEY) return { enabled: false, leads: [], note: 'Lead-søk er ikke aktivert ennå.' };
  const prompt = `Utfør en kort forretningssjekk av ${auditResult.url}. Bruk nettsøk. Finn maksimalt 5 reelle mulige kunder, distributører eller partnere i ${market}, 3 konkrete PR-/profileringsmuligheter og 3 konkrete AI-/automatiseringsmuligheter. Ta bare med leads med offentlig kilde-URL. Ikke oppdikt navn eller tall. Returner bare JSON: {"summary":"kort vurdering","leads":[{"name":"navn","type":"kunde|distributør|partner","reason":"kort grunn","source":"https://..."}],"prOpportunities":["konkret mulighet"],"aiOpportunities":["konkret mulighet"]}. NETTSTEDSTEKST: ${auditResult.pageText.slice(0, 5000)}`;
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com').replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35000);
  let response;
  try { response = await fetch(`${baseUrl}/v1/responses`, {
    method: 'POST',
    headers: { 'authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_MARKET_MODEL || 'gpt-5-mini', reasoning: { effort: 'minimal' }, max_output_tokens: 1200, tools: [{ type: 'web_search', search_context_size: 'low' }], input: prompt }),
    signal: controller.signal,
  }); } finally { clearTimeout(timer); }
  if (!response.ok) throw new Error('Lead-søket kunne ikke fullføres');
  const raw = responseText(await response.json()).replace(/^```json\s*|\s*```$/g, '');
  const parsed = JSON.parse(raw);
  const leads = Array.isArray(parsed.leads) ? parsed.leads.filter(x => x?.name && /^https?:\/\//.test(x?.source || '')).slice(0, 20) : [];
  const prOpportunities = Array.isArray(parsed.prOpportunities) ? parsed.prOpportunities.filter(Boolean).slice(0, 5) : [];
  const aiOpportunities = Array.isArray(parsed.aiOpportunities) ? parsed.aiOpportunities.filter(Boolean).slice(0, 5) : [];
  return { enabled: true, summary: parsed.summary || '', leads, prOpportunities, aiOpportunities };
}

export default async req => {
  if (req.method === 'OPTIONS') return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
  if (req.method !== 'POST') return json({ error: 'Kun POST er tillatt' }, 405);
  try {
    const body = await req.json();
    if (body.company) return json({ error: 'Ugyldig forespørsel' }, 400);
    const raw = String(body.url || '').trim().slice(0, 300);
    const market = ['Danmark', 'Norge', 'Sverige', 'Finland', 'Island', 'Norden'].includes(body.market) ? body.market : 'Norden';
    if (!raw) return json({ error: 'Skriv inn en webadresse' }, 400);
    const start = await safeUrl(raw);
    const page = await fetchPage(start);
    const result = audit(page.html, page.finalUrl);
    let leadResult;
    try { leadResult = await findLeads(result, market); }
    catch { leadResult = { enabled: Boolean(process.env.OPENAI_API_KEY), leads: [], note: 'Lead-søket var midlertidig utilgjengelig.' }; }
    return json({
      domain: new URL(result.url).hostname.replace(/^www\./, ''), market,
      websiteIssueCount: result.websiteIssues.length, websiteIssues: result.websiteIssues.slice(0, 2),
      socialIssueCount: result.socialIssues.length, socialIssues: result.socialIssues.slice(0, 2),
      signals: result.signals, leadCount: leadResult.leads.length,
      leadPreview: leadResult.leads.slice(0, 3), leadSearchEnabled: leadResult.enabled,
      prOpportunityCount: leadResult.prOpportunities?.length || 0,
      prOpportunityPreview: leadResult.prOpportunities?.slice(0, 1) || [],
      aiOpportunityCount: leadResult.aiOpportunities?.length || 0,
      aiOpportunityPreview: leadResult.aiOpportunities?.slice(0, 1) || [],
      summary: leadResult.summary || '', note: leadResult.note || '',
    });
  } catch (error) {
    return json({ error: error.name === 'AbortError' ? 'Hjemmesiden brukte for lang tid på å svare' : error.message || 'Analysen kunne ikke gjennomføres' }, 400);
  }
};

export const config = {
  path: '/api/market-scan',
  rateLimit: { windowLimit: 5, windowSize: 180, aggregateBy: ['ip', 'domain'] },
};
