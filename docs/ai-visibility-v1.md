# Waltham AI Visibility Score v1.0

## V2 first impression extension

The check now returns `version: "2.0"` and a separate `impression` object. It extracts the business name, leading heading, page description, opening paragraph and prominent section headings from the submitted page. It shows possible offerings, questions that remain unresolved, and whether the user's desired terms appear in the readable text. The result links back to the source page. The four localized result pages present this in place of the older perception word comparison.

V2 also samples up to three same-origin internal pages linked from the submitted page and returns page-specific tasks for missing title, description, heading, contact path, absent exact desired terms, or several competing offer headings. Failed or blocked sample pages are omitted. A Google panel reports observed Googlebot permission and noindex signals. If `GOOGLE_PLACES_API_KEY` is configured, Places Text Search (New) can supply review count and rating, but only when the returned place's website host exactly matches the checked website; otherwise the count remains unverified. This is a billable Enterprise SKU. Google AI-answer mentions and search position remain explicitly unverified without appropriate source data or a documented answer panel. A provisional DKK 9,500 analysis price is shown with checkout disabled until the commercial terms and payment destination are approved.

This is a source-backed, text-based first impression, not a live language-model response or a measured customer perception. An absent exact phrase is marked *unverified*, never as proof that the intended meaning is missing. Several apparent offerings trigger a question about priority, not an assertion that the business is unclear. The existing visibility score and 70% maximum coverage are unchanged; first impression has no score weight. A future semantic assessment would require a model service, repeatable prompts, human review and explicit handling of public page text sent to that service.

First functioning prototype, Danish page `/dk/ai-visibility-check`, linked from all four language homepages. Shares existing fonts, logo, colours and navigation patterns. Other languages intentionally link to the Danish prototype.

## Model

This is a proprietary diagnostic model, not a calibrated probability of recommendation. Full model: Access 40 points, Understanding 30, Presence 30. Perception is separate. Score = round(1 + 9 × earned / measured, 1). Unknown criteria are excluded from the denominator and reduce displayed coverage. Never score a failed fetch as a poor business. Risk uses the displayed score: High <4, Medium <7, Low ≥7; it concerns only measured criteria. Bands: 1–2 very weak, 3–4 weak, 5–6 moderate, 7–8 good, 9–10 strong foundation.

Access: readable HTML 10; search crawler rules 20; no detected noindex 5; valid sitemap 5. Robots evaluates the submitted/final page path, specific user-agent groups, merged groups, longest rule, Allow ties, * and $. Robots 404/410 means no declared restriction; 403/5xx/network errors/HTML soft errors mean unknown. Training-only bot restrictions never reduce the score. Rules do not prove crawler activity, firewall access, indexing or recommendation.

Understanding: business identity 8; description and main heading 8; geographic/audience signals 7; connected business JSON-LD identity/contact 7. These are heuristics, not semantic verification. The site may explain these well on other pages or in ordinary prose; missing signals are prompts for review. Optional company and market inputs help verify text matches. Valid JSON-LD is inspected, including arrays and @graph; Microdata/RDFa and rendered JavaScript are not evaluated. One page and one sitemap only; no full site crawl.

## Presence protocol (designed; automatic provider integration pending)

Do not infer presence from HTML. Agree 5 unbranded, relevant customer questions, across discovery, selection and local intent; record them before testing. Use at least two named AI services, two independent runs per question: minimum 20 observations. Keep language, market, model, search mode and date fixed/documented. Save exact response and cited URLs; label organic mention (1), explicit recommendation (1) and own-domain citation (1) as three separate binary outcomes per observation. Proposed Presence points = 30 × (0.4 × mention rate + 0.4 × recommendation rate + 0.2 × citation rate). Only compare complete, equivalent panels; failed runs remain missing and prevent publishing a full score. List competitors only when observed, including which question and source response; branded comparison prompts are qualitative follow-ups and do not count in this metric. Repeat on another date before sales use. This is a protocol for the next iteration, not a provider measurement implemented in this prototype.

The UI therefore says “Foreløbig” and “AI Presence: Ikke målt”, with maximum 70% coverage and no invented competitors. No API keys or paid model calls are needed. Provider integration must preserve this evidence model rather than asking an LLM to invent a score.

## Customer Perception / Perception Gap

User supplies desired attributes. Prototype displays the page's own description and literal term matches (including decoded Danish entities); it explicitly disclaims a semantic/customer perception measurement. For a full review, compare desired vs observed identity, offer, audience, geographic reach, tone and evidence. Use statuses aligned / partial / gap / unknown, with exact excerpts and source pages. A missing desired profile means “Mangler ønsket billede”, not a guessed expectation. Never mix this with visibility points.

## Implementation and operation

Node 20+ native modules, no added dependencies. Netlify Function `POST /api/ai-visibility`; request `{url, company?, offering?, market?, desired?}`. The same handler runs locally with `node scripts/preview-visibility.mjs`; open localhost:4173/dk/ai-visibility-check. Unit tests: `node --test tests/visibility.test.mjs`.

Public HTTP(S) only. Resolved addresses are validated and pinned to the outbound connection; redirect destinations are validated again. Private, loopback, mapped IPv6 and reserved address ranges are blocked. Fixed crawler identity, bounded redirects, 7-second request timeouts, 1 MB body cap, no cookies/credentials forwarded. Netlify per-IP/domain throttling: 5 checks per 180 seconds. No result database, no model calls and no submission of contact details. Platform request logs may still exist. Browser uses textContent for fetched strings and supports keyboard focus, loading, error and result states, reduced motion and JSON export.

Before merging: verify the Netlify branch preview executes functions and platform rate limits. Static GitHub Pages cannot execute the API. No automatic publication of a customer report or a named testcase.

## Primary references

- https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
- https://developers.openai.com/api/docs/bots
- https://docs.perplexity.ai/docs/resources/perplexity-crawlers
