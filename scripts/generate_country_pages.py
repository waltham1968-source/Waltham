from pathlib import Path
from html import escape
from urllib.parse import quote
import re

ROOT = Path(__file__).resolve().parents[1]

LOCALES = {
    "dk": {
        "lang": "da", "back": "Nordisk markedsindgang", "route": "nordisk-markedsindgang.html",
        "insight": "Markedsindsigt", "description": "Indledende markedsindsigt om {country} for virksomheder, der overvejer nordisk markedsindgang.",
        "attractive": "Det attraktive", "opportunity": "Mulighed", "behaviour": "Kundeadfærd", "question": "Første spørgsmål",
        "actions": "Otte handlingspunkter", "actions_title": "Fra markedssignal til beslutning.",
        "actions_intro": "Åbn det punkt, der er mest relevant. Et samarbejde kan begynde ét sted — og fortsætter kun, når næste skridt kan tilføre tydelig værdi.",
        "points": [
            ("Find markedssignalet", "Vi undersøger, om der findes et konkret behov, momentum eller en ændring, som gør timingen interessant."),
            ("Vælg de rigtige købere", "Vi afgrænser segmenter og identificerer de virksomheder eller mennesker, der mest sandsynligt vil reagere."),
            ("Læs konkurrencen", "Vi ser efter lokale alternativer, etablerede vaner og den plads, markedet endnu ikke har udfyldt."),
            ("Gør tilbuddet lokalt relevant", "Budskab, dokumentation, pris og kundeløfte tilpasses det, lokale købere faktisk lægger vægt på."),
            ("Vælg vejen ind", "Direkte salg, distributør, lokal partner, offentlig indkøbsvej eller en kombination vurderes mod hinanden."),
            ("Åbn de første døre", "Vi går fra skrivebordsviden til samtaler med relevante kunder, partnere og beslutningstagere."),
            ("Test før I bygger", "En afgrænset markedstest skal skabe beviser, læring og et bedre beslutningsgrundlag før større investeringer."),
            ("Beslut og etablér", "Når markedet svarer, samler vi den nødvendige hjælp til registrering, compliance, logistik og lokal drift."),
        ],
        "note": "Ikke alle markeder eller opgaver passer. Første mål er at finde ud af, om muligheden er værd at forfølge.",
        "sources": "Datagrundlag", "sources_title": "Tal med kontekst.", "sources_copy": "Befolkning pr. 1. januar 2025. Rangeringer fra World Happiness Report 2026 og Transparency International CPI 2025.",
        "cta": "Forespørg om en vurdering", "cta_title": "Er {country} det rigtige næste marked?", "cta_copy": "Fortæl kort om virksomheden og det, I vil undersøge. Hvis jeg ser et tydeligt potentiale og et godt match, vender jeg personligt tilbage.", "cta_button": "Fortæl om jeres planer", "subject": "Markedsvurdering {country}",
    },
    "no": {
        "lang": "nb", "back": "Nordisk markedsinngang", "route": "nordisk-markedsinngang.html",
        "insight": "Markedsinnsikt", "description": "Innledende markedsinnsikt om {country} for norske virksomheter som vurderer nordisk markedsinngang.",
        "attractive": "Det attraktive", "opportunity": "Mulighet", "behaviour": "Kundeadferd", "question": "Første spørsmål",
        "actions": "Åtte handlingspunkter", "actions_title": "Fra markedssignal til beslutning.",
        "actions_intro": "Åpne punktet som er mest relevant. Et samarbeid kan begynne ett sted — og fortsetter bare når neste steg kan tilføre tydelig verdi.",
        "points": [
            ("Finn markedssignalet", "Vi undersøker om det finnes et konkret behov, momentum eller en endring som gjør tidspunktet interessant."),
            ("Velg de riktige kjøperne", "Vi avgrenser segmenter og identifiserer virksomhetene eller menneskene som mest sannsynlig vil reagere."),
            ("Les konkurransen", "Vi ser etter lokale alternativer, etablerte vaner og rommet markedet ennå ikke har fylt."),
            ("Gjør tilbudet lokalt relevant", "Budskap, dokumentasjon, pris og kundeløfte tilpasses det lokale kjøpere faktisk legger vekt på."),
            ("Velg veien inn", "Direktesalg, distributør, lokal partner, offentlig innkjøp eller en kombinasjon vurderes mot hverandre."),
            ("Åpne de første dørene", "Vi går fra skrivebordsinnsikt til samtaler med relevante kunder, partnere og beslutningstakere."),
            ("Test før dere bygger", "En avgrenset markedstest skal skape bevis, læring og et bedre beslutningsgrunnlag før større investeringer."),
            ("Beslutt og etabler", "Når markedet svarer, samler vi nødvendig hjelp til registrering, compliance, logistikk og lokal drift."),
        ],
        "note": "Ikke alle markeder eller oppdrag passer. Første mål er å finne ut om muligheten er verdt å forfølge.",
        "sources": "Datagrunnlag", "sources_title": "Tall med kontekst.", "sources_copy": "Befolkning per 1. januar 2025. Rangeringer fra World Happiness Report 2026 og Transparency International CPI 2025.",
        "cta": "Be om en vurdering", "cta_title": "Er {country} riktig neste marked?", "cta_copy": "Fortell kort om virksomheten og det dere vil undersøke. Hvis jeg ser et tydelig potensial og en god match, tar jeg personlig kontakt.", "cta_button": "Fortell om planene deres", "subject": "Markedsvurdering {country}",
    },
    "en": {
        "lang": "en", "back": "Nordic market entry", "route": "nordic-market-entry.html",
        "insight": "Market insight", "description": "Initial market insight on {country} for international companies considering Nordic market entry.",
        "attractive": "Why it matters", "opportunity": "Opportunity", "behaviour": "Buyer behaviour", "question": "First question",
        "actions": "Eight action points", "actions_title": "From market signal to decision.",
        "actions_intro": "Open the point most relevant to you. An engagement can begin in one place — and continues only when the next step adds clear value.",
        "points": [
            ("Find the market signal", "We test whether a concrete need, momentum or change makes the timing interesting."),
            ("Choose the right buyers", "We define segments and identify the companies or people most likely to respond."),
            ("Read the competition", "We look for local alternatives, established habits and the space the market has not yet filled."),
            ("Make the offer locally relevant", "Messaging, evidence, price and customer promise are adapted to what local buyers value."),
            ("Choose the route in", "Direct sales, distributor, local partner, public procurement or a combination are compared."),
            ("Open the first doors", "We move from desk research to conversations with relevant customers, partners and decision-makers."),
            ("Test before you build", "A focused market test creates evidence, learning and a stronger basis for investment decisions."),
            ("Decide and establish", "When the market responds, we bring together the support needed for registration, compliance, logistics and local operations."),
        ],
        "note": "Not every market or assignment is a fit. The first goal is to decide whether the opportunity is worth pursuing.",
        "sources": "Data basis", "sources_title": "Numbers with context.", "sources_copy": "Population at 1 January 2025. Rankings from the World Happiness Report 2026 and Transparency International CPI 2025.",
        "cta": "Request an assessment", "cta_title": "Is {country} the right next market?", "cta_copy": "Tell us briefly about the company and what you want to explore. If I see clear potential and a strong fit, I will respond personally.", "cta_button": "Tell us about your plans", "subject": "Market assessment {country}",
    },
    "de": {
        "lang": "de", "back": "Nordischer Markteintritt", "route": "nordischer-markteintritt.html",
        "insight": "Markteinblick", "description": "Erster Markteinblick zu {country} für deutschsprachige Unternehmen, die einen Eintritt in den nordischen Markt erwägen.",
        "attractive": "Das Potenzial", "opportunity": "Chance", "behaviour": "Kaufverhalten", "question": "Erste Frage",
        "actions": "Acht Handlungspunkte", "actions_title": "Vom Marktsignal zur Entscheidung.",
        "actions_intro": "Öffnen Sie den Punkt, der für Sie am relevantesten ist. Eine Zusammenarbeit kann an einer Stelle beginnen — und wird nur fortgesetzt, wenn der nächste Schritt klaren Mehrwert schafft.",
        "points": [
            ("Das Marktsignal finden", "Wir prüfen, ob ein konkreter Bedarf, eine Dynamik oder eine Veränderung den Zeitpunkt interessant macht."),
            ("Die richtigen Käufer wählen", "Wir grenzen Segmente ein und identifizieren Unternehmen oder Personen, die am ehesten reagieren."),
            ("Den Wettbewerb verstehen", "Wir betrachten lokale Alternativen, etablierte Gewohnheiten und noch unbesetzte Marktpositionen."),
            ("Das Angebot lokal relevant machen", "Botschaft, Nachweise, Preis und Kundennutzen werden an die Prioritäten lokaler Käufer angepasst."),
            ("Den Eintrittsweg wählen", "Direktvertrieb, Distributor, lokaler Partner, öffentliche Beschaffung oder eine Kombination werden verglichen."),
            ("Die ersten Türen öffnen", "Wir gehen von der Recherche zu Gesprächen mit relevanten Kunden, Partnern und Entscheidern über."),
            ("Testen, bevor Sie aufbauen", "Ein fokussierter Markttest schafft Belege, Lernfortschritt und eine bessere Investitionsgrundlage."),
            ("Entscheiden und etablieren", "Wenn der Markt reagiert, bündeln wir die nötige Unterstützung für Registrierung, Compliance, Logistik und lokalen Betrieb."),
        ],
        "note": "Nicht jeder Markt und nicht jede Aufgabe passt. Zuerst klären wir, ob sich die Chance weiterzuverfolgen lohnt.",
        "sources": "Datengrundlage", "sources_title": "Zahlen im Kontext.", "sources_copy": "Bevölkerung zum 1. Januar 2025. Rankings aus World Happiness Report 2026 und Transparency International CPI 2025.",
        "cta": "Bewertung anfragen", "cta_title": "Ist {country} der richtige nächste Markt?", "cta_copy": "Beschreiben Sie kurz Ihr Unternehmen und Ihr Vorhaben. Wenn ich klares Potenzial und eine gute Passung sehe, melde ich mich persönlich.", "cta_button": "Pläne beschreiben", "subject": "Marktbewertung {country}",
    },
}

