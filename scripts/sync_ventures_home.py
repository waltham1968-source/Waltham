from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COPY = {
"no": ("Ikke alle muligheter skal ende som en rapport.<br>Noen skal bli en virksomhet.", "AI gjør det mulig å undersøke, teste og bygge smale virksomheter langt raskere enn før. Waltham kombinerer teknologien med kommersiell dømmekraft, markedskunnskap og praktisk gjennomføring — og utvikler både løsninger for kunder og egne konsepter.", "Bredden er ikke målet. Målet er å finne en konkret mulighet, bygge den minste troverdige løsningen og la markedet avgjøre om den skal vokse.", [("Under utvikling","Nordic Market Gateway","En selvstendig inngang for internasjonale virksomheter som vil undersøke og åpne Norden."),("Konsept under utvikling","Norsk campingportal","En målrettet markedsplass som forbinder norske campingmuligheter med danske gjester."),("I markedet","LBC FM","Formidling av kontorlokaler og facility management fra konkret behov til lokal løsning.")], "Finn signalet. Test etterspørselen. Bygg det markedet faktisk vil bruke.", "Se Waltham Ventures"),
"en": ("Not every opportunity should end as a report.<br>Some should become a business.", "AI makes it possible to research, test and build focused businesses far faster than before. Waltham combines the technology with commercial judgement, market understanding and practical execution — developing both client solutions and ventures of its own.", "Breadth is not the objective. The objective is to find a concrete opportunity, build the smallest credible solution and let the market decide whether it should grow.", [("In development","Nordic Market Gateway","An independent entry point for international companies seeking to explore and enter the Nordics."),("Concept in development","Norwegian camping portal","A focused marketplace connecting Norwegian camping opportunities with Danish guests."),("In market","LBC FM","Office and facility-management brokerage from concrete need to local solution.")], "Find the signal. Test demand. Build what the market will actually use.", "Explore Waltham Ventures"),
"de": ("Nicht jede Chance sollte als Bericht enden.<br>Manche sollten ein Unternehmen werden.", "KI ermöglicht es, fokussierte Unternehmen viel schneller zu untersuchen, zu testen und aufzubauen. Waltham verbindet Technologie mit kaufmännischem Urteilsvermögen, Marktverständnis und praktischer Umsetzung — für Kundenlösungen und eigene Ventures.", "Breite ist nicht das Ziel. Ziel ist eine konkrete Chance, die kleinste glaubwürdige Lösung und die Entscheidung des Marktes, ob sie wachsen soll.", [("In Entwicklung","Nordic Market Gateway","Ein eigenständiger Einstieg für internationale Unternehmen in die nordischen Märkte."),("Konzept in Entwicklung","Norwegisches Campingportal","Ein fokussierter Marktplatz für norwegische Campingangebote und dänische Gäste."),("Im Markt","LBC FM","Vermittlung von Büros und Facility Management vom konkreten Bedarf zur lokalen Lösung.")], "Signal finden. Nachfrage testen. Bauen, was der Markt wirklich nutzt.", "Waltham Ventures ansehen")}

def section(t):
    title, lead, guard, ventures, principle, link = t
    cards=''.join(f'<article><span>{s}</span><h3>{h}</h3><p>{p}</p></article>' for s,h,p in ventures)
    return f'<section class="section ventures-preview" id="ventures"><div class="wrap"><div class="ventures-head"><div><p class="label">Waltham Ventures</p><h2>{title}</h2></div><div class="copy"><p>{lead}</p><p>{guard}</p></div></div><div class="venture-cards">{cards}</div><p class="ventures-principle">{principle}</p><a class="case-link ventures-link" href="waltham-ventures.html">{link} →</a></div></section>'

for code,t in COPY.items():
    path=ROOT/code/'index.html'
    html=path.read_text(encoding='utf-8')
    if 'id="ventures"' not in html:
        html=html.replace('<section class="section cases"', section(t)+'<section class="section cases"',1)
    if 'href="waltham-ventures.html">Ventures</a>' not in html:
        html=html.replace('<a href="#cases">', '<a href="waltham-ventures.html">Ventures</a><a href="#cases">',1)
    path.write_text(html,encoding='utf-8')

# Danish page already contains the preview; add discoverability links mechanically.
path=ROOT/'dk'/'index.html'
html=path.read_text(encoding='utf-8')
if 'href="waltham-ventures.html">Ventures</a>' not in html:
    html=html.replace('<a href="#cases">Erfaring</a>', '<a href="waltham-ventures.html">Ventures</a><a href="#cases">Erfaring</a>',1)
if 'ventures-link' not in html:
    html=html.replace('</p></div></section>\n\n    <section class="section cases"', '</p><a class="case-link ventures-link" href="waltham-ventures.html">Se Waltham Ventures →</a></div></section>\n\n    <section class="section cases"',1)
path.write_text(html,encoding='utf-8')
