# MEMORY — Trading Expo India 2027

Progress log from git history + repo state. Newest first.

## 2026-10-10
- Traffic-launch audit (read-only checks vs live https://dawoodshah2232-svg.github.io/tradingexpo-india/): homepage 200 no redirects; title 59 chars, desc 157 chars, 1 h1, canonical, 5/5 OG — all OK. NO Google Analytics (G-/UA- none in HTML or assets bundles), NO GSC verification, NO AdSense script. robots.txt allow-all + sitemap ref — live OK. sitemap.xml valid, 80 URLs (67 blog articles — 2 more than recorded 65), sampled 3 → 200. privacy.html + terms.html are real full pages (2630/3674 visible chars, no lorem).
- DRIFT vs recorded: RBI article (Oct 9, post-SEO-sweep) has 217-char meta description (>160 rule); all other sampled titles ≤60.
- FIX APPLIED: /ads.txt was missing (404). Added exact publisher line `google.com, pub-6908561724114744, DIRECT, f08c47fec0942fa0` on main (18121c1) + deployed per convention to gh-pages (c0f8945); Pages build `built`; live verified 200 with exact content.

## 2026-10-08
- 20-fix SEO sweep (audit > fix > verify), committed + deployed to Pages:
  - privacy.html + terms.html rewritten as full self-contained static pages (were empty shells pointing at JS/CSS bundles missing from gh-pages — both pages rendered blank on live). Now: h1, real sections, inline styles, canonical, OG, BreadcrumbList JSON-LD, footer nav. Content written from repo facts only (organiser ProFX Media FZ-LLC, info@tradingexpo.com, 23–24 Apr 2027) — needs owner's legal review (TODO in TASKS.md).
  - All 65 blog articles: <title> trimmed to ≤60 chars (headline at word boundary), 2 descriptions >160 trimmed, og:image/twitter:image → absolute https .webp URLs (7 articles had relative/jpg OG images; 53 had relative og-image).
  - Page heads: awards.html title 66→55 chars + added missing og:url + relative og:image → absolute; sponsors.html title 68→37; blog.html description updated (55→65 articles) and ≤160.
  - frontend/blog/: 2 missing post shells generated (jane-street, sebi-jagrook); all 65 shells re-synced with article heads.
  - 404.html copied from gh-pages into main (was missing on main; would be lost on a clean redeploy).
  - Mobile: menu-btn tap target ≥44px in ≤900px query (theme-toggle/nav already ≥44px; body overflow-x hidden; tables in scroll wrappers).
  - Verified: vite build clean; all 12 dist pages OK (title≤60, desc≤160, 1 h1, canonical, 5/5 OG, valid JSON-LD); 65 dist blog shells OK; zero missing local asset refs in dist.
- GSC verification + sitemap submission still needs owner action in Search Console UI (TODO in TASKS.md); backlink strategy note added (earn via content only, never buy/spam).

## 2026-10-06
- Blog: "Jane Street vs SEBI at SAT — Bank Nifty expiry fight, Oct 6 hearing" published (91360ab).
- Deployed main → gh-pages (91dddf4 merge).

## 2026-10-03
- Blog: "SEBI's Project Jagrook — new awareness warnings on broker apps and websites" (84553ac); deployed (aff0efd).

## 2026-09-30
- SEO sweep deployed to Pages: static article HTML, webp images, prerender shells, head fixes (2fd65ad, ab2c67c).
- privacy.html + terms.html restored into sitemap and footer nav (eea79c1).
- Blog: "FIU-IND's September crackdown on 15 offshore crypto platforms" (8bde9f9, 57a0763).

## 2026-09-29
- **Rebuild**: React 18 + Vite frontend + Laravel 10 API backend merged (ad76b75); deployed to GitHub Pages (a228a02).
- Portal admin settings + announcement delete wired to Laravel API (2ba4ee5).
- QA compliance build: privacy+terms, robots/sitemap, 404, honeypot, image compression (8f69d83, bb523fe).

## 2026-09-28 → 2026-09-25
- Blog cadence: "The Great Indian Flow Split" (FPI vs IPO, Sep 2026), "NSE's BSE debut", "SEBI 2026 F&O study — 87.7% retail loss rate", "India's Demat Boom 2026 — 237.7M accounts", 3 expo guides.

## 2026-09-24 (v1)
- Single-page premium Apple-style site with countdown, light/dark themes, JSON-LD Event schema (b885020). Live preview shell ready for owner's content pass.

## Standing state
- Live: https://dawoodshah2232-svg.github.io/tradingexpo-india/ (65 blog articles, 12 pages, portal).
- Awaiting owner: venue/city, speaker lineup, award categories, sponsors, ticket finalization, blog/content direction.
- Backend (Laravel 10): coded + tested, NOT deployed — waits on owner review + manual cPanel deploy.
- Next: owner content pass → fill venue/speakers/awards → backend deploy → phone verification → GSC sitemap.