COUNTRIES = {
    "danmark": {"flag":"🇩🇰", "names":{"dk":"Danmark","no":"Danmark","en":"Denmark","de":"Dänemark"}, "stats":["6.0m","#3","#1","EU"],
        "titles":{"dk":"Et lille marked med korte veje til beslutninger.","no":"Et nært marked med korte veier til beslutninger.","en":"A compact market with short paths to decisions.","de":"Ein kompakter Markt mit kurzen Entscheidungswegen."},
        "leads":{"dk":"Danmark kombinerer høj tillid, digital modenhed og hurtige kommercielle beslutningsveje.","no":"For norske virksomheter er Danmark et nært EU-marked, men språk, pris og kjøpsvaner krever lokal tilpasning.","en":"Denmark offers high trust, digital maturity and direct access to Nordic decision-makers.","de":"Dänemark verbindet hohes Vertrauen, digitale Reife und direkten Zugang zu nordischen Entscheidern."}},
    "norge": {"flag":"🇳🇴", "names":{"dk":"Norge","no":"Norge","en":"Norway","de":"Norwegen"}, "stats":["5.6m","#6","#4","NOK"],
        "titles":{"dk":"Høj købekraft. Et marked på egne vilkår.","no":"Høy kjøpekraft. Et marked på egne vilkår.","en":"High purchasing power. A market on its own terms.","de":"Hohe Kaufkraft. Ein Markt mit eigenen Regeln."},
        "leads":{"dk":"Norge kombinerer høj købekraft og digital modenhed, men står uden for EU.","no":"Norge er hjemmemarkedet. Innsikten brukes som referanse når norske virksomheter vurderer resten av Norden.","en":"Norway combines high purchasing power and digital maturity, but sits outside the EU.","de":"Norwegen verbindet hohe Kaufkraft und digitale Reife, gehört jedoch nicht zur EU."}},
    "sverige": {"flag":"🇸🇪", "names":{"dk":"Sverige","no":"Sverige","en":"Sweden","de":"Schweden"}, "stats":["10.6m","#5","#6","SEK"],
        "titles":{"dk":"Nordens største enkeltmarked.","no":"Nordens største enkeltmarked.","en":"The Nordic region’s largest single market.","de":"Der größte Einzelmarkt der nordischen Region."},
        "leads":{"dk":"Sverige giver skala og digital modenhed, men også flere regioner, konkurrenter og beslutningslag.","no":"Sverige gir norske virksomheter nordisk skala, men krever tydelig segmentering og lokal posisjonering.","en":"Sweden offers Nordic scale and digital maturity, with more regions, competitors and decision layers.","de":"Schweden bietet nordische Größenordnung und digitale Reife, aber auch mehr Regionen und Wettbewerb."}},
    "finland": {"flag":"🇫🇮", "names":{"dk":"Finland","no":"Finland","en":"Finland","de":"Finnland"}, "stats":["5.6m","#1","#2","EUR"],
        "titles":{"dk":"Teknologisk modenhed med sit eget sprog og tempo.","no":"Teknologisk modenhet med eget språk og tempo.","en":"Technological maturity with its own language and pace.","de":"Technologische Reife mit eigener Sprache und eigenem Tempo."},
        "leads":{"dk":"Finland er et stabilt EU- og euromarked med stærk teknologi- og industrikompetence.","no":"Finland er et stabilt EU- og euromarked der dokumentasjon, språkvalg og lokal relevans teller.","en":"Finland is a stable EU and euro market with strong technology and industrial capabilities.","de":"Finnland ist ein stabiler EU- und Euromarkt mit starker Technologie- und Industriekompetenz."}},
    "island": {"flag":"🇮🇸", "names":{"dk":"Island","no":"Island","en":"Iceland","de":"Island"}, "stats":["0.4m","#2","#10","ISK"],
        "titles":{"dk":"Et kompakt marked, hvor relationer bliver synlige.","no":"Et kompakt marked der relasjoner blir synlige.","en":"A compact market where relationships are visible.","de":"Ein kompakter Markt, in dem Beziehungen sichtbar werden."},
        "leads":{"dk":"Island kan være interessant som specialmarked eller kontrolleret test.","no":"Island kan være et interessant nisjemarked eller en kontrollert markedstest.","en":"Iceland can be attractive as a specialist market or a controlled market test.","de":"Island kann als Spezialmarkt oder kontrollierter Markttest interessant sein."}},
}

