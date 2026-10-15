#!/usr/bin/env python3
"""Import public pages that exist in production but are missing from Git.

This is a recovery aid for the October 2026 source/deploy drift.  It strips
Netlify's injected RUM tag before storing the source files.
"""

from pathlib import Path
from urllib.request import Request, urlopen
import re


ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.waltham.dk"
RUM = re.compile(r'\n?<script async id="netlify-rum-container".*?</script>', re.S)

PAGES = {
    "de/ai-visibility-check.html": "/de/ai-visibility-check.html",
    "de/digital-reputation.html": "/de/digital-reputation.html",
    "de/logbuch.html": "/de/logbuch.html",
    "dk/ai-visibility-check.html": "/dk/ai-visibility-check.html",
    "dk/digital-reputation.html": "/dk/digital-reputation.html",
    "dk/logbog.html": "/dk/logbog.html",
    "en/ai-visibility-check.html": "/en/ai-visibility-check.html",
    "en/digital-reputation.html": "/en/digital-reputation.html",
    "en/journal.html": "/en/journal.html",
    "no/ai-visibility-check.html": "/no/ai-visibility-check.html",
    "no/digital-reputation.html": "/no/digital-reputation.html",
    "no/loggbok.html": "/no/loggbok.html",
    "de/wissenszentrum.html": "/de/wissenszentrum.html",
    "de/rabatt-mit-einem-laecheln.html": "/de/rabatt-mit-einem-laecheln.html",
    "de/sparringspartner.html": "/de/sparringspartner.html",
    "dk/videnscenter.html": "/dk/videnscenter.html",
    "dk/giv-rabatten-med-et-smil.html": "/dk/giv-rabatten-med-et-smil.html",
    "dk/sparringspartner.html": "/dk/sparringspartner.html",
    "en/knowledge-centre.html": "/en/knowledge-centre.html",
    "en/give-the-discount-with-a-smile.html": "/en/give-the-discount-with-a-smile.html",
    "en/sparring-partner.html": "/en/sparring-partner.html",
    "no/kunnskapssenter.html": "/no/kunnskapssenter.html",
    "no/gi-rabatten-med-et-smil.html": "/no/gi-rabatten-med-et-smil.html",
    "no/sparringspartner.html": "/no/sparringspartner.html",
    "dk/den-nye-dotcom-boelge.html": "/dk/den-nye-dotcom-boelge.html",
    "dk/ai-synlighed-fyn.html": "/dk/ai-synlighed-fyn.html",
    "norge-danmark.html": "/norge-danmark",
    "danmark-norge.html": "/danmark-norge",
    "no/danske-kroner-neste-marked.html": "/no/danske-kroner-neste-marked.html",
    "dk/jeres-naeste-kunde-er-maaske-norsk.html": "/dk/jeres-naeste-kunde-er-maaske-norsk.html",
    "dk/en-ny-guldalder-for-konsulentbranchen.html": "/dk/en-ny-guldalder-for-konsulentbranchen.html",
    "dk/persondata.html": "/dk/persondata",
    "no/personvern.html": "/no/personvern",
    "en/privacy.html": "/en/privacy",
    "de/datenschutz.html": "/de/datenschutz",
    "dk/henvendelse-modtaget.html": "/dk/henvendelse-modtaget",
    "no/henvendelse-mottatt.html": "/no/henvendelse-mottatt",
}


for target, path in PAGES.items():
    request = Request(BASE + path, headers={"User-Agent": "Waltham source recovery"})
    with urlopen(request, timeout=30) as response:
        html = response.read().decode("utf-8")
    html = RUM.sub("", html)
    destination = ROOT / target
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(html, encoding="utf-8")
    print(f"Imported {target}")

for path in (
    ROOT / "dk" / "persondata.html",
    ROOT / "no" / "personvern.html",
    ROOT / "en" / "privacy.html",
    ROOT / "de" / "datenschutz.html",
):
    html = path.read_text(encoding="utf-8")
    path.write_text(html.replace("<h2>undefined</h2><p>undefined</p>", ""), encoding="utf-8")
    print(f"Cleaned {path.relative_to(ROOT)}")
