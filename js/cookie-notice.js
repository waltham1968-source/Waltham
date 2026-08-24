(() => {
  const key = "waltham-cookie-notice-v1";
  try {
    const savedUntil = Number(localStorage.getItem(key));
    if (savedUntil > Date.now()) return;
    localStorage.removeItem(key);
  } catch (_) {}

  const language = (document.documentElement.lang || "en").toLowerCase();
  const copy = language.startsWith("da") ? {
    eyebrow: "Cookies & privatliv",
    title: "En enkel hjemmeside. Ingen skjult sporing.",
    text: "Waltham bruger ikke cookies til analyse, annoncering eller markedsføring. Vi gemmer kun dit sprogvalg og at du har lukket denne besked på din egen enhed.",
    details: "Se detaljer",
    detailText: "Lokalt gemmes “waltham-language”, indtil du ændrer eller rydder dit valg, og denne beskeds status i op til 12 måneder. Oplysningerne deles ikke med annoncører.",
    button: "Forstået"
  } : /^(nb|nn|no)/.test(language) ? {
    eyebrow: "Informasjonskapsler og personvern",
    title: "En enkel nettside. Ingen skjult sporing.",
    text: "Waltham bruker ikke informasjonskapsler til analyse, annonsering eller markedsføring. Vi lagrer bare språkvalget ditt og at du har lukket denne meldingen på din egen enhet.",
    details: "Se detaljer",
    detailText: "Lokalt lagres “waltham-language” til du endrer eller sletter valget, og statusen for denne meldingen i opptil 12 måneder. Opplysningene deles ikke med annonsører.",
    button: "Forstått"
  } : language.startsWith("de") ? {
    eyebrow: "Cookies & Datenschutz",
    title: "Eine einfache Website. Kein verstecktes Tracking.",
    text: "Waltham verwendet keine Cookies für Analyse, Werbung oder Marketing. Wir speichern auf Ihrem Gerät lediglich Ihre Sprachwahl und dass Sie diesen Hinweis geschlossen haben.",
    details: "Details anzeigen",
    detailText: "Lokal werden “waltham-language” bis zur Änderung oder Löschung Ihrer Auswahl sowie der Status dieses Hinweises für bis zu 12 Monate gespeichert. Die Informationen werden nicht mit Werbetreibenden geteilt.",
    button: "Verstanden"
  } : {
    eyebrow: "Cookies & privacy",
    title: "A simple website. No hidden tracking.",
    text: "Waltham does not use cookies for analytics, advertising or marketing. We only store your language choice and that you have closed this notice on your own device.",
    details: "View details",
    detailText: "We store “waltham-language” locally until you change or clear your choice, and the status of this notice for up to 12 months. The information is not shared with advertisers.",
    button: "Understood"
  };

  const notice = document.createElement("aside");
  notice.className = "cookie-notice";
  notice.setAttribute("role", "dialog");
  notice.setAttribute("aria-label", copy.eyebrow);
  notice.innerHTML = `<div class="cookie-notice__copy"><p class="cookie-notice__eyebrow">${copy.eyebrow}</p><h2>${copy.title}</h2><p>${copy.text}</p><details><summary>${copy.details}</summary><p>${copy.detailText}</p></details></div><button type="button">${copy.button}</button>`;
  document.body.appendChild(notice);
  requestAnimationFrame(() => notice.classList.add("is-visible"));

  notice.querySelector("button").addEventListener("click", () => {
    const expires = Date.now() + 365 * 24 * 60 * 60 * 1000;
    try { localStorage.setItem(key, String(expires)); } catch (_) {}
    notice.classList.remove("is-visible");
    setTimeout(() => notice.remove(), 280);
  });
})();
