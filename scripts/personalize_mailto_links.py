from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlparse
import re

ROOT = Path(__file__).resolve().parents[1]
ADDRESS = "waltham@me.com"

LANG = {
    "dk": {
        "from": "fra",
        "hello": "Hej Waltham,",
        "line": "Min henvendelse drejer sig om: {topic}. Jeg vil gerne høre, hvordan Waltham kan hjælpe.",
        "follow": "I må gerne kontakte mig for en indledende og uforpligtende afklaring.",
        "source": "Jeg henvender mig fra denne side:",
        "close": "Venlig hilsen",
    },
    "no": {
        "from": "fra",
        "hello": "Hei Waltham,",
        "line": "Henvendelsen min gjelder: {topic}. Jeg vil gjerne høre hvordan Waltham kan hjelpe.",
        "follow": "Ta gjerne kontakt for en innledende og uforpliktende avklaring.",
        "source": "Jeg henvender meg fra denne siden:",
        "close": "Vennlig hilsen",
    },
    "en": {
        "from": "from",
        "hello": "Hello Waltham,",
        "line": "My enquiry concerns: {topic}. I would like to learn how Waltham could help.",
        "follow": "Please contact me for an initial, no-obligation conversation.",
        "source": "My enquiry comes from this page:",
        "close": "Kind regards",
    },
    "de": {
        "from": "von",
        "hello": "Guten Tag Waltham,",
        "line": "Meine Anfrage betrifft: {topic}. Ich möchte erfahren, wie Waltham helfen könnte.",
        "follow": "Bitte kontaktieren Sie mich für ein erstes unverbindliches Gespräch.",
        "source": "Meine Anfrage kommt von dieser Seite:",
        "close": "Freundliche Grüße",
    },
}

def locale_for(path):
    rel = path.relative_to(ROOT)
    return rel.parts[0] if rel.parts and rel.parts[0] in LANG else "dk"

def clean_topic(raw, title):
    topic = unquote(raw or "").replace("+", " ").strip()
    topic = re.sub(r"^Waltham\s*[|·:\-]\s*", "", topic, flags=re.I)
    topic = re.split(r"\s+\|\s+(?:fra|from|von)\s+", topic, maxsplit=1, flags=re.I)[0].strip()
    return topic or title.split("—")[0].split("|")[0].strip() or "en henvendelse"

def page_url(path, locale):
    rel = path.relative_to(ROOT).as_posix()
    host = "https://waltham.no" if locale == "no" else "https://waltham.dk"
    return f"{host}/{rel}"

def replace_link(match, *, path, title, locale):
    href = match.group(1)
    parsed = urlparse(href)
    query = parse_qs(parsed.query)
    topic = clean_topic(query.get("subject", [""])[0], title)
    page_name = title.split("—")[0].split("|")[0].strip() or path.stem.replace("-", " ")
    text = LANG[locale]
    subject = f"Waltham | {topic} | {text['from']} {page_name}"
    url = page_url(path, locale)
    body = "\n\n".join([
        text["hello"],
        text["line"].format(topic=topic),
        text["follow"],
        f"{text['source']}\n{url}",
        f"{text['close']}\n[Navn / Name]",
    ])
    new_href = f"mailto:{ADDRESS}?subject={quote(subject, safe='')}&body={quote(body, safe='')}"
    return f'href="{new_href}"'

for path in ROOT.rglob("*.html"):
    if ".git" in path.parts:
        continue
    html = path.read_text(encoding="utf-8")
    if f"mailto:{ADDRESS}" not in html:
        continue
    title_match = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    title = re.sub(r"<[^>]+>", "", title_match.group(1)).strip() if title_match else path.stem.replace("-", " ")
    locale = locale_for(path)
    pattern = re.compile(r'href="(mailto:waltham@me\.com[^\"]*)"', re.I)
    updated = pattern.sub(lambda m: replace_link(m, path=path, title=title, locale=locale), html)
    path.write_text(updated, encoding="utf-8")
