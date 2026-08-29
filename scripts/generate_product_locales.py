#!/usr/bin/env python3
"""Generate the localized product hubs and keep homepage entry points aligned."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

locales = {
    "no": {
        "file": "produkter.html", "html": "nb", "title": "Produkter og priser", "back": "← Tilbake til Waltham",
        "hero": "Fire steder<br>å <em>begynne.</em>", "lead": "Velg området som best beskriver det dere trenger å forstå, beslutte, forbedre eller forklare.",
        "families": [("Insight", "Forstå markedet og menneskene"), ("Nordic", "Finn veien inn i et nytt marked"), ("AI", "Sett teknologien i praktisk arbeid"), ("Studio", "Forklar og presenter det tydelig")],
        "headings": ["Hva vet vi — og hva mener mennesker faktisk?", "Er det nye markedet verdt å gå inn i?", "Hvor kan AI skape reell verdi i arbeidet?", "Hvordan gjør vi det forståelig og presentabelt?"],
        "descs": ["Research, markedsanalyse, meningsmålinger og menneskelig verifikasjon.", "Markedsvurdering, kundekartlegging og praktisk inngang til Norden.", "Praktisk AI-rådgivning, automatisering og avgrensede tester.", "Digitale sider, rapporter og beslutningsmateriale som gjør komplekse ting tydelige."],
        "cta": "Ikke sikker på kategorien?", "cta_h": "Begynn med spørsmålet — ikke produktnavnet.", "cta_p": "Beskriv kort hva dere trenger å forstå, beslutte, forbedre eller forklare. Vi foreslår det minste meningsfulle stedet å begynne.", "contact": "Send en fortrolig forespørsel",
        "menu": "Produkter", "all": "Se alle konkrete produkter og priser", "overview": "Se produktfamilier, leveranser og priser →",
        "pulse_read": "Les om modellen →", "family_links": [("waltham-insight.html", "Utforsk Waltham Insight →"), ("nordisk-markedsinngang.html", "Utforsk Waltham Nordic →"), ("index.html#tjenester", "Utforsk Waltham AI →"), ("mailto:waltham@me.com?subject=Waltham%20Studio", "Fortell hva dere skal forklare →")],
    },
    "en": {
        "file": "products.html", "html": "en", "title": "Products & pricing", "back": "← Back to Waltham",
        "hero": "Four places<br>to <em>begin.</em>", "lead": "Choose the area that best describes what you need to understand, decide, improve or explain.",
        "families": [("Insight", "Understand markets and people"), ("Nordic", "Find a route into a new market"), ("AI", "Put technology to practical work"), ("Studio", "Explain and present it clearly")],
        "headings": ["What do we know — and what do people actually think?", "Is the new market worth entering?", "Where can AI create real value at work?", "How do we make it clear and presentable?"],
        "descs": ["Research, market analysis, polling and human verification.", "Market assessment, customer mapping and practical Nordic market entry.", "Practical AI advice, automation and focused tests.", "Digital pages, reports and decision material that make complex things clear."],
        "cta": "Not sure about the category?", "cta_h": "Begin with the question — not the product name.", "cta_p": "Briefly describe what you need to understand, decide, improve or explain. We will suggest the smallest meaningful place to begin.", "contact": "Send a confidential enquiry",
        "menu": "Products", "all": "See all specific products and prices", "overview": "See product families, deliverables and pricing →",
        "pulse_read": "Read about the model →", "family_links": [("waltham-insight.html", "Explore Waltham Insight →"), ("nordic-market-entry.html", "Explore Waltham Nordic →"), ("index.html#tjenester", "Explore Waltham AI →"), ("mailto:waltham@me.com?subject=Waltham%20Studio", "Tell us what you need to explain →")],
    },
    "de": {
        "file": "produkte.html", "html": "de", "title": "Produkte & Preise", "back": "← Zurück zu Waltham",
        "hero": "Vier Wege,<br>um zu <em>beginnen.</em>", "lead": "Wählen Sie den Bereich, der am besten beschreibt, was Sie verstehen, entscheiden, verbessern oder erklären möchten.",
        "families": [("Insight", "Märkte und Menschen verstehen"), ("Nordic", "Den Weg in einen neuen Markt finden"), ("AI", "Technologie praktisch einsetzen"), ("Studio", "Klar erklären und präsentieren")],
        "headings": ["Was wissen wir — und was denken Menschen wirklich?", "Lohnt sich der Eintritt in den neuen Markt?", "Wo kann KI in der Arbeit echten Wert schaffen?", "Wie machen wir es verständlich und präsentabel?"],
        "descs": ["Recherche, Marktanalyse, Meinungsumfragen und menschliche Verifikation.", "Marktbewertung, Kundenmapping und praktischer Eintritt in nordische Märkte.", "Praktische KI-Beratung, Automatisierung und fokussierte Tests.", "Digitale Seiten, Berichte und Entscheidungsmaterial, das Komplexes klar macht."],
        "cta": "Nicht sicher, welche Kategorie passt?", "cta_h": "Beginnen Sie mit der Frage — nicht mit dem Produktnamen.", "cta_p": "Beschreiben Sie kurz, was Sie verstehen, entscheiden, verbessern oder erklären möchten. Wir schlagen den kleinsten sinnvollen Ausgangspunkt vor.", "contact": "Vertrauliche Anfrage senden",
        "menu": "Produkte", "all": "Alle konkreten Produkte und Preise ansehen", "overview": "Produktfamilien, Leistungen und Preise ansehen →",
        "pulse_read": "Mehr über das Modell →", "family_links": [("waltham-insight.html", "Waltham Insight entdecken →"), ("nordischer-markteintritt.html", "Waltham Nordic entdecken →"), ("index.html#leistungen", "Waltham AI entdecken →"), ("mailto:waltham@me.com?subject=Waltham%20Studio", "Beschreiben Sie, was erklärt werden soll →")],
    },
}

products = {
    0: [("Insight Discovery", "Research", "Price after scoping"), ("Market Intelligence Sprint", "Market", "From DKK 18,000"), ("Human Verification", "People", "Price by sample and method"), ("Waltham Population Pulse", "In development", "Pilot price by agreement"), ("PR Case Sprint", "Evidence", "From DKK 22,500")],
    1: [("Opportunity Check", "First assessment", "DKK 4,800"), ("Nordic Market Sprint", "Market basis", "From DKK 18,000"), ("Strategic Value Case", "Decision", "From DKK 35,000"), ("Nordic Market Entry", "Execution", "Price by market and scope")],
    2: [("AI Opportunity Review", "Scoping", "DKK 9,500"), ("AI Enablement Sprint", "Pilot", "Price after scoping"), ("Knowledge & Agent Workflow", "System", "Price by complexity")],
    3: [("Rapid Presentation Site", "Presentation", "DKK 955"), ("Professional Website", "Business", "From DKK 7,500"), ("Digital Decision Report", "Report", "Price by content")],
}

anchors = ("insight", "nordic", "ai", "studio")

for lang, c in locales.items():
    nav = "".join(f'<a href="#{anchors[i]}"><b>0{i+1}</b><strong>{name}</strong><span>{desc}</span></a>' for i, (name, desc) in enumerate(c["families"]))
    sections = []
    for i, anchor in enumerate(anchors):
        cards = "".join(
            f'<article class="family-product-featured"><span>{kind}</span><h3>{name}</h3><p>{c["descs"][i]}</p><b>{price}</b><a href="ai-augmented-market-estimation.html">{c["pulse_read"]}</a></article>'
            if name == "Waltham Population Pulse"
            else f'<article><span>{kind}</span><h3>{name}</h3><p>{c["descs"][i]}</p><b>{price}</b></article>'
            for name, kind, price in products[i]
        )
        family_href, family_label = c["family_links"][i]
        sections.append(f'<section class="product-family-section{" family-alt" if i % 2 else ""}" id="{anchor}"><div class="wrap"><div class="family-heading"><div><p class="label">Waltham {c["families"][i][0]}</p><h2>{c["headings"][i]}</h2></div><p>{c["descs"][i]}</p></div><div class="family-products">{cards}</div><a class="family-link" href="{family_href}">{family_label}</a></div></section>')
    page = f'''<!doctype html><html lang="{c["html"]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Waltham {c["title"]}: Insight, Nordic, AI and Studio."><title>{c["title"]} — Waltham</title><link rel="stylesheet" href="../css/styles.css"><link rel="stylesheet" href="../css/brand-logo.css"></head><body class="product-hub-page"><header class="product-hub-nav"><div class="wrap"><a class="logo" href="index.html">Waltham<span>.</span><small>Consulting</small></a><a class="back" href="index.html">{c["back"]}</a></div></header><main><section class="product-hub-hero"><div class="wrap"><p class="eyebrow">{c["title"]}</p><h1>{c["hero"]}</h1><p>{c["lead"]}</p></div></section><nav class="product-family-nav wrap" aria-label="{c["title"]}">{nav}</nav>{''.join(sections)}<section class="product-hub-cta"><div class="wrap"><div><p class="label">{c["cta"]}</p><h2>{c["cta_h"]}</h2><p>{c["cta_p"]}</p></div><a class="button primary" href="index.html#kontakt">{c["contact"]}</a></div></section></main><footer><div class="wrap"><a class="logo" href="index.html">Waltham<span>.</span><small>Consulting</small></a><p>Insight · Nordic · AI · Studio</p></div></footer><script src="/js/cookie-notice.js"></script></body></html>'''
    (ROOT / lang / c["file"]).write_text(page, encoding="utf-8")

    home = ROOT / lang / "index.html"
    html = home.read_text(encoding="utf-8")
    old_targets = {"no": "#produkter", "en": "#products", "de": "#produkte"}
    if lang == "en" and c["file"] not in html:
        html = html.replace('<a href="nordic-market-entry.html">Nordics</a>', '<a href="nordic-market-entry.html">Nordics</a><a href="products.html">Products</a>', 1)
    html = re.sub(rf'<a(?: class="product-nav")? href="{old_targets[lang]}">[^<]*</a>', f'<a href="{c["file"]}">{c["menu"]}</a>', html, count=1)
    html = html.replace(f'href="{old_targets[lang]}">', f'href="{c["file"]}">', 1)
    if 'product-family-preview' not in html:
        preview = '<div class="product-family-preview">' + ''.join(f'<a href="{c["file"]}#{anchors[i]}"><span>0{i+1}</span><h3>{name}</h3><p>{desc}.</p></a>' for i, (name, desc) in enumerate(c["families"])) + f'</div><p class="product-overview-link"><a href="{c["file"]}">{c["overview"]}</a></p><details class="legacy-products"><summary>{c["all"]}</summary>'
        html = html.replace('<div class="product-grid">', preview + '<div class="product-grid">', 1)
        html = re.sub(r'(<p class="product-footnote">.*?</p>)(\s*</div></section>)', r'\1</details>\2', html, count=1, flags=re.DOTALL)
    home.write_text(html, encoding="utf-8")

sitemap = ROOT / "sitemap.xml"
xml = sitemap.read_text(encoding="utf-8")
for lang, c in locales.items():
    url = f'https://waltham.no/{lang}/{c["file"]}' if lang == "no" else f'https://waltham.dk/{lang}/{c["file"]}'
    if url not in xml:
        xml = xml.replace('</urlset>', f'  <url><loc>{url}</loc></url>\n</urlset>')
sitemap.write_text(xml, encoding="utf-8")
