#!/usr/bin/env python3
"""Validate public logbook destinations without changing generated pages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
HUBS = ('dk/logbog.html', 'no/loggbok.html', 'en/journal.html', 'de/logbuch.html')


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.links, self.canonicals, self.titles = [], [], 0
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs.get('href', ''))
        if tag == 'title':
            self.titles += 1


def main():
    sitemap = {node.text for node in ET.parse(ROOT / 'sitemap.xml').iter()
               if node.tag.endswith('}loc')}
    errors, checked = [], set()
    for hub in HUBS:
        source = ROOT / hub
        for href in ['', *Page(source).links]:
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            target = ((ROOT / url.path.lstrip('/')) if url.path.startswith('/')
                      else (source.parent / url.path)).resolve() if url.path else source
            if target.suffix != '.html' or target in checked:
                continue
            checked.add(target)
            if not target.is_relative_to(ROOT) or not target.is_file():
                errors.append(f'{hub}: missing destination {href}')
                continue
            page = Page(target)
            label = str(target.relative_to(ROOT))
            if page.titles != 1 or len(page.canonicals) != 1:
                errors.append(f'{label}: requires exactly one title and canonical')
            elif page.canonicals[0] not in sitemap:
                errors.append(f'{label}: canonical missing from sitemap')
            elif urlsplit(page.canonicals[0]).netloc != 'www.waltham.dk':
                errors.append(f'{label}: unexpected canonical host')
    for error in errors:
        print(error)
    print(f'Checked {len(checked)} logbook destinations; {len(errors)} errors.')
    return bool(errors)


if __name__ == '__main__':
    raise SystemExit(main())
