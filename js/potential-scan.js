document.querySelectorAll('.potential-scan').forEach(form => {
  const locale = form.dataset.locale || 'da';
  const copy = {
    da: { working:'Vi undersøger virksomheden…', failed:'Analysen kunne ikke gennemføres.', found:'Første muligheder fundet for', leads:'mulige kunder og partnere', web:'forbedringer på hjemmeside, Google eller sociale medier', ai:'AI- og automatiseringsmuligheder', pr:'PR- og profileringsmuligheder', note:'Få den fulde vurdering med alle fund, prioritering og anbefalede næste skridt.', cta:'Få den fulde vurdering', retry:'Prøv igen om et øjeblik.' },
    nb: { working:'Vi undersøker virksomheten…', failed:'Analysen kunne ikke gjennomføres.', found:'Første muligheter funnet for', leads:'mulige kunder og partnere', web:'forbedringer på hjemmeside, Google eller sosiale medier', ai:'AI- og automatiseringsmuligheter', pr:'PR- og profileringsmuligheter', note:'Få den fulle vurderingen med alle funn, prioritering og anbefalte neste steg.', cta:'Få den fulle vurderingen', retry:'Prøv igjen om et øyeblikk.' },
    en: { working:'We are examining the business…', failed:'The analysis could not be completed.', found:'Initial opportunities found for', leads:'potential customers and partners', web:'website, Google or social improvements', ai:'AI and automation opportunities', pr:'PR and profile opportunities', note:'Get the full assessment with every finding, priorities and recommended next steps.', cta:'Get the full assessment', retry:'Please try again in a moment.' },
    de: { working:'Wir untersuchen das Unternehmen…', failed:'Die Analyse konnte nicht abgeschlossen werden.', found:'Erste Chancen gefunden für', leads:'mögliche Kunden und Partner', web:'Verbesserungen für Website, Google oder soziale Medien', ai:'KI- und Automatisierungschancen', pr:'PR- und Profilierungschancen', note:'Erhalten Sie die vollständige Bewertung mit allen Ergebnissen, Prioritäten und nächsten Schritten.', cta:'Vollständige Bewertung erhalten', retry:'Bitte versuchen Sie es gleich noch einmal.' },
  }[locale];
  const input = form.querySelector('input[type="url"]');
  const button = form.querySelector('button');
  const status = form.parentElement.querySelector('.potential-status');
  const result = form.parentElement.querySelector('.potential-results');
  const clean = value => value.trim().replace(/^https?:\/\//i,'').replace(/^www\./i,'').split('/')[0];
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const domain = clean(input.value);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) { input.focus(); return; }
    input.value = domain;
    button.disabled = true;
    status.hidden = false;
    status.textContent = copy.working;
    result.hidden = true;
    try {
      const api = location.protocol === 'file:' ? 'https://www.waltham.dk/api/market-scan' : '/api/market-scan';
      const response = await fetch(api, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({url:domain,market:'Norden'}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || copy.failed);
      const webCount = Number(data.websiteIssueCount || 0) + Number(data.socialIssueCount || 0);
      const subject = encodeURIComponent(`Waltham | Potential assessment: ${data.domain}`);
      const body = encodeURIComponent(`Hello Waltham,\n\nI completed the potential check for ${data.domain} and would like the full assessment.\n\nName:`);
      result.innerHTML = `<h3>${copy.found} ${esc(data.domain)}</h3><div class="potential-grid"><div><b>${data.leadCount || 0}</b><span>${copy.leads}</span></div><div><b>${webCount}</b><span>${copy.web}</span></div><div><b>${data.aiOpportunityCount || 0}</b><span>${copy.ai}</span></div><div><b>${data.prOpportunityCount || 0}</b><span>${copy.pr}</span></div></div><p>${copy.note}</p><a class="button primary" href="mailto:waltham@me.com?subject=${subject}&body=${body}">${copy.cta}</a>`;
      result.hidden = false;
      status.hidden = true;
    } catch (reason) {
      status.textContent = `${copy.failed} ${reason.message || copy.retry}`;
    } finally { button.disabled = false; }
  });
});