SLUGS = {"dk":{"danmark":"marked-danmark","norge":"marked-norge","sverige":"marked-sverige","finland":"marked-finland","island":"marked-island"},"no":{"danmark":"marked-danmark","norge":"marked-norge","sverige":"marked-sverige","finland":"marked-finland","island":"marked-island"},"en":{"danmark":"market-denmark","norge":"market-norway","sverige":"market-sweden","finland":"market-finland","island":"market-iceland"},"de":{"danmark":"markt-daenemark","norge":"markt-norwegen","sverige":"markt-schweden","finland":"markt-finnland","island":"markt-island"}}

def page(locale, key):
    t, c = LOCALES[locale], COUNTRIES[key]
    country, slug = c["names"][locale], SLUGS[locale][key]
    alternates = "".join(f'<a href="/{loc}/{SLUGS[loc][key]}.html" lang="{LOCALES[loc]["lang"]}"'+(' aria-current="page"' if loc == locale else '')+f'>{"DK" if loc=="dk" else loc.upper()}</a>' for loc in LOCALES)
    points = "".join(f'<details class="access-point"><summary><span class="access-number">{i:02}</span><span class="access-title">{escape(title)}</span><span class="access-plus">+</span></summary><p class="access-copy">{escape(copy)}</p></details>' for i,(title,copy) in enumerate(t["points"],1))
    stats = "".join(f'<div><strong>{value}</strong><span>{label}</span></div>' for value,label in zip(c["stats"],["population","happiness","trust","currency"]))
    return f'''<!doctype html><html lang="{t['lang']}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{escape(t['description'].format(country=country))}"><title>{country} — {t['insight']} · Waltham</title><link rel="canonical" href="https://waltham.no/{locale}/{slug}.html">{''.join(f'<link rel="alternate" hreflang="{LOCALES[l]["lang"]}" href="https://waltham.no/{l}/{SLUGS[l][key]}.html">' for l in LOCALES)}<link rel="stylesheet" href="../css/styles.css"><link rel="stylesheet" href="../css/nordic-country.css"></head><body class="country-page"><header class="country-nav"><div class="wrap"><a class="logo" href="index.html">Waltham<span>.</span><small>Consulting</small></a><nav class="language-switcher" aria-label="Language">{alternates}</nav><a class="back" href="{t['route']}">← {t['back']}</a></div></header><main><section class="country-hero"><div class="wrap country-hero-grid"><div><p class="eyebrow">{t['insight']} · {country}</p><h1>{c['titles'][locale]}</h1><p class="hero-lead">{c['leads'][locale]}</p></div><div class="flag-panel"><span class="flag-large" aria-hidden="true">{c['flag']}</span><div class="quick-stats">{stats}</div></div></div></section><section class="section wrap"><div class="country-story"><div><p class="label">{t['attractive']}</p><h2>{c['titles'][locale]}</h2></div><div class="copy"><p>{c['leads'][locale]}</p><p>{t['points'][3][1]}</p></div></div><div class="market-lenses"><article><p class="label">{t['opportunity']}</p><h3>{country}</h3><p>{t['points'][0][1]}</p></article><article><p class="label">{t['behaviour']}</p><h3>{t['points'][3][0]}</h3><p>{t['points'][3][1]}</p></article><article><p class="label">{t['question']}</p><h3>{t['points'][4][0]}</h3><p>{t['points'][4][1]}</p></article></div></section><section class="section access-section"><div class="wrap"><div class="access-head"><div><p class="label">{t['actions']}</p><h2>{t['actions_title']}</h2></div><p>{t['actions_intro']}</p></div><div class="access-grid">{points}</div><p class="access-note">{t['note']}</p></div></section><section class="section source-band"><div class="wrap"><div><p class="label">{t['sources']}</p><h2>{t['sources_title']}</h2></div><div class="source-list"><p>{t['sources_copy']}</p><p><a href="https://www.nordicstatistics.org/news/the-nordic-population-2025/">Nordic Statistics</a> · <a href="https://www.worldhappiness.report/ed/2026/executive-summary-happiness-and-social-media/">World Happiness Report</a> · <a href="https://www.transparency.org/en/cpi/2025/index/cpv">Transparency International</a></p></div></div></section><section class="section country-cta"><div class="wrap"><p class="label">{t['cta']}</p><h2>{t['cta_title'].format(country=country)}</h2><p>{t['cta_copy']}</p><a class="button primary" href="mailto:waltham@me.com?subject={quote(t['subject'].format(country=country))}">{t['cta_button']}</a></div></section></main><script src="/js/cookie-notice.js"></script></body></html>'''

