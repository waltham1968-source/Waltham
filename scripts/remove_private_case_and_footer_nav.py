#!/usr/bin/env python3
"""Remove the Åhusene case and redundant footer navigation."""

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]

# The private property example existed as one card on each current home page.
for relative in ("index.html", "dk/index.html", "no/index.html", "en/index.html"):
    path = ROOT / relative
    html = path.read_text(encoding="utf-8")
    updated, count = re.subn(
        r'\s*<article><p class="kicker">[^<]*</p><h3>Åhusene 11B?</h3>.*?</article>',
        "",
        html,
        count=1,
        flags=re.DOTALL,
    )
    if count == 0 and re.search(r'Åhusene|ahusene', html, re.IGNORECASE):
        raise SystemExit(f"Could not safely remove the Åhusene reference in {relative}")
    path.write_text(updated, encoding="utf-8")

# Language/home/contact link rows at the very bottom duplicated the top menu.
for path in ROOT.rglob("*.html"):
    html = path.read_text(encoding="utf-8")
    updated = re.sub(r'<span class="lang"><a .*?</span>', "", html, flags=re.DOTALL)
    updated = re.sub(
        r'<span><a href="/(?:no/|en/)?">(?:Forside|Home)</a>\s*·\s*<a .*?</a></span>',
        "",
        updated,
        flags=re.DOTALL,
    )
    updated = re.sub(
        r'<div class="links"><a href="index\.html">(?:Forside|Home)</a><a href="index\.html#kontakt">(?:Kontakt|Contact)</a></div>',
        "",
        updated,
    )
    updated = re.sub(
        r'\s*<span><a href="index\.html">(?:Forside|Home)</a>\s*·\s*<a href="index\.html#kontakt">(?:Kontakt|Contact)</a></span>',
        "",
        updated,
    )
    updated = re.sub(r'<p><a class="footer-product-link" .*?</a></p>', "", updated, flags=re.DOTALL)
    if updated != html:
        path.write_text(updated, encoding="utf-8")
