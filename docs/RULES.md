# RULES — Trading Expo India 2027

## Stack (fixed by owner)
- Frontend: React 18.3 + Vite 5 (`frontend/`). No framework swaps.
- Backend: Laravel **10** on PHP 8.1 + MySQL (`backend/`). **Do NOT upgrade Laravel** — cPanel hosting runs PHP 8.1; owner requires Laravel 10.
- `composer.json` sets `policy.advisories.block: false` (documented exception: Laravel 10 is EOL with published advisories, owner explicitly accepted). Keep deps at newest Laravel-10-compatible versions; review advisories manually before every deploy.
- Preview hosting: GitHub Pages (static only). Production backend: cPanel + MySQL + PHP.

## Git workflow
- `git fetch origin` + pull latest `main` before ANY work. Never push from a stale copy.
- Never force-push. Never `git reset --hard`.
- Feature branches merge to `main`; build output merges to `gh-pages`.
- GitHub Pages rule: after each push, poll `gh api repos/dawoodshah2232-svg/tradingexpo-india/pages/builds` and wait for status `built` before pushing again. Never rapid-push.

## What AI must do
- Inspect before editing; test after editing. Never claim success before verifying.
- Keep `docs/TASKS.md` and `docs/MEMORY.md` updated as work completes.
- Preserve working functionality; merge cleanly, keep old working code intact.
- Load apple-design + web-animations skills for any UI work (owner standing rule).
- Content honesty: only confirmed facts for speakers, venue, awards, stats, ticket prices. Unannounced = "announcing soon" / TBA, never invented names or numbers. Blog articles must use real, verifiable facts — no fabricated stats.

## What AI must NOT do
- No fake success states: on the Pages preview the localStorage demo store is fine, but never present demo data as a live backend.
- No emojis in UI. Icons = Heroicons inline SVG only.
- Never Roboto/Titillium/Montserrat as primary font (Apple stack is the rule; see DESIGN.md).
- Logos used raw (assets/logo-dark.png, logo-light.png + compact variants) — never put them on cards/boxes.
- Backend code is never auto-deployed: code goes to GitHub, stays OFF live until reviewed and owner approves. Applies to all projects.
- Don't touch `.env` contents, and never commit `backend/.env` (gitignored).
- Backend tests: `php artisan test` uses SQLite in-memory — never point tests at MySQL.