for locale in ("no", "en", "de"):
    (ROOT / locale).mkdir(exist_ok=True)
    for key in COUNTRIES:
        (ROOT / locale / f"{SLUGS[locale][key]}.html").write_text(page(locale,key), encoding="utf-8")

MARKET = {
"dk": ["Nordisk markedsindgang","Fra hjemmemarked til nordiske kunder.","Waltham hjælper virksomheder med at undersøge, teste og åbne et nyt nordisk marked — med én indgang og de rette lokale specialister bagved.","Undersøg jeres potentiale","Marked før administration","Et organisationsnummer skaber ikke kunder.","Vi begynder med markedet, kunderne og den kommercielle vej. Når muligheden er bevist, samler vi hjælp til selskabsform, moms, logistik, lokal kommunikation og drift.","Fem markeder · fem veje ind","Se markedsindsigt","Tre veje til markedet","Via en lokal partner","Direkte B2B-salg","Direkte til forbrugere","Fra mulighed til marked","Forstå","Vælg","Test","Etablér","Forespørg om en samtale","Hvilket nordisk marked vil I undersøge?","Fortæl om jeres markedsplan"],
"no": ["Nordisk markedsinngang","Fra Norge til nordiske kunder.","Waltham hjelper norske virksomheter med å undersøke, teste og åpne Danmark og andre nordiske markeder — med én inngang og riktige lokale spesialister bak.","Undersøk potensialet deres","Marked før administrasjon","Et organisasjonsnummer skaper ikke kunder.","Vi begynner med markedet, kundene og den kommersielle veien. Når muligheten er bevist, samler vi hjelp til selskapsform, mva., logistikk, lokal kommunikasjon og drift.","Fem markeder · fem veier inn","Se markedsinnsikt","Tre veier til markedet","Via en lokal partner","Direkte B2B-salg","Direkte til forbrukere","Fra mulighet til marked","Forstå","Velg","Test","Etabler","Be om en samtale","Hvilket nordisk marked vil dere undersøke?","Fortell om markedsplanen deres"],
"en": ["Nordic market entry","From your home market to Nordic customers.","Waltham helps international companies research, test and enter the Nordic markets — through one front door with the right local specialists behind it.","Explore your potential","Market before administration","A company registration does not create customers.","We begin with the market, buyers and commercial route. Once the opportunity is proven, we assemble support for company setup, VAT, logistics, local communication and operations.","Five markets · five routes in","View market insight","Three routes to market","Through a local partner","Direct B2B sales","Direct to consumer","From opportunity to market","Understand","Choose","Test","Establish","Request a conversation","Which Nordic market do you want to explore?","Tell us about your market plan"],
"de": ["Nordischer Markteintritt","Vom deutschsprachigen Heimatmarkt zu nordischen Kunden.","Waltham hilft deutschsprachigen Unternehmen, nordische Märkte zu untersuchen, zu testen und zu erschließen — mit einem Ansprechpartner und den richtigen lokalen Spezialisten.","Potenzial untersuchen","Markt vor Administration","Eine Registrierung schafft noch keine Kunden.","Wir beginnen mit Markt, Käufern und kommerziellem Eintrittsweg. Wenn die Chance belegt ist, bündeln wir Unterstützung für Gründung, Umsatzsteuer, Logistik, lokale Kommunikation und Betrieb.","Fünf Märkte · fünf Eintrittswege","Markteinblick ansehen","Drei Wege in den Markt","Über einen lokalen Partner","Direkter B2B-Vertrieb","Direkt an Verbraucher","Von der Chance zum Markt","Verstehen","Wählen","Testen","Etablieren","Gespräch anfragen","Welchen nordischen Markt möchten Sie untersuchen?","Marktplan beschreiben"],
}

