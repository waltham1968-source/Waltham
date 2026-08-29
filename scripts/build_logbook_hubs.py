#!/usr/bin/env python3
"""Build localized logbook indexes and connect them to navigation and articles."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

entries = {
    "dk": [
        ("29. august 2026 · Nyhedsprodukt", "Hvad mener folk lige nu?", "En hurtig og billig befolkningspuls, hvor AI finder spørgsmålet, og rigtige mennesker leverer svaret.", "ai-augmented-market-estimation.html"),
        ("28. august 2026 · AI", "AI er ikke magi. Det er et meget godt arkivskab.", "Kvaliteten af svaret afhænger af materialet, strukturen og spørgsmålet.", "ai-er-ikke-magi.html"),
        ("27. juli 2026 · Systemer", "Hvorfor en veltrimmet sejlbåd er en god model for en virksomhed", "Små korrektioner, klar retning og løbende opmærksomhed.", "veltrimmet-sejlbaad.html"),
        ("27. juli 2026 · AI", "Den bedste automatisering kan være at fjerne processen", "Undersøg først, om arbejdsgangen overhovedet bør eksistere.", "bedste-automatisering.html"),
        ("27. juli 2026 · Momentum", "Det ene fører til det andet", "Små handlinger kan skabe den næste mulighed.", "det-ene-foerer-til-det-andet.html"),
        ("27. juli 2026 · Samarbejde", "Samarbejde skal give mening for begge parter", "Start småt, skab synlig værdi og fortsæt, når det virker.", "samarbejde-skal-give-mening.html"),
    ],
    "no": [
        ("29. august 2026 · Nyhetsprodukt", "Hva mener folk akkurat nå?", "En rask og rimelig befolkningspuls der AI finner spørsmålet, og virkelige mennesker gir svaret.", "ai-augmented-market-estimation.html"),
        ("28. august 2026 · AI", "AI er ikke magi. Det er et svært godt arkivskap.", "Kvaliteten på svaret avhenger av materialet, strukturen og spørsmålet.", "ai-er-ikke-magi.html"),
        ("27. juli 2026 · Systemer", "Hvorfor en veltrimmet seilbåt er en god modell for en virksomhet", "Små korrigeringer, tydelig retning og løpende oppmerksomhet.", "../veltrimmet-seilbat.html"),
        ("27. juli 2026 · AI", "Den beste automatiseringen kan være å fjerne prosessen", "Undersøk først om arbeidsflyten i det hele tatt bør eksistere.", "beste-automatisering.html"),
        ("27. juli 2026 · Momentum", "Det ene fører til det andre", "Små handlinger kan skape den neste muligheten.", "det-ene-forer-til-det-andre.html"),
        ("27. juli 2026 · Samarbeid", "Samarbeid skal gi mening for begge parter", "Begynn smått, skap synlig verdi og fortsett når det virker.", "samarbeid-skal-gi-mening.html"),
    ],
    "en": [
        ("29 August 2026 · News product", "What do people think right now?", "A fast and affordable population pulse where AI finds the question and real people provide the answer.", "ai-augmented-market-estimation.html"),
        ("28 August 2026 · AI", "AI isn’t magic. It’s a very good filing cabinet.", "The quality of the answer depends on the material, the structure and the question.", "ai-is-not-magic.html"),
        ("27 July 2026 · Systems", "Why a well-trimmed sailboat is a good model for a business", "Small corrections, clear direction and continuous attention.", "well-trimmed-sailboat.html"),
        ("27 July 2026 · AI", "The best automation may be to remove the process", "First ask whether the workflow should exist at all.", "best-automation.html"),
        ("27 July 2026 · Momentum", "One thing leads to another", "Small actions can create the next opportunity.", "one-thing-leads-to-another.html"),
        ("27 July 2026 · Collaboration", "Collaboration should make sense for both sides", "Start small, create visible value and continue when it works.", "collaboration-should-make-sense.html"),
    ],
    "de": [
        ("29. August 2026 · Nachrichtenprodukt", "Was denken die Menschen gerade?", "Ein schneller und kostengünstiger Bevölkerungspuls: KI findet die Frage, echte Menschen liefern die Antwort.", "ai-augmented-market-estimation.html"),
        ("28. August 2026 · KI", "KI ist keine Magie. Sie ist ein sehr guter Aktenschrank.", "Die Qualität der Antwort hängt vom Material, der Struktur und der Frage ab.", "../en/ai-is-not-magic.html"),
        ("27. Juli 2026 · Systeme", "Warum ein gut getrimmtes Segelboot ein gutes Unternehmensmodell ist", "Kleine Korrekturen, klare Richtung und kontinuierliche Aufmerksamkeit.", "../en/well-trimmed-sailboat.html"),
        ("27. Juli 2026 · KI", "Die beste Automatisierung kann darin bestehen, den Prozess abzuschaffen", "Zuerst prüfen, ob der Arbeitsablauf überhaupt existieren sollte.", "../en/best-automation.html"),
        ("27. Juli 2026 · Zusammenarbeit", "Zusammenarbeit sollte für beide Seiten sinnvoll sein", "Klein anfangen, sichtbaren Wert schaffen und fortfahren, wenn es funktioniert.", "../en/collaboration-should-make-sense.html"),
    ],
}

copy = {
    "dk": ("da", "Logbog", "Noter fra arbejdet med at skabe bevægelse.", "Observationer, erfaringer og idéer om virksomheder, teknologi, markeder og mennesker — samlet ét sted.", "Læs notatet", "Alle noter er skrevet undervejs. Kort, konkret og uden konsulentsprog."),
    "no": ("nb", "Loggbok", "Notater fra arbeidet med å skape bevegelse.", "Observasjoner, erfaringer og ideer om virksomheter, teknologi, markeder og mennesker — samlet på ett sted.", "Les notatet", "Alle notater er skrevet underveis. Kort, konkret og uten konsulentspråk."),
    "en": ("en", "Journal", "Notes from the work of creating momentum.", "Observations, experience and ideas about business, technology, markets and people — collected in one place.", "Read the entry", "Written along the way. Short, concrete and without consulting jargon."),
    "de": ("de", "Logbuch", "Notizen aus der Arbeit, Dinge in Bewegung zu bringen.", "Beobachtungen, Erfahrungen und Ideen zu Unternehmen, Technologie, Märkten und Menschen — an einem Ort gesammelt.", "Eintrag lesen", "Unterwegs geschrieben. Kurz, konkret und ohne Beraterjargon."),
}

names = {"dk":"logbog.html", "no":"loggbok.html", "en":"journal.html", "de":"logbuch.html"}
home_labels = {"dk":"Logbog", "no":"Loggbok", "en":"Journal", "de":"Logbuch"}
public_url = lambda lang: f'https://waltham.no/{lang}/{names[lang]}' if lang == "no" else f'https://waltham.dk/{lang}/{names[lang]}'

for lang, items in entries.items():
    html_lang, label, heading, lead, action, note = copy[lang]
    cards = "".join(f'<article><span>{date}</span><h2>{title}</h2><p>{desc}</p><a href="{href}">{action} →</a></article>' for date,title,desc,href in items)
    switches = "".join(f'<a href="/{code}/{names[code]}" lang="{copy[code][0]}"' + (' aria-current="page"' if code==lang else '') + f'>{code.upper()}</a>' for code in ("dk","no","en","de"))
    page = f'''<!doctype html><html lang="{html_lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{lead}"><title>{label} — Waltham</title><link rel="canonical" href="{public_url(lang)}">''' + "".join(f'<link rel="alternate" hreflang="{copy[c][0]}" href="{public_url(c)}">' for c in ("dk","no","en","de")) + f'''<link rel="stylesheet" href="../css/styles.css"><link rel="stylesheet" href="../css/brand-logo.css"><link rel="stylesheet" href="../css/logbook.css?v=5"></head><body class="logbook-page"><header class="logbook-nav"><div class="wrap"><a class="logo" href="index.html">Waltham<span>.</span><small>Consulting</small></a><nav class="language-switcher" aria-label="Language">{switches}</nav><a class="back" href="index.html">← Waltham</a></div></header><main><section class="logbook-hero"><div class="wrap"><p class="eyebrow">Waltham {label}</p><h1>{heading}</h1><p>{lead}</p></div></section><section class="logbook-index"><div class="wrap"><div class="logbook-register"><b>{label}</b><span>01 — fortløbende</span></div><p class="logbook-note">{note}</p><div class="logbook-list">{cards}</div></div></section></main><footer><div class="wrap"><a class="logo" href="index.html">Waltham<span>.</span><small>Consulting</small></a><p>{label} · Waltham Consulting</p></div></footer><script src="/js/cookie-notice.js"></script></body></html>'''
    (ROOT/lang/names[lang]).write_text(page, encoding="utf-8")

# Add the permanent logbook destination to each home-page menu.
for lang in ("dk","no","en","de"):
    path = ROOT/lang/"index.html"
    html = path.read_text(encoding="utf-8")
    if names[lang] not in html:
        html = re.sub(r'(<nav id="menu"[^>]*>)', rf'\1<a href="{names[lang]}">{home_labels[lang]}</a>', html, count=1)
    path.write_text(html, encoding="utf-8")

# Give every existing journal article a stable way back to its archive.
article_sets = {
    "dk": [x[3] for x in entries["dk"]],
    "no": [x[3] for x in entries["no"] if not x[3].startswith("../")],
    "en": [x[3] for x in entries["en"]],
}
back_labels = {"dk":"← Tilbage til Logbogen", "no":"← Tilbake til Loggboken", "en":"← Back to the Journal"}
all_labels = {"dk":"Se alle noter i Logbogen", "no":"Se alle notater i Loggboken", "en":"See every entry in the Journal"}
for lang, filenames in article_sets.items():
    for filename in filenames:
        path = ROOT/lang/filename
        html = path.read_text(encoding="utf-8")
        html = re.sub(r'<a class="back" href="index\.html#innsikt">.*?</a>', f'<a class="back" href="{names[lang]}">{back_labels[lang]}</a>', html, count=1)
        if 'article-entry-nav' not in html:
            html = re.sub(r'</article>', f'<nav class="article-entry-nav" aria-label="Logbook"><a href="{names[lang]}">{all_labels[lang]} →</a></nav></article>', html, count=1)
        path.write_text(html, encoding="utf-8")

# The Norwegian sailing article predates the locale folders but belongs here.
norwegian_sailing = ROOT / "veltrimmet-seilbat.html"
html = norwegian_sailing.read_text(encoding="utf-8")
html = re.sub(r'<a class="back" href="index\.html#innsikt">.*?</a>', '<a class="back" href="/no/loggbok.html">← Tilbake til Loggboken</a>', html, count=1)
if 'article-entry-nav' not in html:
    html = re.sub(r'</article>', '<nav class="article-entry-nav" aria-label="Logbook"><a href="/no/loggbok.html">Se alle notater i Loggboken →</a></nav></article>', html, count=1)
norwegian_sailing.write_text(html, encoding="utf-8")

groups = [
    (("dk","ai-augmented-market-estimation.html"),("no","ai-augmented-market-estimation.html"),("en","ai-augmented-market-estimation.html"),("de","ai-augmented-market-estimation.html")),
    (("dk","ai-er-ikke-magi.html"),("no","ai-er-ikke-magi.html"),("en","ai-is-not-magic.html")),
    (("dk","veltrimmet-sejlbaad.html"),("root","veltrimmet-seilbat.html"),("en","well-trimmed-sailboat.html")),
    (("dk","bedste-automatisering.html"),("no","beste-automatisering.html"),("en","best-automation.html")),
    (("dk","det-ene-foerer-til-det-andet.html"),("no","det-ene-forer-til-det-andre.html"),("en","one-thing-leads-to-another.html")),
    (("dk","samarbejde-skal-give-mening.html"),("no","samarbeid-skal-gi-mening.html"),("en","collaboration-should-make-sense.html")),
]
url_for = lambda locale, filename: f'/{filename}' if locale == "root" else f'/{locale}/{filename}'
path_for = lambda locale, filename: ROOT/filename if locale == "root" else ROOT/locale/filename
lang_code = {"dk":"DK", "no":"NO", "root":"NO", "en":"EN", "de":"DE"}
for group in groups:
    switch = '<nav class="article-language" aria-label="Language">' + ''.join(f'<a href="{url_for(locale, filename)}">{lang_code[locale]}</a>' for locale,filename in group) + '</nav>'
    for locale, filename in group:
        path = path_for(locale, filename)
        html = path.read_text(encoding="utf-8")
        if 'article-actions' not in html:
            html = re.sub(r'(<a class="back".*?</a>)', rf'<div class="article-actions">{switch}\1</div>', html, count=1)
        path.write_text(html, encoding="utf-8")

sequences = {
    "dk": [("dk",x[3]) for x in entries["dk"]],
    "no": [("no",x[3]) if not x[3].startswith("../") else ("root","veltrimmet-seilbat.html") for x in entries["no"]],
    "en": [("en",x[3]) for x in entries["en"]],
}
direction = {"dk":("← Nyere note","Alle noter","Ældre note →"),"no":("← Nyere notat","Alle notater","Eldre notat →"),"en":("← Newer entry","All entries","Older entry →")}
for lang, sequence in sequences.items():
    newer_label, all_label, older_label = direction[lang]
    for index, (locale, filename) in enumerate(sequence):
        parts = [f'<a rel="prev" href="{url_for(*sequence[index-1])}">{newer_label}</a>' if index else '<span></span>', f'<a class="all" href="/{lang}/{names[lang]}">{all_label}</a>', f'<a rel="next" href="{url_for(*sequence[index+1])}">{older_label}</a>' if index < len(sequence)-1 else '<span></span>']
        path = path_for(locale, filename)
        html = path.read_text(encoding="utf-8")
        html = re.sub(r'<nav class="article-entry-nav".*?</nav>', '<nav class="article-entry-nav" aria-label="Logbook">'+''.join(parts)+'</nav>', html, count=1, flags=re.DOTALL)
        path.write_text(html, encoding="utf-8")
