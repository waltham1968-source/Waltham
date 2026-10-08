# Analyzer v3.0 — method v1.3

The 7 October 2026 reminder, “Opdatér Walthams visibility-check”, asked for the documented 18-checkpoint masterlist, LinkedIn/Facebook and six additional source groups, fixed weights, a 0–100 score and coverage. The original master document was recovered from the recorded creation and version diffs. Its reconstructed v1.3 copy is retained outside the published site in `innhold/produkter/Waltham_AI_Visibility_MASTER_v1.txt`.

This version supersedes the 1–10 calculation and 40/30/30 weights described in the historical `ai-visibility-v1.md`. Report format version is 3.0; scoring method version is 1.3. Old reports retain their original method and must not be compared as if recalculated under this method.

## Calculation

All 18 stable checkpoint IDs are present. Their fixed weights sum to 100. The four areas weigh 23% (access), 32% (identity, relevance and people), 29% (content and external signals), and 16% (observed AI visibility and understanding).

Each reviewed checkpoint receives fulfillment 0–4. Contribution is weight × fulfillment / 4. Score is 100 × earned contribution / assessed weight. Coverage is 100 × assessed weight / relevant weight. Round only final display values. Unexamined checkpoints have a null rating; justified “not relevant” checkpoints are excluded from both denominators. No assessments produce a null score. The API returns score scale, method version, measured/relevant weights, individual contributions, coverage, date and critical findings.

## What runs automatically

The public endpoint samples the submitted page and up to three linked same-origin pages, robots rules and one sitemap location. The sample informs checkpoint 01 (partial, at most 3/4), 02 (search-crawler rules for the sampled paths), and 04 (partial sitemap/internal-link evidence, at most 3/4). A verified own-site identity signal informs 05 at 2/4; it does not imply register verification. Explicit noindex can record a negative finding in 03; absence of noindex does not prove indexing or actual search visibility.

Semantic service/market assessment, specialist competence, people, history, customer answers, consistency, cases, reputation and AI responses require documented review. Missing schema or keywords must not become findings that a business lacks a capability. All checkpoints remain visible, with null ratings where they are unexamined. The preliminary score is normalized over the assessed weights and must always be read with its coverage.

The source inventory includes separate LinkedIn company/person and Facebook company/public coverage rows, plus Google Maps, reviews/industry portals, official registers/Proff, professional associations, media and customer/partner websites. A link extracted from the website is “found, unread”; groups without an examined source are “not examined”, never “does not exist”. The existing optional Google Places integration records matched review totals separately; totals do not establish review sentiment or independent credibility.

## Documented review and AI panel

`applyReviewedEvidence` is an internal module function, deliberately not accepted from public form submissions. A rating requires a concrete observation, source URLs and date. Weights and IDs cannot be overridden. “Not relevant” requires a reason. Positioning requires previously documented themes. A documented AI panel requires preselected questions, planned response count, exact saved answers, service/model, date, search mode and run ID. Duplicate runs are rejected. Checkpoint 16 uses 4 × correct relevant mentions / valid answers. Failed runs do not count as negative findings and prevent a complete score. Checkpoint 16 is reported separately as mentions/valid answers.

No paid search or AI provider integration was added. This update establishes the full scoring and evidence framework; it does not claim that the free website check automatically carries out every research task.

## Validation

Run `node --test tests/visibility*.test.mjs` on Node 20+. The suite covers the scoring denominator, missing data, zero scores, not-relevant exclusions, fractional panel results, immutable weights, evidence requirements, failed/duplicate AI runs, source statuses, sampled-path restrictions, localization and all four customer pages. Local preview: `node scripts/preview-visibility.mjs`.

## External research and cross-page review — 8 October 2026
The crawl prioritizes about/contact/customer/team/service pages, up to nine linked pages. Explicit founding statements are compared across inspected pages; differing milestones are flagged for clarification rather than assigning a true year. Copyright years are excluded.
A separate `/api/ai-visibility-research` request uses the existing OpenAI web-search integration. Retained findings must cite consulted URLs. Registers, Google Maps, reviews, professional associations, social profiles and customer evidence are searched; found statuses without retained matching citations become inconclusive. Missing configuration/timeouts are surfaced explicitly. This bounded investigation cannot guarantee that all relevant sources were found. It supplements the 18-checkpoint score; it does not silently turn model findings into scored checkpoints or measured AI visibility. Google Maps totals still require a host-matched Places result. Web search may provide cached evidence, so date-sensitive certifications must be verified directly before a definitive report.
The OneHouse editorial report and homepage concept are under `/forslag/onehouse/`, excluded from indexing. They are proposals on Waltham, not changes to OneHouse's domain.