def market_page(locale):
    t, m = LOCALES[locale], MARKET[locale]
    cards = "".join(f'<a class="country-card" href="{SLUGS[locale][k]}.html"><span class="country-flag" aria-hidden="true">{COUNTRIES[k]["flag"]}</span><h3>{COUNTRIES[k]["names"][locale]}</h3><span class="country-link">{m[8]} →</span></a>' for k in COUNTRIES)
    switch = "".join(f'<a href="/{l}/{LOCALES[l]["route"]}" lang="{LOCALES[l]["lang"]}"'+(' aria-current="page"' if l==locale else '')+f'>{"DK" if l=="dk" else l.upper()}</a>' for l in LOCALES)
    paths = "".join(f'<article><b>{i:02}</b><h3>{m[13+i]}</h3><p>{t["points"][[0,4,6,7][i-1]][1]}</p></article>' for i in range(1,5))
    return f'''<!doctype html><html lang="{t['lang']}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{m[2]}"><title>{m[0]} — Waltham</title><link rel="canonical" href="https://waltham.no/{locale}/{t['route']}">{''.join(f'<link rel="alternate" hreflang="{LOCALES[l]["lang"]}" href="https://waltham.no/{l}/{LOCALES[l]["route"]}">' for l in LOCALES)}<link rel="stylesheet" href="../css/styles.css"><link rel="stylesheet" href="../css/nordic-country.css"></head><body class="market-page"><header class="market-nav"><div class="wrap"><a class="logo" href="index.html">Waltham<span>.</span><small>Consulting</small></a><nav class="language-switcher" aria-label="Language">{switch}</nav><a class="back" href="index.html">← Waltham</a></div></header><main><section class="market-hero"><div class="wrap"><div class="market-hero-copy"><p class="eyebrow">{m[0]}</p><h1>{m[1]}</h1><p class="hero-lead">{m[2]}</p><div class="buttons"><a class="button primary" href="#kontakt">{m[3]}</a><a class="button ghost" href="#markeder">{m[7]}</a></div><div class="hero-flags">{''.join(f'<div class="nordic-country"><span>{COUNTRIES[k]["flag"]}</span>{COUNTRIES[k]["names"][locale]}</div>' for k in COUNTRIES)}</div></div><img class="market-hero-art" src="../assets/nordic-market-entry-globe.png" alt="Nordic market entry"></div></section><section class="section wrap"><div class="market-intro"><div><p class="label">{m[4]}</p><h2>{m[5]}</h2></div><div class="copy"><p>{m[6]}</p></div></div></section><section class="section market-proof" id="markeder"><div class="wrap"><div class="market-proof-head"><div><p class="label">{m[7]}</p><h2>{m[0]}</h2></div></div><div class="country-cards">{cards}</div></div></section><section class="section wrap"><p class="label">{m[9]}</p><h2>{m[13]}</h2><div class="routes-grid"><article><span>01</span><h3>{m[10]}</h3><p>{t['points'][4][1]}</p></article><article><span>02</span><h3>{m[11]}</h3><p>{t['points'][5][1]}</p></article><article><span>03</span><h3>{m[12]}</h3><p>{t['points'][3][1]}</p></article></div></section><section class="section path"><div class="wrap"><p class="label">{m[13]}</p><h2>{t['actions_title']}</h2><div class="path-grid">{paths}</div></div></section><section class="section market-cta" id="kontakt"><div class="wrap contact-grid"><div><p class="label">{m[18]}</p><h2>{m[19]}</h2><p>{t['cta_copy']}</p></div><div><a class="button primary" href="mailto:waltham@me.com?subject={quote(m[0])}">{m[20]}</a></div></div></section></main><footer><div class="wrap"><a class="logo" href="index.html">Waltham<span>.</span></a><p>{m[0]} · AI Enablement · Waltham Insight.</p></div></footer><script src="/js/cookie-notice.js"></script></body></html>'''

