export function usagePayload(raw, now = new Date()) {
  const value = String(raw || '').trim();
  const url = new URL(value.includes('://') ? value : `https://${value}`);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !url.hostname.includes('.')) throw new Error('Invalid website');
  return new URLSearchParams({
    'form-name': 'visibility-usage',
    'bot-field': '',
    domain: url.hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, ''),
    'tested-at': now.toISOString(),
    subject: 'Waltham: Synlighetstesten er brukt'
  });
}

export async function recordVisibilityUse(raw, send = fetch) {
  const body = usagePayload(raw);
  const response = await send('/no/ai-visibility-check', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: body.toString(),
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error('Usage registration failed');
}
