#!/usr/bin/env python3
"""Replace the legacy text logo in the four home-page contact cards."""

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / lang / "index.html" for lang in ("dk", "no", "en", "de")]


for page in PAGES:
    html = page.read_text(encoding="utf-8")
    pattern = re.compile(
        r'<div class="contact-card"><p class="contact-brand">.*?</p>(.*?)</div></div></section>',
        re.DOTALL,
    )
    replacement = (
        '<div class="contact-card"><div class="contact-details">\\1</div>'
        '<div class="contact-logo-large" role="img" aria-label="Waltham Consulting">'
        '<span aria-hidden="true"></span></div></div></div></section>'
    )
    updated, count = pattern.subn(replacement, html, count=1)
    if count != 1:
        raise SystemExit(f"Expected one legacy contact logo in {page}, found {count}")
    page.write_text(updated, encoding="utf-8")
    print(page.relative_to(ROOT))