INSIGHT = {
"dk":["Waltham Insight","AI kan analysere næsten alt. Nogle gange må man stadig spørge mennesker.","Vi kombinerer eksisterende data, AI-understøttet research og målrettede undersøgelser, når nye svar faktisk kan ændre en beslutning.","Research først","Begynd med det, der allerede kan vides.","Vi finder mønstre, udvikler den stærkeste hypotese og bruger menneskelig verifikation dér, hvor den tilfører ny information.","Tal med os om et spørgsmål"],
"no":["Waltham Insight","AI kan analysere nesten alt. Noen ganger må man fortsatt spørre mennesker.","Vi kombinerer eksisterende data, AI-støttet research og målrettede undersøkelser når nye svar faktisk kan endre en beslutning.","Research først","Begynn med det som allerede kan vites.","Vi finner mønstre, utvikler den sterkeste hypotesen og bruker menneskelig verifisering der den tilfører ny informasjon.","Snakk med oss om et spørsmål"],
"en":["Waltham Insight","AI can analyse almost anything. Sometimes you still need to ask people.","We combine existing data, AI-supported research and focused surveys when new answers can genuinely change a decision.","Research first","Start with what can already be known.","We find patterns, develop the strongest hypothesis and use human verification where it adds new information.","Tell us about your question"],
"de":["Waltham Insight","KI kann fast alles analysieren. Manchmal muss man trotzdem Menschen fragen.","Wir verbinden vorhandene Daten, KI-gestützte Recherche und gezielte Befragungen, wenn neue Antworten eine Entscheidung wirklich verändern können.","Recherche zuerst","Mit dem beginnen, was bereits bekannt sein kann.","Wir erkennen Muster, entwickeln die stärkste Hypothese und nutzen menschliche Verifizierung dort, wo sie neue Information schafft.","Frage beschreiben"],
}

