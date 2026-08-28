from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

COPY = {
    "no": {
        "purpose_label": "Hvorfor vi utvikler det",
        "purpose": "Vår ambisjon er å gjøre troverdig borgerinnsikt mer tilgjengelig for lokale redaksjoner. Når det blir raskere og rimeligere å oppdage relevante spørsmål og gjennomføre en målrettet verifisering, kan flere innbyggere bli hørt — oftere og om forhold som berører hverdagen deres. Det kan styrke både lokaljournalistikken, den offentlige samtalen og beslutningsgrunnlaget demokratiet bygger på.",
        "label": "Under utvikling · Media intelligence",
        "title": "Fra lokale signaler til dokumenterte saksideer.",
        "name": "Arbeidstittel: Waltham Newsroom Signal.",
        "lead": "En AI-agent gjennomgår hver morgen avtalte lokale nyhetskilder og åpne datasett. Den finner mønstre, avvik og ubesvarte spørsmål — og hjelper redaksjonen med å vurdere hvilke temaer som fortjener nærmere undersøkelse.",
        "guard": "Produktet skriver ikke nyheten og erstatter ikke redaksjonell dømmekraft. Det gjør et stort kildemateriale oversiktlig og viser hva som bør undersøkes før en journalist avgjør om det finnes en sak.",
        "steps": [("Overvåk", "Gjennomgår avtalte lokale kilder og relevante offentlige data."), ("Koble", "Finner gjentakelser, endringer og signaler på tvers av geografi og tid."), ("Vurder", "Rangerer temaer etter nyhetsverdi, relevans og mulighet for dokumentasjon."), ("Formuler", "Foreslår hypoteser, spørsmål, svaralternativer og alternative forklaringer."), ("Verifiser", "Anbefaler eksisterende evidens eller en liten målrettet undersøkelse.")],
        "delivery": "Den daglige leveransen", "brief": "En redaksjonell morgenbrief — ikke en ferdig artikkel.",
        "items": ["Kildebelagt signal og mulig lokal vinkel", "Det avgjørende ubesvarte spørsmålet", "Forslag til dokumentasjon eller verifisering"],
        "note": "AI finner signalet. Journalisten vurderer saken.",
    },
    "en": {
        "purpose_label": "Why we are developing it",
        "purpose": "Our ambition is to make credible citizen insight more accessible to local newsrooms. When relevant questions can be identified and verified faster and at lower cost, more people can be heard — more often and about the issues affecting their daily lives. This can strengthen local journalism, public debate and the evidence on which democratic decisions depend.",
        "label": "In development · Media intelligence", "title": "From local signals to documented story ideas.",
        "name": "Working title: Waltham Newsroom Signal.",
        "lead": "Every morning, an AI agent reviews agreed local news sources and open datasets. It identifies patterns, anomalies and unanswered questions — helping the newsroom decide which themes deserve closer investigation.",
        "guard": "The product does not write the news or replace editorial judgement. It makes a large source base manageable and shows what should be investigated before a journalist decides whether there is a story.",
        "steps": [("Monitor", "Reviews agreed local sources and relevant public data."), ("Connect", "Finds repetition, change and signals across geography and time."), ("Assess", "Ranks themes by news value, relevance and potential for documentation."), ("Formulate", "Suggests hypotheses, questions, response options and alternative explanations."), ("Verify", "Recommends existing evidence or a small, focused survey.")],
        "delivery": "The daily delivery", "brief": "An editorial morning brief — not a finished article.",
        "items": ["Source-backed signal and potential local angle", "The decisive unanswered question", "Suggested documentation or verification"],
        "note": "AI finds the signal. The journalist judges the story.",
    },
    "de": {
        "purpose_label": "Warum wir es entwickeln",
        "purpose": "Unser Ziel ist es, glaubwürdige Bürgererkenntnisse für lokale Redaktionen leichter zugänglich zu machen. Wenn relevante Fragen schneller und kostengünstiger erkannt und gezielt überprüft werden können, können mehr Menschen häufiger zu Themen gehört werden, die ihren Alltag betreffen. Das kann Lokaljournalismus, öffentliche Debatten und die Entscheidungsgrundlage der Demokratie stärken.",
        "label": "In Entwicklung · Media Intelligence", "title": "Von lokalen Signalen zu belegten Themenideen.",
        "name": "Arbeitstitel: Waltham Newsroom Signal.",
        "lead": "Jeden Morgen prüft ein KI-Agent vereinbarte lokale Nachrichtenquellen und offene Datensätze. Er erkennt Muster, Abweichungen und offene Fragen — und hilft der Redaktion zu entscheiden, welche Themen genauer untersucht werden sollten.",
        "guard": "Das Produkt schreibt keine Nachrichten und ersetzt kein redaktionelles Urteilsvermögen. Es macht eine große Quellenbasis überschaubar und zeigt, was geprüft werden sollte, bevor ein Journalist entscheidet, ob eine Geschichte vorliegt.",
        "steps": [("Beobachten", "Prüft vereinbarte lokale Quellen und relevante öffentliche Daten."), ("Verbinden", "Erkennt Wiederholungen, Veränderungen und Signale über Raum und Zeit."), ("Bewerten", "Ordnet Themen nach Nachrichtenwert, Relevanz und Belegbarkeit."), ("Formulieren", "Schlägt Hypothesen, Fragen, Antwortoptionen und Alternativerklärungen vor."), ("Verifizieren", "Empfiehlt vorhandene Evidenz oder eine kleine gezielte Befragung.")],
        "delivery": "Die tägliche Lieferung", "brief": "Ein redaktionelles Morgenbriefing — kein fertiger Artikel.",
        "items": ["Quellenbelegtes Signal und möglicher lokaler Blickwinkel", "Die entscheidende offene Frage", "Vorschlag für Dokumentation oder Verifizierung"],
        "note": "KI findet das Signal. Der Journalist bewertet die Geschichte.",
    },
}

def render(t):
    steps = "".join(f'<article><b>{i:02}</b><h3>{h}</h3><p>{p}</p></article>' for i, (h, p) in enumerate(t["steps"], 1))
    items = "".join(f"<li>{item}</li>" for item in t["items"])
    purpose = f'<aside class="wrap concept-purpose"><p class="label">{t["purpose_label"]}</p><p>{t["purpose"]}</p></aside>'
    concept = f'<section class="section newsroom-concept"><div class="wrap"><div class="concept-head"><div><p class="label">{t["label"]}</p><h2>{t["title"]}</h2></div><div class="copy"><p><strong>{t["name"]}</strong> {t["lead"]}</p><p>{t["guard"]}</p></div></div><div class="signal-flow">{steps}</div><div class="brief-card"><div><p class="label">{t["delivery"]}</p><h3>{t["brief"]}</h3></div><ul>{items}</ul><p class="editor-note">{t["note"]}</p></div></div></section>'
    return purpose + concept

for locale, text in COPY.items():
    path = ROOT / locale / "waltham-insight.html"
    html = path.read_text(encoding="utf-8")
    marker = '<section class="section question-lab"'
    if "newsroom-concept" not in html:
        html = html.replace(marker, render(text) + marker, 1)
    path.write_text(html, encoding="utf-8")
