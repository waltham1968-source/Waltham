# Logbook publishing

The Danish Logbog and Norwegian Loggbok are the permanent collection for Waltham articles, models, teaching materials and products.

For new work: publish a readable article or introduction, add it newest first to the matching logbook, link its public downloads with language and page count, and give it a way back to the logbook. Add new product pages to the product directory and retain the complete product overview link. Update scripts/build_logbook_hubs.py so regeneration preserves new entries. Add the article URL to sitemap.xml. Preserve original source files and use distinct, descriptive public filenames.

Publish new items when requested; this document does not schedule automatic publication.

## Publication checks

Run `python3 scripts/check_logbook.py` before publication. It verifies local destinations, unique page titles and canonical declarations, and sitemap coverage. Canonical URLs use `https://www.waltham.dk` consistently with the existing site; do not change domains when regenerating a locale. Each article should include a relevant next step to a service or contact option. Contact clicks are already collected after analytics consent; they indicate contact intent, not a completed enquiry.
