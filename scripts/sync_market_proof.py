#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

PROOF = {
    "no": {
        "path": "no/nordisk-markedsinngang.html", "label": "Fem markeder · fem veier inn",
        "title": "Et av verdens mest tillitsbaserte markedsområder.",
        "line": "Alle fem nordiske land er blant verdens ti høyest rangerte — både på livstilfredshet og lav opplevd offentlig korrupsjon.",
        "link": "Se markedsinnsikt", "people": "innbyggere", "largest": "Nordens største marked", "compact": "kompakt marked",
        "metric": "livstilfredshet · korrupsjon",
        "note": "Rangeringer: World Happiness Report 2026 og Transparency International Corruption Perceptions Index 2025. Befolkning: 1. januar 2025. Indikatorene peker på stabile samfunn med høy tillit — ikke på at alle produkter automatisk har et marked.",
    },
    "en": {
        "path": "en/nordic-market-entry.html", "label": "Five markets · five routes in",
        "title": "One of the world’s highest-trust market regions.",
        "line": "All five Nordic countries rank among the world’s top ten — both for life satisfaction and low perceived public-sector corruption.",
        "link": "View market insight", "people": "residents", "largest": "the Nordic region’s largest market", "compact": "compact market",
        "metric": "life satisfaction · corruption",
        "note": "Rankings: World Happiness Report 2026 and Transparency International Corruption Perceptions Index 2025. Population: 1 January 2025. The indicators point to stable, high-trust societies — not to every product automatically having a market.",
    },
    "de": {
        "path": "de/nordischer-markteintritt.html", "label": "Fünf Märkte · fünf Eintrittswege",
        "title": "Eine der vertrauensstärksten Marktregionen der Welt.",
        "line": "Alle fünf nordischen Länder zählen weltweit zu den zehn bestplatzierten — sowohl bei der Lebenszufriedenheit als auch bei geringer wahrgenommener Korruption im öffentlichen Sektor.",
        "link": "Markteinblick ansehen", "people": "Einwohner", "largest": "größter Markt der nordischen Region", "compact": "kompakter Markt",
        "metric": "Lebenszufriedenheit · Korruption",
        "note": "Rankings: World Happiness Report 2026 und Transparency International Corruption Perceptions Index 2025. Bevölkerung: 1. Januar 2025. Die Indikatoren weisen auf stabile Gesellschaften mit hohem Vertrauen hin — nicht darauf, dass jedes Produkt automatisch einen Markt hat.",
    },
}

COUNTRIES = [
    ("danmark", "🇩🇰", "#3 · #1", "people"),
    ("norge", "🇳🇴", "#6 · #4", "people"),
    ("sverige", "🇸🇪", "#5 · #6", "largest"),
    ("finland", "🇫🇮", "#1 · #2", "people"),
    ("island", "🇮🇸", "#2 · #10", "compact"),
]

POPULATIONS = {
    "no": ["6,0 mill.", "5,6 mill.", "10,6 mill.", "5,6 mill.", "0,4 mill."],
    "en": ["6.0m", "5.6m", "10.6m", "5.6m", "0.4m"],
    "de": ["6,0 Mio.", "5,6 Mio.", "10,6 Mio.", "5,6 Mio.", "0,4 Mio."],
}

NAMES = {
    "no": ["Danmark", "Norge", "Sverige", "Finland", "Island"],
    "en": ["Denmark", "Norway", "Sweden", "Finland", "Iceland"],
    "de": ["Dänemark", "Norwegen", "Schweden", "Finnland", "Island"],
}

SLUGS = {
    "no": ["marked-danmark", "marked-norge", "marked-sverige", "marked-finland", "marked-island"],
    "en": ["market-denmark", "market-norway", "market-sweden", "market-finland", "market-iceland"],
    "de": ["markt-daenemark", "markt-norwegen", "markt-schweden", "markt-finnland", "markt-island"],
}

for locale, t in PROOF.items():
    cards = []
    for i, (_, flag, ranks, descriptor) in enumerate(COUNTRIES):
        cards.append(f'<a class="country-card" href="{SLUGS[locale][i]}.html"><span class="country-flag" aria-hidden="true">{flag}</span><h3>{NAMES[locale][i]}</h3><span class="country-stat"><strong>{POPULATIONS[locale][i]}</strong>{t[descriptor]}</span><span class="country-stat"><strong>{ranks}</strong>{t["metric"]}</span><span class="country-link">{t["link"]} →</span></a>')
    section = f'<section class="section market-proof" id="markeder"><div class="wrap"><div class="market-proof-head"><div><p class="label">{t["label"]}</p><h2>{t["title"]}</h2></div><p class="proof-line">{t["line"]}</p></div><div class="country-cards">{"".join(cards)}</div><p class="proof-note">{t["note"]}</p></div></section>'
    path = ROOT / t["path"]
    html = path.read_text(encoding="utf-8")
    html, count = re.subn(r'<section class="section market-proof".*?</section>(?=<section class="section wrap">)', section, html, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"Could not replace market proof in {path}")
    path.write_text(html, encoding="utf-8")
