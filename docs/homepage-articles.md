# Automatic homepage articles

Netlify runs `node scripts/update-home-articles.mjs` before publishing the repository root.

Sources:
- Danish: `dk/logbog.html`
- Norwegian: `no/loggbok.html`
- English: `en/journal.html`

When publishing an article, add its card to the corresponding logbook as usual. Include the publication date in its first span, title in h2, summary in p, and a link to the local article file. If a cover image is supplied, use an existing `/assets/` file. No separate homepage edit is needed.

Each build selects the three newest distinct article URLs by publication date (ties preserve logbook order) and renders the existing homepage cards. Titles, summaries, images and links come from the same-language logbook. The root fallback uses Danish. The HTML is generated before deployment, so visitors and search engines do not depend on JavaScript or a network request to load the cards. Generated homepage changes are part of the deploy output; they do not create Git commits.

Dates accept Danish, Norwegian and English month names, including `23. oktober 2026` and `23 October 2026`. A logbook entry is treated as published: do not add scheduled/draft articles to the public logbook before publication.

All three locales are validated before homepages are written. Missing selected article/image files, invalid cards/dates, cross-language article links or an unexpected homepage template fail the build. Netlify then keeps the previously successful production deploy. A build error must be fixed and deployed again; it is not silently ignored.

Checks: `node --test tests/home-articles.test.mjs`