def insight_page(locale):
    t, i = LOCALES[locale], INSIGHT[locale]
    route = {"dk":"waltham-insight.html","no":"waltham-insight.html","en":"waltham-insight.html","de":"waltham-insight.html"}[locale]
    switch = "".join(f'<a href="/{l}/waltham-insight.html" lang="{LOCALES[l]["lang"]}"'+(' aria-current="page"' if l==locale else '')+f'>{"DK" if l=="dk" else l.upper()}</a>' for l in LOCALES)
    return f'''<!doctype html><html lang="{t['lang']}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{i[2]}"><title>{i[0]} — Waltham</title><link rel="canonical" href="https://waltham.no/{locale}/{route}">{''.join(f'<link rel="alternate" hreflang="{LOCALES[l]["lang"]}" href="https://waltham.no/{l}/waltham-insight.html">' for l in LOCALES)}<link rel="stylesheet" href="../css/styles.css"></head><body><header class="market-nav"><div class="wrap"><a class="logo" href="index.html">Waltham<span>.</span><small>Consulting</small></a><nav class="language-switcher" aria-label="Language">{switch}</nav><a class="back" href="index.html">← Waltham</a></div></header><main><section class="market-hero"><div class="wrap"><div class="market-hero-copy"><p class="eyebrow">{i[0]}</p><h1>{i[1]}</h1><p class="hero-lead">{i[2]}</p><div class="buttons"><a class="button primary" href="#kontakt">{i[6]}</a></div></div><img class="market-hero-art" src="../assets/waltham-insight-human-verification.png" alt="Human verification and market research"></div></section><section class="section wrap"><div class="market-intro"><div><p class="label">{i[3]}</p><h2>{i[4]}</h2></div><div class="copy"><p>{i[5]}</p><p>{t['points'][6][1]}</p></div></div><div class="challenge-grid"><article><span>01</span><h3>Research</h3><p>{t['points'][0][1]}</p></article><article><span>02</span><h3>Hypothesis</h3><p>{t['points'][2][1]}</p></article><article><span>03</span><h3>Verification</h3><p>{i[5]}</p></article></div></section><section class="section country-cta" id="kontakt"><div class="wrap"><p class="label">{i[0]}</p><h2>{i[1]}</h2><p>{t['cta_copy']}</p><a class="button primary" href="mailto:waltham@me.com?subject=Waltham%20Insight">{i[6]}</a></div></section></main><script src="/js/cookie-notice.js"></script></body></html>'''

