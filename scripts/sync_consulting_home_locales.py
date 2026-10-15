#!/usr/bin/env python3
"""Keep the four consulting homepages structurally identical.

The Danish homepage is the source of truth.  The script deliberately uses
exact replacements so markup, accessibility attributes and layout stay in
sync while every public-facing sentence remains localised.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RUM = re.compile(r'\n?<script async id="netlify-rum-container".*?</script>', re.S)


LOCALES = {
    "no": {
        "html_lang": "nb",
        "title": "Waltham Consulting | Strategi, analyse og teknologi",
        "description": "Waltham Consulting hjelper virksomheter med strategi, analyse og praktisk bruk av AI. Fortrolig samarbeid med vekt på kundens egne systemer og selvstendighet.",
        "og_description": "Strategi, analyse og teknologi. Rådgivning og praktiske løsninger med vekt på kundens kontroll og selvstendighet.",
        "schema_description": "Strategisk rådgivning, markedsanalyse og praktisk bruk av AI i kundens egne systemer. Virksomhetens faglige røtter går tilbake til 2001.",
        "home_label": "Waltham Consulting, forsiden",
        "menu_button": "Meny",
        "menu_label": "Hovedmeny",
        "language_label": "Språk",
        "nav": ["Rådgivning", "Arbeidsform", "Om Waltham", "Kunnskap og perspektiver", "Sparring og pris", "Kontakt"],
        "knowledge": "/no/kunnskapssenter.html",
        "sparring": "/no/sparringspartner.html",
        "visibility": "/no/ai-visibility-check.html",
        "journal": "/no/loggbok.html",
        "privacy": "/no/personvern.html",
        "success": "/no/henvendelse-mottatt.html",
        "eyebrow": "Strategi · Analyse · Teknologi",
        "history": "<strong>Røtter tilbake til 2001.</strong><br>Erfaring med markeder, mennesker og teknologi.",
        "tagline": "Rådgivning og praktisk utvikling",
        "hero_1": "Vi hjelper virksomheter med å kvalifisere beslutninger, utvikle ideer og ta teknologi i bruk i det daglige arbeidet.",
        "hero_2": "Vi arbeider fortrolig og så langt som mulig i kundens egne systemer. Målet er løsninger som virksomheten selv kan forstå, bruke og drive videre.",
        "hero_link": "Våre arbeidsområder →",
        "areas_label": "Arbeidsområder",
        "areas_title": "Fra forretningsmessig avklaring<br>til praktisk anvendelse.",
        "cards": [
            ("01 · Strategi og analyse", "Beslutninger og utvikling", "Markedsinnsikt, vurdering av ideer og fortrolig sparring om virksomhetens muligheter. Vi hjelper med å avklare oppgaven og prioritere neste steg."),
            ("02 · AI og arbeidsprosesser", "Teknologi i praksis", "Vi hjelper med å forenkle arbeidet med kunnskap, dokumenter og kommunikasjon. Avgrensede løsninger utvikles med utgangspunkt i virksomhetens eksisterende systemer."),
            ("03 · AI Visibility", "Digital identitet og synlighet", "Vi arbeider med sammenhengen mellom det virksomheten sier, det andre sier, og det den leverer. Et tydelig, dokumentert grunnlag for å bli funnet og vurdert."),
        ],
        "visibility_link": "Les om AI-synlighet →",
        "work_label": "Arbeidsform",
        "work_title": "Forankret hos kunden.",
        "work_lead": "Oppgave, omfang og pris avtales fra starten. Vi arbeider i oversiktlige etapper og trekker inn spesialister når oppgaven krever det.",
        "principles": [
            ("Egne systemer", "Vi tar så langt som mulig utgangspunkt i deres egne kontoer, verktøy og arbeidsprosesser. Tilganger, databehandling og eventuelle eksterne tjenester avklares som en del av oppgaven."),
            ("Kontroll og eierskap", "Deres materiale, kontoer og oppsett skal være under deres kontroll. Vi avklarer rettigheter og leverandørvilkår, slik at det er tydelig hva dere eier, og hva løsningen er avhengig av."),
            ("Overlevering og opplæring", "Dokumentasjon, opplæring og støtte avtales etter behov. Målet er at dere selv kan håndtere den daglige bruken. Behov for vedlikehold og videre hjelp beskrives åpent."),
        ],
        "discretion": "<strong>Diskresjon er en del av samarbeidet.</strong> Fortrolig materiale deles bare etter avtale og i den utstrekning oppgaven krever. Kundenavn, oppgaver og resultater brukes bare offentlig etter uttrykkelig avtale.",
        "experience_label": "Erfaringen bak Waltham",
        "experience_title": "Fra idé til virksomhet.",
        "history_paragraphs": [
            "Waltham bygger på Nikolai Walthams erfaring med å utvikle ideer og etablere virksomheter. Først kom en ski- og sykkelbutikk, deretter SmartSense, som arbeidet med gassdeteksjon og automatisering, og i 2001 analysevirksomheten InFact.",
            "I InFact sto Nikolai Waltham bak idé, metode og teknologi samt navn, posisjonering og markedsføring. Virksomheten ble bygget rundt egenutviklet teknologi for automatiserte telefonundersøkelser og vokste gjennom løsningens anvendelighet, kunderelasjoner og anbefalinger, uten betalt reklame. Etter salget i 2024 fortsetter InFact under nye eiere – en virksomhet som etter 25 år lever videre uten sin grunnlegger.",
            "Navnet Waltham &amp; Co AS kom til i 2003. I dag brukes erfaringene med markedsanalyse, teknologi og virksomhetsbygging i rådgivning og praktisk utvikling for andre virksomheter.",
            "Waltham har base i Nyborg og samarbeider med eksterne spesialister når det er behov for supplerende kompetanse.",
        ],
        "insight_label": "Kunnskap og perspektiver",
        "insight_title": "Utvalgte faglige bidrag.",
        "insight_text": "Artikler, modeller og eksempler om teknologi, kommunikasjon og forretningsutvikling. Vi publiserer når en problemstilling gir en innsikt som kan brukes i praksis. Kundeopplysninger offentliggjøres bare etter avtale.",
        "publication_links": ["Artikler og perspektiver →", "Kunnskapssenter →", "Historier og eksempler →", "AI Visibility Checker →"],
        "market_title": "Markedsinngang mellom Norge og Danmark",
        "market_text": "Praktisk sparring for virksomheter som vil forstå, teste eller etablere seg på den andre siden av Skagerrak.",
        "market_links": ["Danmark → Norge", "Norge → Danmark"],
        "contact_title": "En innledende samtale.",
        "contact_intro": "Skriv kort om oppgaven eller beslutningen dere står overfor. Vi svarer og avklarer om Waltham er den rette samarbeidspartneren.",
        "contact_muted": "Den første henvendelsen er uforpliktende. Omfang og pris avtales før arbeidet begynner.",
        "sparring_link": "Les om sparring og pris →",
        "form_title": "Kontakt Waltham",
        "bot": "Ikke fyll ut dette feltet:",
        "name_label": "Ditt navn *",
        "name_placeholder": "Ditt navn",
        "email_label": "Din e-post *",
        "email_placeholder": "navn@virksomhet.no",
        "site_label": "Virksomhetens nettsted (valgfritt)",
        "site_placeholder": "www.virksomhet.no",
        "about_label": "Hva gjelder henvendelsen? (valgfritt)",
        "about_placeholder": "Fortell kort hva du ønsker hjelp til.",
        "form_note": "Vi bruker bare opplysningene til å besvare og følge opp henvendelsen. Unngå forretningshemmeligheter og sensitive opplysninger i skjemaet.",
        "privacy_link": "Les om behandling av personopplysninger.",
        "send": "Send henvendelse →",
        "email_backup": "Foretrekker du e-post?",
        "email_direct": "Skriv direkte til Waltham",
        "privacy_footer": "Personvern",
        "dialog_script": "Start dialog om sparring",
    },
    "en": {
        "html_lang": "en",
        "title": "Waltham Consulting | Strategy, analysis and technology",
        "description": "Waltham Consulting helps companies with strategy, analysis and the practical use of AI. Confidential collaboration focused on the client's own systems and independence.",
        "og_description": "Strategy, analysis and technology. Advisory and practical solutions focused on client control and independence.",
        "schema_description": "Strategic advisory, market analysis and the practical use of AI in the client's own systems. The firm's professional roots go back to 2001.",
        "home_label": "Waltham Consulting, home",
        "menu_button": "Menu",
        "menu_label": "Main menu",
        "language_label": "Language",
        "nav": ["Advisory", "How we work", "About Waltham", "Knowledge and perspectives", "Advisory and pricing", "Contact"],
        "knowledge": "/en/knowledge-centre.html",
        "sparring": "/en/sparring-partner.html",
        "visibility": "/en/ai-visibility-check.html",
        "journal": "/en/journal.html",
        "privacy": "/en/privacy.html",
        "success": "/en/enquiry-received.html",
        "eyebrow": "Strategy · Analysis · Technology",
        "history": "<strong>Roots dating back to 2001.</strong><br>Experience with markets, people and technology.",
        "tagline": "Advisory and practical development",
        "hero_1": "We help companies strengthen decisions, develop ideas and put technology to use in everyday work.",
        "hero_2": "We work confidentially and, wherever possible, in the client's own systems. The aim is to create solutions the company can understand, use and continue to operate itself.",
        "hero_link": "Our areas of work →",
        "areas_label": "Areas of work",
        "areas_title": "From business clarification<br>to practical application.",
        "cards": [
            ("01 · Strategy and analysis", "Decisions and development", "Market insight, evaluation of ideas and confidential guidance on business opportunities. We help define the task and prioritise the next step."),
            ("02 · AI and workflows", "Technology in practice", "We help simplify work involving knowledge, documents and communication. Focused solutions are developed around the company's existing systems."),
            ("03 · AI Visibility", "Digital identity and visibility", "We work with the relationship between what a company says, what others say and what it delivers. A clear, documented basis for being found and evaluated."),
        ],
        "visibility_link": "Read about AI visibility →",
        "work_label": "How we work",
        "work_title": "Embedded with the client.",
        "work_lead": "The assignment, scope and price are agreed from the outset. We work in manageable stages and involve specialists when the task requires it.",
        "principles": [
            ("Your own systems", "Wherever possible, we work from your own accounts, tools and workflows. Access, data handling and any external services are clarified as part of the assignment."),
            ("Control and ownership", "Your material, accounts and configuration should remain under your control. We clarify rights and supplier terms so it is clear what you own and what the solution depends on."),
            ("Handover and training", "Documentation, training and support are agreed as needed. The aim is for you to manage everyday use yourselves. Maintenance needs and continued assistance are described openly."),
        ],
        "discretion": "<strong>Discretion is part of the collaboration.</strong> Confidential material is shared only by agreement and only to the extent required by the assignment. Client names, assignments and results are used publicly only with explicit permission.",
        "experience_label": "The experience behind Waltham",
        "experience_title": "From idea to company.",
        "history_paragraphs": [
            "Waltham is built on Nikolai Waltham's experience of developing ideas and establishing companies. First came a ski and bicycle shop, then SmartSense, which worked with gas detection and automation, and in 2001 the research company InFact.",
            "At InFact, Nikolai Waltham was responsible for the idea, method and technology as well as the name, positioning and marketing. The company was built around proprietary technology for automated telephone surveys and grew through the usefulness of the solution, client relationships and recommendations, without paid advertising. Following its sale in 2024, InFact continues under new ownership – a company that, after 25 years, lives on without its founder.",
            "The name Waltham &amp; Co AS was introduced in 2003. Today, the experience gained from market research, technology and company building is applied to advisory work and practical development for other companies.",
            "Waltham is based in Nyborg and works with external specialists when complementary expertise is needed.",
        ],
        "insight_label": "Knowledge and perspectives",
        "insight_title": "Selected professional contributions.",
        "insight_text": "Articles, models and examples on technology, communication and business development. We publish when a question produces insight that can be used in practice. Client information is made public only by agreement.",
        "publication_links": ["Articles and perspectives →", "Knowledge centre →", "Stories and examples →", "AI Visibility Checker →"],
        "market_title": "Market entry between Denmark and Norway",
        "market_text": "Practical guidance for companies seeking to understand, test or establish themselves on the other side of the Skagerrak.",
        "market_links": ["Denmark → Norway", "Norway → Denmark"],
        "contact_title": "An initial conversation.",
        "contact_intro": "Tell us briefly about the assignment or decision you are facing. We will respond and clarify whether Waltham is the right partner.",
        "contact_muted": "The initial enquiry is without obligation. Scope and price are agreed before work begins.",
        "sparring_link": "Read about advisory and pricing →",
        "form_title": "Contact Waltham",
        "bot": "Do not fill in this field:",
        "name_label": "Your name *",
        "name_placeholder": "Your name",
        "email_label": "Your email *",
        "email_placeholder": "name@company.com",
        "site_label": "Company website (optional)",
        "site_placeholder": "www.company.com",
        "about_label": "What is your enquiry about? (optional)",
        "about_placeholder": "Briefly describe what you would like help with.",
        "form_note": "We use this information only to answer and follow up on your enquiry. Do not include trade secrets or sensitive information in the form.",
        "privacy_link": "Read about our processing of personal data.",
        "send": "Send enquiry →",
        "email_backup": "Prefer email?",
        "email_direct": "Write directly to Waltham",
        "privacy_footer": "Privacy",
        "dialog_script": "Start a conversation about advisory",
    },
    "de": {
        "html_lang": "de",
        "title": "Waltham Consulting | Strategie, Analyse und Technologie",
        "description": "Waltham Consulting unterstützt Unternehmen bei Strategie, Analyse und der praktischen Nutzung von KI. Vertrauliche Zusammenarbeit mit Fokus auf den eigenen Systemen und der Selbstständigkeit des Kunden.",
        "og_description": "Strategie, Analyse und Technologie. Beratung und praktische Lösungen mit Fokus auf Kontrolle und Selbstständigkeit des Kunden.",
        "schema_description": "Strategische Beratung, Marktanalyse und praktische Nutzung von KI in den eigenen Systemen des Kunden. Die fachlichen Wurzeln des Unternehmens reichen bis 2001 zurück.",
        "home_label": "Waltham Consulting, Startseite",
        "menu_button": "Menü",
        "menu_label": "Hauptmenü",
        "language_label": "Sprache",
        "nav": ["Beratung", "Arbeitsweise", "Über Waltham", "Wissen und Perspektiven", "Beratung und Preis", "Kontakt"],
        "knowledge": "/de/wissenszentrum.html",
        "sparring": "/de/sparringspartner.html",
        "visibility": "/de/ai-visibility-check.html",
        "journal": "/de/logbuch.html",
        "privacy": "/de/datenschutz.html",
        "success": "/de/anfrage-erhalten.html",
        "eyebrow": "Strategie · Analyse · Technologie",
        "history": "<strong>Wurzeln bis ins Jahr 2001.</strong><br>Erfahrung mit Märkten, Menschen und Technologie.",
        "tagline": "Beratung und praktische Entwicklung",
        "hero_1": "Wir helfen Unternehmen, Entscheidungen zu fundieren, Ideen zu entwickeln und Technologie in der täglichen Arbeit einzusetzen.",
        "hero_2": "Wir arbeiten vertraulich und soweit wie möglich in den eigenen Systemen des Kunden. Ziel sind Lösungen, die das Unternehmen selbst verstehen, nutzen und weiterführen kann.",
        "hero_link": "Unsere Arbeitsbereiche →",
        "areas_label": "Arbeitsbereiche",
        "areas_title": "Von der geschäftlichen Klärung<br>zur praktischen Anwendung.",
        "cards": [
            ("01 · Strategie und Analyse", "Entscheidungen und Entwicklung", "Markteinblicke, Bewertung von Ideen und vertrauliche Beratung zu den Möglichkeiten des Unternehmens. Wir helfen, die Aufgabe zu klären und den nächsten Schritt zu priorisieren."),
            ("02 · KI und Arbeitsabläufe", "Technologie in der Praxis", "Wir helfen, die Arbeit mit Wissen, Dokumenten und Kommunikation zu vereinfachen. Klar abgegrenzte Lösungen werden auf Basis der bestehenden Systeme des Unternehmens entwickelt."),
            ("03 · AI Visibility", "Digitale Identität und Sichtbarkeit", "Wir arbeiten am Zusammenspiel dessen, was das Unternehmen sagt, was andere sagen und was es leistet. Eine klare, dokumentierte Grundlage, um gefunden und bewertet zu werden."),
        ],
        "visibility_link": "Mehr über KI-Sichtbarkeit →",
        "work_label": "Arbeitsweise",
        "work_title": "Beim Kunden verankert.",
        "work_lead": "Aufgabe, Umfang und Preis werden von Anfang an vereinbart. Wir arbeiten in überschaubaren Etappen und beziehen Spezialisten ein, wenn die Aufgabe es erfordert.",
        "principles": [
            ("Eigene Systeme", "Soweit wie möglich arbeiten wir mit Ihren eigenen Konten, Werkzeugen und Abläufen. Zugänge, Datenverarbeitung und mögliche externe Dienste werden als Teil der Aufgabe geklärt."),
            ("Kontrolle und Eigentum", "Ihre Materialien, Konten und Konfigurationen sollen unter Ihrer Kontrolle bleiben. Wir klären Rechte und Anbieterbedingungen, damit deutlich ist, was Ihnen gehört und wovon die Lösung abhängt."),
            ("Übergabe und Schulung", "Dokumentation, Schulung und Unterstützung werden nach Bedarf vereinbart. Ziel ist, dass Sie die tägliche Nutzung selbst handhaben können. Wartungsbedarf und weitere Hilfe werden offen beschrieben."),
        ],
        "discretion": "<strong>Diskretion ist Teil der Zusammenarbeit.</strong> Vertrauliche Unterlagen werden nur nach Vereinbarung und nur im für die Aufgabe notwendigen Umfang geteilt. Kundennamen, Aufgaben und Ergebnisse werden nur mit ausdrücklicher Zustimmung veröffentlicht.",
        "experience_label": "Die Erfahrung hinter Waltham",
        "experience_title": "Von der Idee zum Unternehmen.",
        "history_paragraphs": [
            "Waltham baut auf Nikolai Walthams Erfahrung in der Entwicklung von Ideen und der Gründung von Unternehmen auf. Den Anfang machte ein Ski- und Fahrradgeschäft, danach folgte SmartSense mit Gasdetektion und Automatisierung und im Jahr 2001 das Analyseunternehmen InFact.",
            "Bei InFact stand Nikolai Waltham hinter Idee, Methode und Technologie sowie Name, Positionierung und Marketing. Das Unternehmen wurde um eine eigene Technologie für automatisierte Telefonbefragungen aufgebaut und wuchs durch den praktischen Nutzen der Lösung, Kundenbeziehungen und Empfehlungen – ohne bezahlte Werbung. Nach dem Verkauf im Jahr 2024 wird InFact unter neuen Eigentümern fortgeführt: ein Unternehmen, das nach 25 Jahren ohne seinen Gründer weiterlebt.",
            "Der Name Waltham &amp; Co AS entstand 2003. Heute fließen die Erfahrungen aus Marktanalyse, Technologie und Unternehmensaufbau in Beratung und praktische Entwicklung für andere Unternehmen ein.",
            "Waltham hat seinen Sitz in Nyborg und arbeitet mit externen Spezialisten zusammen, wenn ergänzende Kompetenzen benötigt werden.",
        ],
        "insight_label": "Wissen und Perspektiven",
        "insight_title": "Ausgewählte fachliche Beiträge.",
        "insight_text": "Artikel, Modelle und Beispiele zu Technologie, Kommunikation und Geschäftsentwicklung. Wir veröffentlichen, wenn eine Fragestellung zu einer Erkenntnis führt, die sich praktisch nutzen lässt. Kundeninformationen werden nur nach Vereinbarung veröffentlicht.",
        "publication_links": ["Artikel und Perspektiven →", "Wissenszentrum →", "Geschichten und Beispiele →", "AI Visibility Checker →"],
        "market_title": "Markteintritt zwischen Dänemark und Norwegen",
        "market_text": "Praktische Beratung für Unternehmen, die den Markt auf der anderen Seite des Skagerrak verstehen, testen oder dort Fuß fassen möchten.",
        "market_links": ["Dänemark → Norwegen", "Norwegen → Dänemark"],
        "contact_title": "Ein erstes Gespräch.",
        "contact_intro": "Beschreiben Sie kurz die Aufgabe oder Entscheidung, vor der Sie stehen. Wir melden uns und klären, ob Waltham der richtige Partner ist.",
        "contact_muted": "Die erste Anfrage ist unverbindlich. Umfang und Preis werden vereinbart, bevor die Arbeit beginnt.",
        "sparring_link": "Mehr über Beratung und Preis →",
        "form_title": "Waltham kontaktieren",
        "bot": "Dieses Feld nicht ausfüllen:",
        "name_label": "Ihr Name *",
        "name_placeholder": "Ihr Name",
        "email_label": "Ihre E-Mail *",
        "email_placeholder": "name@unternehmen.de",
        "site_label": "Website des Unternehmens (optional)",
        "site_placeholder": "www.unternehmen.de",
        "about_label": "Worum geht es bei Ihrer Anfrage? (optional)",
        "about_placeholder": "Beschreiben Sie kurz, wobei Sie Unterstützung wünschen.",
        "form_note": "Wir verwenden diese Angaben nur, um Ihre Anfrage zu beantworten und nachzuverfolgen. Bitte geben Sie im Formular keine Geschäftsgeheimnisse oder sensiblen Informationen an.",
        "privacy_link": "Lesen Sie, wie wir personenbezogene Daten verarbeiten.",
        "send": "Anfrage senden →",
        "email_backup": "Bevorzugen Sie E-Mail?",
        "email_direct": "Direkt an Waltham schreiben",
        "privacy_footer": "Datenschutz",
        "dialog_script": "Gespräch über Beratung beginnen",
    },
}


def replace_once(html: str, old: str, new: str) -> str:
    if old not in html:
        raise ValueError(f"Source text not found: {old[:90]!r}")
    return html.replace(old, new, 1)


def localise(source: str, locale: str, data: dict) -> str:
    html = source
    html = replace_once(html, '<html lang="da">', f'<html lang="{data["html_lang"]}">')
    html = replace_once(html, '<title>Waltham Consulting | Strategi, analyse og teknologi</title>', f'<title>{data["title"]}</title>')
    html = replace_once(html, 'content="Waltham Consulting hjælper virksomheder med strategi, analyse og praktisk anvendelse af AI. Fortroligt samarbejde med fokus på kundens egne systemer og selvstændighed."', f'content="{data["description"]}"')
    html = replace_once(html, '<link rel="canonical" href="https://www.waltham.dk/dk/">', f'<link rel="canonical" href="https://www.waltham.dk/{locale}/">')
    html = replace_once(html, 'content="Waltham Consulting | Strategi, analyse og teknologi"', f'content="{data["title"]}"')
    html = replace_once(html, 'content="Strategi, analyse og teknologi. Rådgivning og praktiske løsninger med fokus på kundens kontrol og selvstændighed."', f'content="{data["og_description"]}"')
    html = replace_once(html, '<meta property="og:url" content="https://www.waltham.dk/dk/">', f'<meta property="og:url" content="https://www.waltham.dk/{locale}/">')
    html = replace_once(html, '"description":"Strategisk rådgivning, markedsanalyse og praktisk anvendelse af AI i kundens egne systemer. Virksomhedens faglige rødder går tilbage til 2001."', f'"description":"{data["schema_description"]}"')
    html = replace_once(html, 'href="/dk/" aria-label="Waltham Consulting, forsiden"', f'href="/{locale}/" aria-label="{data["home_label"]}"')
    html = replace_once(html, '>Menu</button>', f'>{data["menu_button"]}</button>')
    html = replace_once(html, 'aria-label="Hovedmenu"', f'aria-label="{data["menu_label"]}"')
    old_nav = '<a href="#fokus">Rådgivning</a><a href="#arbejdsform">Arbejdsform</a><a href="#om">Om Waltham</a><a href="/dk/videnscenter.html">Viden og perspektiver</a><a href="/dk/sparringspartner.html">Sparring og pris</a><a class="nav-cta" href="#kontakt">Kontakt</a>'
    new_nav = f'<a href="#fokus">{data["nav"][0]}</a><a href="#arbejdsform">{data["nav"][1]}</a><a href="#om">{data["nav"][2]}</a><a href="{data["knowledge"]}">{data["nav"][3]}</a><a href="{data["sparring"]}">{data["nav"][4]}</a><a class="nav-cta" href="#kontakt">{data["nav"][5]}</a>'
    html = replace_once(html, old_nav, new_nav)
    html = replace_once(html, 'aria-label="Sprog"', f'aria-label="{data["language_label"]}"')
    current = {code: (' aria-current="page"' if code == locale else '') for code in ('dk', 'no', 'en', 'de')}
    switcher = (
        f'<a href="/dk/"{current["dk"]}>DK</a>'
        f'<a href="/no/"{current["no"]}>NO</a>'
        f'<a href="/en/"{current["en"]}>EN</a>'
        f'<a href="/de/"{current["de"]}>DE</a>'
    )
    html = replace_once(html, '<a href="/dk/" aria-current="page">DK</a><a href="/no/">NO</a><a href="/en/">EN</a><a href="/de/">DE</a>', switcher)
    replacements = [
        ('Strategi · Analyse · Teknologi', data['eyebrow']),
        ('<strong>Rødder tilbage til 2001.</strong><br>Erfaring med markeder, mennesker og teknologi.', data['history']),
        ('Rådgivning og praktisk udvikling', data['tagline']),
        ('Vi hjælper virksomheder med at kvalificere beslutninger, udvikle idéer og tage teknologi i brug i det daglige arbejde.', data['hero_1']),
        ('Vi arbejder fortroligt og så vidt muligt i kundens egne systemer. Målet er løsninger, som virksomheden selv kan forstå, bruge og drive videre.', data['hero_2']),
        ('Vores arbejdsområder →', data['hero_link']),
        ('Arbejdsområder', data['areas_label']),
        ('Fra forretningsmæssig afklaring<br>til praktisk anvendelse.', data['areas_title']),
    ]
    for old, new in replacements:
        html = replace_once(html, old, new)
    dk_cards = [
        ('01 · Strategi og analyse', 'Beslutninger og udvikling', 'Markedsindsigt, vurdering af idéer og fortrolig sparring om virksomhedens muligheder. Vi hjælper med at afklare opgaven og prioritere næste skridt.'),
        ('02 · AI og arbejdsgange', 'Teknologi i praksis', 'Vi hjælper med at forenkle arbejdet med viden, dokumenter og kommunikation. Afgrænsede løsninger udvikles med udgangspunkt i virksomhedens eksisterende systemer.'),
        ('03 · AI Visibility', 'Digital identitet og synlighed', 'Vi arbejder med sammenhængen mellem det, virksomheden siger, det, andre siger, og det, den leverer. Et tydeligt, dokumenteret grundlag for at blive fundet og vurderet.'),
    ]
    for old, new in zip(dk_cards, data['cards']):
        for a, b in zip(old, new):
            html = replace_once(html, a, b)
    html = replace_once(html, 'href="/dk/ai-synlighed-fyn.html"', f'href="{data["visibility"]}"')
    html = replace_once(html, 'Læs om AI-synlighed →', data['visibility_link'])
    html = replace_once(html, '<p class="label">Arbejdsform</p>', f'<p class="label">{data["work_label"]}</p>')
    html = replace_once(html, 'Forankret hos kunden.', data['work_title'])
    html = replace_once(html, 'Opgave, omfang og pris aftales fra begyndelsen. Vi arbejder i overskuelige etaper og inddrager specialister, når opgaven kræver det.', data['work_lead'])
    dk_principles = [
        ('Egne systemer', 'Vi tager så vidt muligt udgangspunkt i jeres egne konti, værktøjer og arbejdsgange. Adgange, datahåndtering og eventuelle eksterne tjenester afklares som en del af opgaven.'),
        ('Kontrol og ejerskab', 'Jeres materiale, konti og opsætning skal være under jeres kontrol. Vi afklarer rettigheder og leverandørvilkår, så det er tydeligt, hvad I ejer, og hvad løsningen afhænger af.'),
        ('Overdragelse og oplæring', 'Dokumentation, oplæring og støtte aftales efter behov. Målet er, at I selv kan håndtere den daglige brug. Behov for vedligeholdelse og fortsat hjælp beskrives åbent.'),
    ]
    for old, new in zip(dk_principles, data['principles']):
        for a, b in zip(old, new):
            html = replace_once(html, a, b)
    html = replace_once(html, '<strong>Diskretion er en del af samarbejdet.</strong> Fortroligt materiale deles kun efter aftale og i det omfang, opgaven kræver. Kundenavne, opgaver og resultater bruges kun offentligt efter udtrykkelig aftale.', data['discretion'])
    html = replace_once(html, 'Erfaringen bag Waltham', data['experience_label'])
    html = replace_once(html, 'Fra idé til virksomhed.', data['experience_title'])
    dk_history = [
        'Waltham bygger på Nikolai Walthams erfaring med at udvikle idéer og etablere virksomheder. Først kom en ski- og cykelforretning, derefter SmartSense, der arbejdede med gasdetektion og automatisering, og i 2001 analysevirksomheden InFact.',
        'I InFact stod Nikolai Waltham bag idé, metode og teknologi samt navn, positionering og markedsføring. Virksomheden blev bygget omkring egenudviklet teknologi til automatiserede telefonundersøgelser og voksede gennem løsningens anvendelighed, kunderelationer og anbefalinger, uden betalt reklame. Efter salget i 2024 fortsætter InFact under nye ejere – en virksomhed, der efter 25 år lever videre uden sin grundlægger.',
        'Navnet Waltham &amp; Co AS kom til i 2003. I dag bruges erfaringerne med markedsanalyse, teknologi og virksomhedsopbygning i rådgivning og praktisk udvikling for andre virksomheder.',
        'Waltham har base i Nyborg og samarbejder med eksterne specialister, når der er behov for supplerende kompetencer.',
    ]
    for old, new in zip(dk_history, data['history_paragraphs']):
        html = replace_once(html, old, new)
    html = replace_once(html, 'Viden og perspektiver', data['insight_label'])
    html = replace_once(html, 'Udvalgte faglige bidrag.', data['insight_title'])
    html = replace_once(html, 'Artikler, modeller og eksempler om teknologi, kommunikation og forretningsudvikling. Vi publicerer, når en problemstilling giver anledning til en indsigt, der kan bruges i praksis. Kundeoplysninger offentliggøres kun efter aftale.', data['insight_text'])
    old_links = '<a href="/dk/logbog.html">Artikler og perspektiver →</a><a href="/dk/videnscenter.html">Videnscenter →</a><a href="/dk/videnscenter.html#historier">Historier og eksempler →</a><a href="/dk/ai-visibility-check">AI Visibility Checker →</a>'
    new_links = f'<a href="{data["journal"]}">{data["publication_links"][0]}</a><a href="{data["knowledge"]}">{data["publication_links"][1]}</a><a href="{data["knowledge"]}#historier">{data["publication_links"][2]}</a><a href="{data["visibility"]}">{data["publication_links"][3]}</a>'
    html = replace_once(html, old_links, new_links)
    html = replace_once(html, 'Markedsadgang mellem Danmark og Norge', data['market_title'])
    html = replace_once(html, 'Praktisk sparring til virksomheder, der vil forstå, teste eller etablere sig på den anden side af Skagerrak.', data['market_text'])
    html = replace_once(html, '>Danmark → Norge</a>', f'>{data["market_links"][0]}</a>')
    html = replace_once(html, '>Norge → Danmark</a>', f'>{data["market_links"][1]}</a>')
    html = replace_once(html, 'En indledende samtale.', data['contact_title'])
    html = replace_once(html, 'Skriv kort om den opgave eller beslutning, I står med. Vi vender tilbage og afklarer, om Waltham er den rette samarbejdspartner.', data['contact_intro'])
    html = replace_once(html, 'Den første henvendelse er uforpligtende. Omfang og pris aftales, før arbejdet begynder.', data['contact_muted'])
    html = replace_once(html, 'href="/dk/sparringspartner.html">Læs om sparring og pris →', f'href="{data["sparring"]}">{data["sparring_link"]}')
    html = replace_once(html, 'action="/dk/henvendelse-modtaget.html"', f'action="{data["success"]}"')
    html = replace_once(html, 'Udfyld ikke dette felt:', data['bot'])
    html = replace_once(html, '<h3>Kontakt Waltham</h3>', f'<h3>{data["form_title"]}</h3>')
    html = replace_once(html, 'Dit navn *', data['name_label'])
    html = replace_once(html, 'placeholder="Dit navn"', f'placeholder="{data["name_placeholder"]}"')
    html = replace_once(html, 'Din e-mail *', data['email_label'])
    html = replace_once(html, 'placeholder="navn@virksomhed.dk"', f'placeholder="{data["email_placeholder"]}"')
    html = replace_once(html, 'Virksomhedens hjemmeside (valgfrit)', data['site_label'])
    html = replace_once(html, 'placeholder="www.virksomhed.dk"', f'placeholder="{data["site_placeholder"]}"')
    html = replace_once(html, 'Hvad drejer henvendelsen sig om? (valgfrit)', data['about_label'])
    html = replace_once(html, 'placeholder="Fortæl kort, hvad du gerne vil have hjælp til."', f'placeholder="{data["about_placeholder"]}"')
    html = replace_once(html, 'Vi bruger kun oplysningerne til at besvare og følge op på din henvendelse. Undlad forretningshemmeligheder og følsomme oplysninger i formularen.', data['form_note'])
    html = replace_once(html, 'href="/dk/persondata.html">Læs om behandling af personoplysninger.</a>', f'href="{data["privacy"]}">{data["privacy_link"]}</a>')
    html = replace_once(html, 'Send henvendelse →', data['send'])
    html = replace_once(html, 'Foretrækker du e-mail?', data['email_backup'])
    html = replace_once(html, 'Skriv direkte til Waltham', data['email_direct'])
    html = replace_once(html, '<a class="logo" href="/dk/">', f'<a class="logo" href="/{locale}/">')
    html = replace_once(html, 'href="/dk/persondata.html">Persondata</a>', f'href="{data["privacy"]}">{data["privacy_footer"]}</a>')
    html = replace_once(html, 't.textContent="Start dialog om sparring"', f't.textContent="{data["dialog_script"]}"')
    return html


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=ROOT / 'dk' / 'index.html')
    args = parser.parse_args()
    source = RUM.sub('', args.source.read_text(encoding='utf-8')).replace('\n  \n', '\n\n')
    if 'id="tilgang"' not in source:
        source = source.replace(
            '<section class="section consulting-intro" id="fokus">',
            '<section class="section consulting-intro" id="fokus"><span id="tilgang" aria-hidden="true"></span>',
            1,
        )
    if 'id="arbejde"' not in source:
        source = source.replace(
            '<section class="section work-principles" id="arbejdsform">',
            '<section class="section work-principles" id="arbejdsform"><span id="arbejde" aria-hidden="true"></span>',
            1,
        )
    (ROOT / 'dk' / 'index.html').write_text(source, encoding='utf-8')
    for locale, data in LOCALES.items():
        (ROOT / locale / 'index.html').write_text(localise(source, locale, data), encoding='utf-8')
    print('Synced consulting homepages: dk, no, en, de')


if __name__ == '__main__':
    main()
