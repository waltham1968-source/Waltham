#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

TEXT = {
    "dk": {
        "label": "Under udvikling · Borgernes spørgsmålslaboratorium",
        "title": "Fra borgernes observation til en undersøgelse, der kan tåle offentlighed.",
        "lead": "Læsere og borgere kan pege på alvorlige lokale forhold, formulere det spørgsmål, de mener bør undersøges, og bidrage med kilder eller alternative forklaringer. Redaktionen hjælper med at gøre observationen til en neutral og testbar hypotese.",
        "name": "Arbejdstitel: Citizen Signal.",
        "steps": [("Indsend", "En borger beskriver en observation — uden at udpege eller dømme enkeltpersoner."), ("Kvalificér", "Redaktionen kontrollerer kilder, relevans, lovlighed og mulige modhypoteser."), ("Formulér", "Observationen omsættes til et neutralt spørgsmål og et forslag til undersøgelse."), ("Prioritér", "Støtte, debat og lokal relevans viser, hvad der bør undersøges — ikke hvad der er sandt."), ("Finansiér", "Borgere, medier eller fonde kan finansiere undersøgelsen, men aldrig købe et ønsket resultat."), ("Undersøg", "En fagligt forsvarlig stikprøve og åben metode tester hypotesen."), ("Offentliggør", "Spørgsmål, finansiering, metode, usikkerhed og resultat offentliggøres samlet.")],
        "rule": "Popularitet er et prioriteringssignal — ikke et bevis.",
        "method_label": "Metodisk hovedregel",
        "rule_p": "Likes, klik, kommentarer og crowdfunding kan vise, at et spørgsmål optager mange. De kan ikke bruges som et repræsentativt svar. Først en fagligt gennemført undersøgelse kan veje hypotesen.",
        "trust": "Pengene køber undersøgelsen. Ingen køber konklusionen.",
        "trust_label": "Uafhængighed",
        "trust_p": "Tydelig moderation, kildehenvisninger, synlige finansieringskilder og offentlig metode skal beskytte både borgere, redaktion og resultat mod manipulation, bots og organiseret påvirkning.",
    },
    "no": {
        "label": "Under utvikling · Innbyggernes spørsmålslaboratorium",
        "title": "Fra innbyggernes observasjon til en undersøkelse som tåler offentlighet.",
        "lead": "Lesere og innbyggere kan peke på alvorlige lokale forhold, formulere spørsmålet de mener bør undersøkes, og bidra med kilder eller alternative forklaringer. Redaksjonen hjelper med å gjøre observasjonen til en nøytral og testbar hypotese.",
        "name": "Arbeidstittel: Citizen Signal.",
        "steps": [("Send inn", "En innbygger beskriver en observasjon — uten å utpeke eller dømme enkeltpersoner."), ("Kvalifiser", "Redaksjonen kontrollerer kilder, relevans, lovlighet og mulige mothypoteser."), ("Formuler", "Observasjonen blir et nøytralt spørsmål og et forslag til undersøkelse."), ("Prioriter", "Støtte, debatt og lokal relevans viser hva som bør undersøkes — ikke hva som er sant."), ("Finansier", "Innbyggere, medier eller fond kan finansiere undersøkelsen, men aldri kjøpe et ønsket resultat."), ("Undersøk", "Et faglig forsvarlig utvalg og åpen metode tester hypotesen."), ("Publiser", "Spørsmål, finansiering, metode, usikkerhet og resultat publiseres samlet.")],
        "rule": "Popularitet er et prioriteringssignal — ikke et bevis.",
        "method_label": "Metodisk hovedregel",
        "rule_p": "Likes, klikk, kommentarer og folkefinansiering kan vise at et spørsmål opptar mange. De kan ikke brukes som et representativt svar. Først en faglig gjennomført undersøkelse kan veie hypotesen.",
        "trust": "Pengene kjøper undersøkelsen. Ingen kjøper konklusjonen.",
        "trust_label": "Uavhengighet",
        "trust_p": "Tydelig moderering, kildehenvisninger, synlige finansieringskilder og offentlig metode skal beskytte innbyggere, redaksjon og resultat mot manipulasjon, roboter og organisert påvirkning.",
    },
    "en": {
        "label": "In development · The public question lab",
        "title": "From a citizen observation to an investigation that can withstand public scrutiny.",
        "lead": "Readers and citizens can flag serious local conditions, formulate the question they believe deserves investigation, and contribute sources or alternative explanations. The newsroom helps turn the observation into a neutral, testable hypothesis.",
        "name": "Working title: Citizen Signal.",
        "steps": [("Submit", "A citizen describes an observation — without identifying or judging individuals."), ("Qualify", "The newsroom checks sources, relevance, legality and possible counter-hypotheses."), ("Formulate", "The observation becomes a neutral question and a proposed investigation."), ("Prioritise", "Support, debate and local relevance show what deserves investigation — not what is true."), ("Fund", "Citizens, media or foundations may fund the research, but never purchase a preferred result."), ("Investigate", "A sound sample and transparent method test the hypothesis."), ("Publish", "Question, funding, method, uncertainty and result are published together.")],
        "rule": "Popularity is a priority signal — not evidence.",
        "method_label": "Core methodological rule",
        "rule_p": "Likes, clicks, comments and crowdfunding may show that a question matters to many people. They cannot provide a representative answer. Only a properly conducted study can weigh the hypothesis.",
        "trust": "The funding buys the investigation. Nobody buys the conclusion.",
        "trust_label": "Independence",
        "trust_p": "Clear moderation, source references, disclosed funding and a public method protect citizens, the newsroom and the result against manipulation, bots and organised influence.",
    },
    "de": {
        "label": "In Entwicklung · Das öffentliche Fragenlabor",
        "title": "Von der Beobachtung eines Bürgers zu einer Untersuchung, die öffentlicher Prüfung standhält.",
        "lead": "Leser und Bürger können auf ernste lokale Zustände hinweisen, die aus ihrer Sicht notwendige Frage formulieren und Quellen oder alternative Erklärungen beitragen. Die Redaktion entwickelt daraus eine neutrale, überprüfbare Hypothese.",
        "name": "Arbeitstitel: Citizen Signal.",
        "steps": [("Einreichen", "Ein Bürger beschreibt eine Beobachtung — ohne Einzelpersonen zu benennen oder zu verurteilen."), ("Qualifizieren", "Die Redaktion prüft Quellen, Relevanz, Rechtmäßigkeit und mögliche Gegenhypothesen."), ("Formulieren", "Aus der Beobachtung werden eine neutrale Frage und ein Untersuchungsvorschlag."), ("Priorisieren", "Unterstützung, Debatte und lokale Relevanz zeigen, was untersucht werden sollte — nicht, was wahr ist."), ("Finanzieren", "Bürger, Medien oder Stiftungen können die Studie finanzieren, aber niemals ein gewünschtes Ergebnis kaufen."), ("Untersuchen", "Eine fachgerechte Stichprobe und transparente Methode prüfen die Hypothese."), ("Veröffentlichen", "Frage, Finanzierung, Methode, Unsicherheit und Ergebnis werden gemeinsam veröffentlicht.")],
        "rule": "Popularität ist ein Prioritätssignal — kein Beweis.",
        "method_label": "Methodische Grundregel",
        "rule_p": "Likes, Klicks, Kommentare und Crowdfunding können zeigen, dass eine Frage viele Menschen beschäftigt. Sie liefern keine repräsentative Antwort. Erst eine fachgerecht durchgeführte Studie kann die Hypothese bewerten.",
        "trust": "Das Geld finanziert die Untersuchung. Niemand kauft die Schlussfolgerung.",
        "trust_label": "Unabhängigkeit",
        "trust_p": "Klare Moderation, Quellenangaben, offengelegte Finanzierung und eine öffentliche Methode schützen Bürger, Redaktion und Ergebnis vor Manipulation, Bots und organisierter Einflussnahme.",
    },
}

for lang, t in TEXT.items():
    path = ROOT / lang / "waltham-insight.html"
    html = path.read_text()
    cards = "".join(f'<article><b>{i:02}</b><h3>{title}</h3><p>{body}</p></article>' for i, (title, body) in enumerate(t["steps"], 1))
    section = f'<section class="section citizen-signal"><div class="wrap"><div class="citizen-head"><div><p class="label">{t["label"]}</p><h2>{t["title"]}</h2></div><div class="copy"><p><strong>{t["name"]}</strong> {t["lead"]}</p></div></div><div class="citizen-flow">{cards}</div><div class="citizen-guardrails"><article><p class="label">{t["method_label"]}</p><h3>{t["rule"]}</h3><p>{t["rule_p"]}</p></article><article><p class="label">{t["trust_label"]}</p><h3>{t["trust"]}</h3><p>{t["trust_p"]}</p></article></div></div></section>'
    if 'class="section citizen-signal"' in html:
        html = re.sub(r'<section class="section citizen-signal">.*?</section>(?=<section class="section question-lab")', section, html, flags=re.S)
    else:
        html = html.replace('<section class="section question-lab"', section + '<section class="section question-lab"', 1)
    path.write_text(html)
