(() => {
  const measurementId = "G-GEKEB9MC0T";
  const storageKey = "waltham-consent-v2";
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  let analyticsLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });

  const language = (document.documentElement.lang || "en").toLowerCase();
  const copy = language.startsWith("da") ? {
    eyebrow:"Cookies & privatliv", title:"Må vi bruge anonymiseret besøgsstatistik?",
    text:"Med jeres tilladelse bruger Waltham Google Analytics til at forstå, hvilke lande og omtrentlige byer besøgende kommer fra, hvilke sider de læser, og hvilke kontaktknapper de bruger.",
    details:"Se detaljer", detailText:"Google Analytics måler blandt andet land, region, omtrentlig by, trafikkilde, sidevisninger og klik. Annoncering og remarketing er slået fra. I kan altid ændre valget via Cookieindstillinger nederst på siden.",
    reject:"Kun nødvendige", accept:"Tillad analyse", settings:"Cookieindstillinger"
  } : /^(nb|nn|no)/.test(language) ? {
    eyebrow:"Informasjonskapsler og personvern", title:"Kan vi bruke anonymisert besøksstatistikk?",
    text:"Med deres tillatelse bruker Waltham Google Analytics for å forstå hvilke land og omtrentlige byer besøkende kommer fra, hvilke sider de leser og hvilke kontaktknapper de bruker.",
    details:"Se detaljer", detailText:"Google Analytics måler blant annet land, region, omtrentlig by, trafikkilde, sidevisninger og klikk. Annonsering og remarketing er slått av. Dere kan alltid endre valget via Innstillinger for informasjonskapsler nederst på siden.",
    reject:"Kun nødvendige", accept:"Tillat analyse", settings:"Innstillinger for informasjonskapsler"
  } : language.startsWith("de") ? {
    eyebrow:"Cookies & Datenschutz", title:"Dürfen wir anonymisierte Besucherstatistiken verwenden?",
    text:"Mit Ihrer Zustimmung nutzt Waltham Google Analytics, um zu verstehen, aus welchen Ländern und ungefähren Städten Besucher kommen, welche Seiten sie lesen und welche Kontaktmöglichkeiten sie nutzen.",
    details:"Details anzeigen", detailText:"Google Analytics misst unter anderem Land, Region, ungefähre Stadt, Zugriffsquelle, Seitenaufrufe und Klicks. Werbung und Remarketing sind deaktiviert. Sie können Ihre Auswahl jederzeit über die Cookie-Einstellungen am Seitenende ändern.",
    reject:"Nur notwendige", accept:"Analyse erlauben", settings:"Cookie-Einstellungen"
  } : {
    eyebrow:"Cookies & privacy", title:"May we use anonymised visitor analytics?",
    text:"With your permission, Waltham uses Google Analytics to understand the countries and approximate cities visitors come from, the pages they read and the contact options they use.",
    details:"View details", detailText:"Google Analytics measures country, region, approximate city, traffic source, page views and clicks. Advertising and remarketing remain disabled. You can change your choice at any time through Cookie settings at the bottom of the page.",
    reject:"Necessary only", accept:"Allow analytics", settings:"Cookie settings"
  };

  function readConsent(){
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      if (value && value.expires > Date.now() && typeof value.analytics === "boolean") return value;
      localStorage.removeItem(storageKey);
    } catch (_) {}
    return null;
  }

  function saveConsent(analytics){
    try { localStorage.setItem(storageKey, JSON.stringify({analytics, expires:Date.now()+oneYear})); } catch (_) {}
  }

  function loadAnalytics(){
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    gtag("consent", "update", {analytics_storage:"granted"});
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
    gtag("js", new Date());
    gtag("config", measurementId, {send_page_view:true, allow_google_signals:false, allow_ad_personalization_signals:false});
    document.addEventListener("click", event => {
      const link = event.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (link.classList.contains("product-cta")) gtag("event", "product_cta_click", {link_text:link.textContent.trim()});
      if (href.startsWith("mailto:")) gtag("event", "contact_email_click", {link_url:href.split("?")[0]});
      else if (href.startsWith("tel:")) gtag("event", "contact_phone_click", {link_url:href});
      if (link.closest(".language-switcher")) gtag("event", "language_select", {language:link.dataset.lang || link.textContent.trim()});
    });
  }

  function clearAnalytics(){
    gtag("consent", "update", {analytics_storage:"denied"});
    document.cookie.split(";").forEach(item => {
      const name = item.split("=")[0].trim();
      if (name === "_ga" || name.startsWith("_ga_")) document.cookie = `${name}=;Max-Age=0;path=/;SameSite=Lax`;
    });
  }

  function closeNotice(notice){
    notice.classList.remove("is-visible");
    setTimeout(() => notice.remove(), 280);
  }

  function showNotice(){
    document.querySelector(".cookie-notice")?.remove();
    const notice = document.createElement("aside");
    notice.className = "cookie-notice";
    notice.setAttribute("role", "dialog");
    notice.setAttribute("aria-label", copy.eyebrow);
    notice.innerHTML = `<div class="cookie-notice__copy"><p class="cookie-notice__eyebrow">${copy.eyebrow}</p><h2>${copy.title}</h2><p>${copy.text}</p><details><summary>${copy.details}</summary><p>${copy.detailText}</p></details></div><div class="cookie-notice__actions"><button class="cookie-reject" type="button">${copy.reject}</button><button class="cookie-accept" type="button">${copy.accept}</button></div>`;
    document.body.appendChild(notice);
    requestAnimationFrame(() => notice.classList.add("is-visible"));
    notice.querySelector(".cookie-reject").addEventListener("click", () => { saveConsent(false); clearAnalytics(); closeNotice(notice); });
    notice.querySelector(".cookie-accept").addEventListener("click", () => { saveConsent(true); loadAnalytics(); closeNotice(notice); });
  }

  function addSettingsButton(){
    if (document.querySelector(".cookie-settings")) return;
    const button = document.createElement("button");
    button.className = "cookie-settings";
    button.type = "button";
    button.textContent = copy.settings;
    button.addEventListener("click", showNotice);
    document.body.appendChild(button);
  }

  const existing = readConsent();
  if (existing?.analytics) loadAnalytics();
  if (!existing) showNotice();
  addSettingsButton();
})();