for locale in ("no", "en", "de"):
    (ROOT / locale / LOCALES[locale]["route"]).write_text(market_page(locale), encoding="utf-8")
    (ROOT / locale / "waltham-insight.html").write_text(insight_page(locale), encoding="utf-8")

# Reuse the Danish master's responsive page-specific design in every locale.
for source, target in [("dk/nordisk-markedsindgang.html","css/nordic-market-entry.css"),("dk/waltham-insight.html","css/waltham-insight.css")]:
    source_html = (ROOT / source).read_text(encoding="utf-8")
    (ROOT / target).write_text("\n".join(re.findall(r"<style>(.*?)</style>", source_html, re.S)), encoding="utf-8")
for locale in ("no", "en", "de"):
    market_path = ROOT / locale / LOCALES[locale]["route"]
    market_html = market_path.read_text(encoding="utf-8").replace("../css/nordic-country.css", "../css/nordic-market-entry.css")
    market_path.write_text(market_html, encoding="utf-8")
    insight_path = ROOT / locale / "waltham-insight.html"
    insight_html = insight_path.read_text(encoding="utf-8").replace('</head>', '<link rel="stylesheet" href="../css/waltham-insight.css"><link rel="stylesheet" href="../css/waltham-insight-localized.css"></head>', 1)
    insight_path.write_text(insight_html, encoding="utf-8")

# Keep the Danish master copy intact; only add page-equivalent language routing.
for key in COUNTRIES:
    path = ROOT / "dk" / f"{SLUGS['dk'][key]}.html"
    html = path.read_text(encoding="utf-8")
    switch = '<nav class="language-switcher" aria-label="Sprog"><a href="/dk/'+SLUGS['dk'][key]+'.html" aria-current="page">DK</a><a href="/no/'+SLUGS['no'][key]+'.html">NO</a><a href="/en/'+SLUGS['en'][key]+'.html">EN</a><a href="/de/'+SLUGS['de'][key]+'.html">DE</a></nav>'
    if 'aria-label="Sprog"' not in html:
        html = html.replace('<a class="back" href="nordisk-markedsindgang.html">', switch+'<a class="back" href="nordisk-markedsindgang.html">', 1)
    path.write_text(html, encoding="utf-8")

for name, links in {
    "nordisk-markedsindgang.html": ["/dk/nordisk-markedsindgang.html","/no/nordisk-markedsinngang.html","/en/nordic-market-entry.html","/de/nordischer-markteintritt.html"],
    "waltham-insight.html": ["/dk/waltham-insight.html","/no/waltham-insight.html","/en/waltham-insight.html","/de/waltham-insight.html"],
}.items():
    path = ROOT / "dk" / name
    html = path.read_text(encoding="utf-8")
    switch = '<nav class="language-switcher" aria-label="Sprog">'+''.join(f'<a href="{href}"'+(' aria-current="page"' if i==0 else '')+f'>{label}</a>' for i,(href,label) in enumerate(zip(links,["DK","NO","EN","DE"])))+'</nav>'
    if 'aria-label="Sprog"' not in html:
        html = html.replace('<a class="back" href="index.html">', switch+'<a class="back" href="index.html">', 1)
    path.write_text(html, encoding="utf-8")

sitemap_path = ROOT / "sitemap.xml"
sitemap = sitemap_path.read_text(encoding="utf-8")
new_urls = []
for locale in ("no", "en", "de"):
    new_urls.extend([f"https://waltham.no/{locale}/{LOCALES[locale]['route']}", f"https://waltham.no/{locale}/waltham-insight.html"])
    new_urls.extend(f"https://waltham.no/{locale}/{SLUGS[locale][key]}.html" for key in COUNTRIES)
entries = "".join(f"  <url><loc>{url}</loc></url>\n" for url in new_urls if f"<loc>{url}</loc>" not in sitemap)
if entries:
    sitemap = sitemap.replace("</urlset>", entries + "</urlset>")
    sitemap_path.write_text(sitemap, encoding="utf-8")
