#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LINK = '<link rel="stylesheet" href="../css/brand-logo.css">'

changed = 0
for locale in ("dk", "no", "en", "de"):
    for path in (ROOT / locale).glob("*.html"):
        html = path.read_text(encoding="utf-8")
        if 'class="logo"' not in html or "brand-logo.css" in html:
            continue
        html = html.replace("</head>", LINK + "</head>", 1)
        path.write_text(html, encoding="utf-8")
        changed += 1

print(f"Brand logo linked on {changed} pages")
