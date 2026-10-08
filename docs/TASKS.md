# TASKS — Trading Expo India 2027

Sequenced, small. Unknowns are TODO, not guesses.

## Done
- [x] React 18 + Vite 5 frontend rebuild (multi-page, 12 entries + blog shells) — 2026-09-29
- [x] Laravel 10 API backend (bookings, portal auth, announcements, contact, newsletter; 19 PHPUnit tests) — 2026-09-29
- [x] Portal wiring: admin settings + announcement delete to Laravel API — 2026-09-29
- [x] QA compliance build: privacy/terms pages, robots.txt, sitemap.xml, 404, honeypot, image compression — 2026-09-29
- [x] SEO sweep: static article HTML, webp images, prerender shells, head fixes — 2026-09-30
- [x] Blog publishing cadence (65 articles live as of 2026-10-06; e.g. FIU-IND crackdown, SEBI F&O study, Demat boom, Jane Street vs SEBI)
- [x] Dark/light theme toggle, countdown, JSON-LD Event schema, llms.txt, breadcrumb schema — live
- [x] Event brochure PDF in `assets/brochure/`

## In progress
- [ ] Blog cadence continues (feat/50-blogs branch open; 65 articles published — target/plan is TODO)
- [ ] feat/portal-crm, feat/seo-aeo, feat/sponsors-awards, feat/visual-motion branches open — merge status TODO

## TODO (sequenced)
1. [ ] Owner content pass: venue/city confirmation, speaker lineup, award categories, sponsor logos, ticket finalization (owner said he would send content; nothing received yet — do NOT invent)2. [ ] Decide source of truth for pages: root legacy static HTML vs `frontend/` React (both exist on main; live Pages site builds from `frontend/`)
3. [ ] Remove or confirm legacy `script.js` / `styles.css` at gh-pages root (v1 leftovers, not referenced by hashed bundles)
4. [ ] Backend production deploy: Laravel to cPanel (DB, env, SMTP) — requires owner review + manual deploy; api/ flat-PHP path is the fallback option
5. [ ] Wire booking confirmation emails end-to-end once backend is live
6. [ ] Exhibitor onboarding content (booth packages, pricing) — confirm from owner before publishing
7. [ ] Post-deploy: verify all 12 pages + portal flows on a real phone, submit sitemap to Google Search Console
8. [ ] SEO follow-ups (owner-side): (a) Google Search Console — Dawood verifies the property in the GSC UI (HTML file or DNS), then submits `https://dawoodshah2232-svg.github.io/tradingexpo-india/sitemap.xml`; nothing repo-side can substitute the UI step. (b) Legal review of privacy.html + terms.html (agent-drafted 2026-10-08 from repo facts; have counsel/owner confirm before treating as final).
9. [ ] Backlink strategy (earn via content only — NEVER buy links, link farms, or spam): publish the 65-article blog library as the linkable asset; announce the expo via press release to Indian fintech/trading media; ask confirmed speakers/exhibitors/sponsors to link the expo from their sites; list the event in legitimate Indian event/startup directories; guest posts on trading publications linking back to guides. No fake reviews/ratings, no keyword stuffing, no thin pages.
