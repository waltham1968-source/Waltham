export function validatePerson(input) {
  const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
  const context = typeof input.context === 'string' ? input.context.trim() : '';
  if (input.self !== true || name.length < 3 || name.length > 120 || !/^[\p{L}\p{M} .’'\-]+$/u.test(name) || context.length > 120) throw new Error('invalid');
  return {name, context, locale: ['nb','da','en','de'].includes(input.locale) ? input.locale : 'nb'};
}
export function safeCitation(annotation, text) {
  if (annotation.type !== 'url_citation' || !Number.isInteger(annotation.start_index) || !Number.isInteger(annotation.end_index) || annotation.start_index < 0 || annotation.end_index <= annotation.start_index || annotation.end_index > text.length) return null;
  try {
    const url = new URL(annotation.url);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return {start: annotation.start_index, end: annotation.end_index, url: url.href, title: String(annotation.title || url.hostname).slice(0,250)};
  } catch {return null;}
}
export function sourcedReport(response) {
  if (response.status !== 'completed' || !response.output?.some(item => item.type === 'web_search_call' && item.status === 'completed')) throw new Error('incomplete');
  const blocks = response.output.filter(item => item.type === 'message').flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => {
    const text = String(item.text || '');
    const citations = (item.annotations || []).map(a => safeCitation(a,text)).filter(Boolean).sort((a,b) => a.start-b.start);
    return {text, citations};
  });
  // Do not show unsupported generated claims when the search returned no citations.
  return {blocks: blocks.filter(block => block.citations.length)};
}
