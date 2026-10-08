# ARCHITECTURE — Trading Expo India 2027

## Parts
1. **frontend/** — React 18.3 + Vite 5 source. Multi-page app: 12 page entries (`index, tickets, exhibit, agenda, venue, gallery, sponsors, awards, blog, faq, contact, portal`) plus generated `/blog/<slug>.html` shells. Builds to `frontend/dist`, which is published to the `gh-pages` branch (hashed JS/CSS assets, `./` relative base so it works on any sub-path).
2. **backend/** — Laravel 10.50.3 API on PHP 8.1 + MySQL. Serves bookings, portal auth, announcements, contact, newsletter. NOT deployed to GitHub Pages; production target is cPanel (see backend/README.md).
3. **api/** + **db/schema.sql** — Legacy flat-PHP cPanel backend (`api/book.php` booking endpoint + ticket email, `api/config.php`, SQL schema). Alternative production path to Laravel; currently superseded, kept for reference.
4. **Root static files** (`index.html`, `tickets.html`, … `script.js`, `styles.css`, `portal.js`) — Legacy v1 static site, kept at main root. The live Pages site is built from `frontend/`, not these.
5. **scripts/** — Build/maintenance scripts at repo root.
6. **Blog** — Static article HTML in `blog/` (+ `assets/blog-index.json` on gh-pages), generated via `npm run gen:blog` in frontend.

## Folders (main branch)
```
frontend/            React 18 + Vite 5 source
  src/pages/         13 page components (Home, Tickets, Exhibit, Agenda, Venue,
                     Gallery, Sponsors, Awards, Blog, Post, Faq, Contact, Portal)
  src/components/    Layout, ui (Reveal/CountUp/Countdown), BookingFlow,
                     Gallery, Faq, AgendaTabs
  src/entries/       12 page entry points + post.jsx (Vite rollup inputs)
  src/lib/           api.js (backend client), theme.jsx (theme + asset base)
  src/data/          agenda-faq, posts, sponsors-faq, venue-faq
  src/assets/img/    site imagery
backend/             Laravel 10 API (app/, routes/, database/migrations/, tests/)
api/ + db/           legacy flat-PHP backend + SQL schema
scripts/             repo-root helper scripts
docs/                this folder
```

## Data flow
- Browser → `src/components/BookingFlow.jsx` → `src/lib/api.js`:
  - If `VITE_API_BASE` Laravel API is reachable and returns valid JSON → real DB booking (`POST /api/bookings` → `{ok, ref, password}`).
  - Otherwise (GitHub Pages preview) → transparent fallback to the **localStorage demo store**; ticket generated instantly in-browser, downloadable. Only valid JSON counts as "real"; network errors/timeouts/HTML responses all mean demo mode.
- Ticket emails: backend only (Laravel mail / flat-PHP `mail()` in legacy path).
- Portal login: booking `{ref, password}` session; admin login `ADMIN_USER`/`ADMIN_PASS` → Sanctum Bearer token stored in `sessionStorage` (`txi_admin_token`).
- Rate limits (Laravel): 30/min on booking/contact/newsletter/auth, 120/min elsewhere.

## Deploy flow
1. Work happens on `main` (feature branches: `feat/50-blogs`, `feat/portal-crm`, `feat/seo-aeo`, `feat/sponsors-awards`, `feat/visual-motion`, `qa/compliance-*`, `rebuild/react-laravel`).
2. `vite build` in frontend/ → output merged into `gh-pages` branch → GitHub Pages serves the project site.
3. Backend is never auto-deployed (owner standing rule): Laravel code stays on GitHub until reviewed and manually deployed to cPanel.
