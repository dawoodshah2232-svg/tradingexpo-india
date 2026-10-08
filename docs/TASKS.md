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
1. [ ] Owner content pass: venue/city confirmation, speaker lineup, award categories, sponsor logos, ticket finalization (owner said he would send content; nothing received yet — do NOT invent)
2. [ ] Decide source of truth for pages: root legacy static HTML vs `frontend/` React (both exist on main; live Pages site builds from `frontend/`)
3. [ ] Remove or confirm legacy `script.js` / `styles.css` at gh-pages root (v1 leftovers, not referenced by hashed bundles)
4. [ ] Backend production deploy: Laravel to cPanel (DB, env, SMTP) — requires owner review + manual deploy; api/ flat-PHP path is the fallback option
5. [ ] Wire booking confirmation emails end-to-end once backend is live
6. [ ] Exhibitor onboarding content (booth packages, pricing) — confirm from owner before publishing
7. [ ] Post-deploy: verify all 12 pages + portal flows on a real phone, submit sitemap to Google Search Console
