# PRD — Trading Expo India 2027

## What it is
Public event website for **Trading Expo India 2027**, an exhibition + conference for online trading, fintech and financial markets, organized by **ProFX Media FZ-LLC**. Live at https://dawoodshah2232-svg.github.io/tradingexpo-india/ (GitHub Pages project site).

## Goal
Drive ticket sales, exhibitor bookings, sponsor signups and speaker applications for the event, and rank on search/AI-search for trading-expo content via a growing SEO blog.

## Verified event facts (do not contradict; anything else is TODO)
- Dates: 23–24 April 2027 (two full days), 09:00 IST day 1 start.
- Location: India — host city and venue **not announced** (venue page says TBA).
- Organizer: ProFX Media FZ-LLC (https://TradingExpo.com).
- Scale cited: 10,000+ visitors, 70–80 exhibitors, 80+ speakers.
- Ticket tiers (early bird / regular): Trader Rs.249 / Rs.499; Pro Trader Rs.999 / Rs.1,499; VIP Rs.2,499 / Rs.3,999.
- Program: exhibition floor, two-day conference (keynotes, panels, workshops), networking sessions, awards night.
- Audience: retail and professional traders, investors, brokers, IBs, fintech founders, payment providers, educators, analysts.
- Markets covered: forex, crypto, equities, derivatives, fintech.

## Features (shipped, verified in repo)
- 12 pages: Home, Tickets, Exhibit, Agenda, Venue, Gallery, Sponsors, Awards, Blog, FAQ, Contact, Portal (+ blog article pages, 65 articles as of 2026-10-06).
- Ticket/exhibitor booking flow with unique booking reference (TXI27-/EXB27- prefix) + 6-char portal password.
- Ticket-holder portal: re-download tickets, booking details.
- Exhibitor portal: booth profile, team, uploads (backend-dependent parts fall back gracefully).
- Admin portal: announcements, booking list, settings (Sanctum auth when backend present).
- Countdown to 23 Apr 2027 09:00 IST, dark/light theme toggle, scroll-reveal animations, animated counters.
- SEO: per-page meta/OG/canonical, JSON-LD Event + BreadcrumbList, sitemap.xml, robots.txt, llms.txt, static prerender shells per page, 404 page.

## Explicitly NOT promised
- Speaker lineup, award categories, venue — announced closer to the event; never present unannounced names as confirmed.
