# Trading Expo India 2027 — Backend API

Laravel **10.50.3** on **PHP 8.1** (owner requirement — do not upgrade to Laravel 11+),
MySQL database. Serves the React frontend's booking, portal, announcements,
contact and newsletter features.

## Setup (cPanel / production)

1. `composer install --no-dev --optimize-autoloader`
2. Copy `.env.example` to `.env` and fill in:
   - `APP_KEY` (run `php artisan key:generate`)
   - `DB_*` — MySQL credentials
   - `ADMIN_USER` / `ADMIN_PASS` — portal admin login (no defaults; login fails closed if unset)
   - `MAIL_*` — SMTP for booking confirmation emails
3. `php artisan migrate --force`
4. Point the frontend at it: `VITE_API_URL=https://your-domain.com/api`

## API endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | health check |
| POST | `/api/bookings` | — | create ticket / exhibitor booking → `{ok, ref, password}` |
| POST | `/api/auth/login` | — | booking login `{ref, password}` → session |
| POST | `/api/auth/admin` | — | admin login `{user, pass}` → Sanctum token |
| POST | `/api/auth/logout` | Sanctum | revoke token |
| GET | `/api/announcements` | — | published announcements |
| POST | `/api/announcements` | Sanctum | create announcement |
| GET | `/api/admin/bookings` | Sanctum | booking list (filter `?type=`) |
| POST | `/api/contact` | — | contact message |
| POST | `/api/newsletter` | — | newsletter subscribe |

Rate limits: 30/min on booking/contact/newsletter/auth, 120/min elsewhere.

## Tests

`php artisan test` — 19 tests, SQLite in-memory.

## Note: Composer advisory policy

`composer.json` sets `policy.advisories.block: false`. Laravel 10 is end-of-life
and carries published security advisories, so Composer refuses to install it
with the default blocking policy. The owner explicitly requires Laravel 10
(hosting runs PHP 8.1), so the block is disabled as a documented exception —
not an oversight. Keep dependencies at the newest Laravel-10-compatible
versions; review advisories manually before each deploy.
