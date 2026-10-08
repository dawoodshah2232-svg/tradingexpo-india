# DESIGN — Trading Expo India 2027

Source of truth: `frontend/src/styles.css` CSS variables; brand from `assets/logo-*.png`.

## Theme
- Dark default, light toggle. `<html data-theme="dark|light">`, persisted in localStorage key `txi-theme`. Theme-color meta: `#00C853`.
- Dark: bg `#05080e`, bg-alt `#0a0f18`, bg-raise `#0e1522`, card `#0b111c`, text `#f5f5f7`, muted `#a1a1a6`, border `rgba(255,255,255,.1)`, nav `rgba(5,8,14,.55)` (translucent + backdrop blur).
- Light: bg `#F4F8FA`, bg-alt `#eef3f6`, card `#ffffff`, text `#1d1d1f`, muted `#6e6e73`, border `rgba(0,0,0,.09)`, nav `rgba(244,248,250,.7)`.
- Brand: logo navy `#0B1F3B`, logo green `#00C853` (dark) / `#00A86B` (light accent), accent `#00A86B`, CTA gradient `#00C853 → #008a44`, gold `#e8c15a` / `#8a6d1c`.

## Typography
- Display: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif`
- Body: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif` (Roboto is last-resort fallback only, never primary)
- Uppercase eyebrow labels in brand green; gradient headline text (green) on hero.

## Buttons (`.btn` base; press feedback `scale(0.96)`)
- `.btn-primary` — green gradient (`#00C853→#008a44`), white text, glow shadow; hover lifts `translateY(-3px) scale(1.02)`.
- `.btn-glass` — frosted white `rgba(255,255,255,.1)`, blur(12px), for dark heroes.
- `.btn-ghost` — transparent, text color, border.
- `.btn-outline` — transparent, green border/text; fills green on hover.
- Sizes: `.btn-sm` (10px 22px, 14px), `.btn-lg` (17px 40px, 16.5px), `.btn-block` (full width).

## Spacing / layout
- Container: max-width `1200px`, side padding `28px`. Nav height `68px`.
- Cards: border-radius `22px`; shadows `0 10px 40px rgba(0,0,0,.55)` (dark).
- Grids: 12-col feel on desktop, stack on mobile; mobile-first, no horizontal scroll, tap targets sized.

## Motion (web-animations + apple-design standards)
- `Reveal` component: IntersectionObserver scroll reveal, stagger via `--rd` delay (e.g. index × 0.08s), one-shot.
- `CountUp`: 1600ms ease-out-cubic count, `en-IN` formatting, runs once on view.
- Countdown to 2027-04-23T09:00:00+05:30.
- Hover language: lift `translateY(-3px)`, press `scale(0.96)`; interruptible, transform/opacity only; respect `prefers-reduced-motion`.

## Brand rules (owner standing)
- Logos (`logo-dark.png`, `logo-light.png`, compact variants) used raw everywhere — never on a card/box/background behind them.
- No emojis in UI. Icons = Heroicons inline SVG only (theme sun/moon, section icons).
- Hero imagery: faded cinematic webp (`hero-expo`, `expo-grand-hall`, `keynote-stage`) — fades into the page, never flat banners. Event brochure PDF in `assets/brochure/`.
- Favicons 16/32/512 + apple-touch-icon; og-image.png for social cards.
