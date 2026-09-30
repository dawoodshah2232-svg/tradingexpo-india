import React from 'react';
import { Reveal, CountUp, Countdown, MarketTicker, ParallaxImg, ParallaxLayer } from '../components/ui.jsx';
import { GalleryTrack } from '../components/Gallery.jsx';
import { useAssetBase } from '../lib/theme.jsx';

const GALLERY = [
  { img: 'img/expo-grand-hall.webp', alt: 'Grand exhibition hall', top: 'The Grand Hall', bottom: '10,000+ visitors under one roof' },
  { img: 'img/expo-main-stage.webp', alt: 'Main stage keynote', top: 'Main Stage', bottom: 'Keynotes that set the agenda' },
  { img: 'img/expo-floor-aerial.webp', alt: 'Exhibition floor aerial view', top: 'The Floor', bottom: '70–80 brands, live and hands-on' },
  { img: 'img/expo-registration.webp', alt: 'Registration area', top: 'Welcome', bottom: 'Fast-track entry for pass holders' },
  { img: 'img/expo-networking.webp', alt: 'Networking lounge', top: 'The Lounge', bottom: 'Where deals get started' },
  { img: 'img/expo-vip-lounge.webp', alt: 'VIP lounge', top: 'VIP', bottom: 'An experience above it all' },
  { img: 'img/india-mumbai-skyline.webp', alt: 'Mumbai skyline at dusk', top: 'Host Nation', bottom: "India's trading moment" },
  { img: 'img/brand-lockup.webp', alt: 'Trading Expo official brand identity', top: 'The Identity', bottom: 'Traders · Brokers · Technology' },
];

const STATS = [
  { end: 10000, suffix: '+', label: 'Expected Visitors' },
  { end: 75, suffix: '', label: 'Exhibitors & Brands' },
  { end: 80, suffix: '+', label: 'Industry Speakers' },
  { end: 2, suffix: '', label: 'Powerful Days' },
];

const EXP = [
  { img: 'img/expo-floor-aerial.webp', alt: 'Exhibition floor from above', h: '70–80 Exhibitors', p: 'Brokers, fintech and trading tech — live on the floor.' },
  { img: 'img/expo-main-stage.webp', alt: 'Main stage keynote', h: '80+ Speakers', p: 'Keynotes, panels and fireside chats across two days.' },
  { img: 'img/expo-networking.webp', alt: 'Networking lounge', h: 'Networking', p: "Meet India's traders, IBs, affiliates and industry leaders." },
];

const TICKETS = [
  { h: 'Trader Pass', amount: '₹249', was: 'Regular ₹499', desc: '2-day exhibition access, booths, demos & networking areas.', featured: false },
  { h: 'Pro Trader Pass', amount: '₹999', was: 'Regular ₹1,499', desc: 'Full 2-day conference access, priority seating & fast-track entry.', featured: true },
  { h: 'VIP Pass', amount: '₹2,499', was: 'Regular ₹3,999', desc: 'VIP lounge, reserved seating & exclusive networking sessions.', featured: false },
];

const FAQ_TEASER = [
  { q: 'When is Trading Expo India 2027?', a: '23 and 24 April 2027, in India. The venue city will be announced soon.', open: true },
  { q: 'How much are tickets?', a: 'Early bird passes start at ₹249 (Trader), ₹999 (Pro Trader) and ₹2,499 (VIP). Prices rise as the event approaches.' },
  { q: 'Can my company exhibit?', a: 'Yes — booths and sponsorships are available to approved companies. Reserve your space on the Exhibit page.' },
  { q: 'Is there an exhibitor portal?', a: 'Yes. After reserving, log in to the Exhibitor Portal with your booking reference to manage tickets, team badges and branding uploads.' },
  { q: 'Are tickets refundable?', a: 'Tickets are generally non-refundable except where required by law or stated in the official terms.' },
];

const AEO_FAQ = [
  { q: 'When is Trading Expo India 2027?', a: 'Trading Expo India 2027 takes place on 23–24 April 2027 — two full days of exhibitions, conferences and networking. Doors open in the morning and the program runs through the evening on both days, ending with the awards night. Mark your calendar early, because early bird ticket prices are only available for a limited time.' },
  { q: 'Where is Trading Expo India 2027 held?', a: 'The expo takes place in India on 23–24 April 2027, and the host city and venue will be announced soon. Once confirmed, the venue page will carry full travel guidance — how to reach the venue, where to stay nearby and what to expect on arrival. Subscribe to announcements or check back for the official reveal.' },
  { q: 'What is Trading Expo India 2027?', a: "It is India's premier exhibition and conference for online trading, fintech and financial markets. Over two days, traders, brokers, investors, fintech companies and educators come together for exhibitions, keynotes, panels, workshops and deal-making — all under one roof. Expect 10,000+ visitors, 70–80 exhibitors and 80+ speakers." },
  { q: 'Who should attend Trading Expo India 2027?', a: 'Retail and professional traders, investors, brokers, IBs, fintech founders, payment providers, educators, analysts and anyone curious about financial markets. Whether you trade forex, crypto, equities or derivatives — or you build products for people who do — the expo is built for you.' },
  { q: 'How much do Trading Expo India 2027 tickets cost?', a: 'Early bird prices are Trader ₹249, Pro Trader ₹999 and VIP ₹2,499; regular prices are ₹499, ₹1,499 and ₹3,999. The Trader pass covers the exhibition floor, Pro Trader adds conference access and workshops, and VIP adds premium lounge access, front-row seating and exclusive networking. Book on the tickets page.' },
  { q: 'Who is organizing Trading Expo India 2027?', a: 'The expo is organized by ProFX Media FZ-LLC, an events and media company focused on the trading and fintech industry. The team runs the full program — exhibitions, conferences, sponsorships and the awards night — and supports exhibitors, sponsors and attendees from booking through the event days.' },
  { q: 'How big is Trading Expo India 2027?', a: 'The expo expects 10,000+ visitors, 70–80 exhibitors and 80+ speakers across two days. That makes it one of the largest dedicated trading and fintech gatherings in India — a full exhibition floor, a two-day conference program and an awards night, all designed for maximum networking and deal-making.' },
  { q: 'Will there be an awards ceremony at the expo?', a: 'Yes. Trading Expo India 2027 includes a dedicated awards night celebrating outstanding performers across the trading and fintech ecosystem. Award categories, the nomination process and judging criteria will be announced closer to the event. It is one of the highlights of the two-day program — plan to stay for the evening.' },
];

const AEO_SCHEMA = '{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "When is Trading Expo India 2027?", "acceptedAnswer": {"@type": "Answer", "text": "Trading Expo India 2027 takes place on 23–24 April 2027 — two full days of exhibitions, conferences and networking. Doors open in the morning and the program runs through the evening on both days, ending with the awards night. Mark your calendar early, because early bird ticket prices are only available for a limited time."}}, {"@type": "Question", "name": "Where is Trading Expo India 2027 held?", "acceptedAnswer": {"@type": "Answer", "text": "The expo takes place in India on 23–24 April 2027, and the host city and venue will be announced soon. Once confirmed, the venue page will carry full travel guidance — how to reach the venue, where to stay nearby and what to expect on arrival. Subscribe to announcements or check back for the official reveal."}}, {"@type": "Question", "name": "What is Trading Expo India 2027?", "acceptedAnswer": {"@type": "Answer", "text": "It is India&#x27;s premier exhibition and conference for online trading, fintech and financial markets. Over two days, traders, brokers, investors, fintech companies and educators come together for exhibitions, keynotes, panels, workshops and deal-making — all under one roof. Expect 10,000+ visitors, 70–80 exhibitors and 80+ speakers."}}, {"@type": "Question", "name": "Who should attend Trading Expo India 2027?", "acceptedAnswer": {"@type": "Answer", "text": "Retail and professional traders, investors, brokers, IBs, fintech founders, payment providers, educators, analysts and anyone curious about financial markets. Whether you trade forex, crypto, equities or derivatives — or you build products for people who do — the expo is built for you."}}, {"@type": "Question", "name": "How much do Trading Expo India 2027 tickets cost?", "acceptedAnswer": {"@type": "Answer", "text": "Early bird prices are Trader ₹249, Pro Trader ₹999 and VIP ₹2,499; regular prices are ₹499, ₹1,499 and ₹3,999. The Trader pass covers the exhibition floor, Pro Trader adds conference access and workshops, and VIP adds premium lounge access, front-row seating and exclusive networking. Book on the tickets page."}}, {"@type": "Question", "name": "Who is organizing Trading Expo India 2027?", "acceptedAnswer": {"@type": "Answer", "text": "The expo is organized by ProFX Media FZ-LLC, an events and media company focused on the trading and fintech industry. The team runs the full program — exhibitions, conferences, sponsorships and the awards night — and supports exhibitors, sponsors and attendees from booking through the event days."}}, {"@type": "Question", "name": "How big is Trading Expo India 2027?", "acceptedAnswer": {"@type": "Answer", "text": "The expo expects 10,000+ visitors, 70–80 exhibitors and 80+ speakers across two days. That makes it one of the largest dedicated trading and fintech gatherings in India — a full exhibition floor, a two-day conference program and an awards night, all designed for maximum networking and deal-making."}}, {"@type": "Question", "name": "Will there be an awards ceremony at the expo?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Trading Expo India 2027 includes a dedicated awards night celebrating outstanding performers across the trading and fintech ecosystem. Award categories, the nomination process and judging criteria will be announced closer to the event. It is one of the highlights of the two-day program — plan to stay for the evening."}}]}';

export default function HomePage() {
  const ab = useAssetBase();
  return (
    <>
      <main>
        {/* ============ HERO ============ */}
        <section className="hero" id="top">
          <ParallaxLayer speed={0.25} className="hero-bg" data-parallax="0.25" aria-hidden="true" />
          <div className="hero-shade" aria-hidden="true"></div>
          <div className="hero-inner">
            <div className="hero-badge" data-hero>
              <span className="pulse-dot"></span>
              23–24 April 2027 &nbsp;·&nbsp; India
            </div>
            <h1 className="hero-title">
              <img className="hero-logo" src={ab + 'logo-dark.png'} alt="Trading Expo — official logo" data-hero />
              <span className="ht-line ht-sub" data-hero><span className="india-tag">INDIA&nbsp;2027</span></span>
            </h1>
            <p className="hero-tagline" data-hero>India's Premier Online Trading, Fintech &amp; Financial Markets Exhibition</p>
            <p className="hero-sub" data-hero>Two powerful days where <strong>Traders. Brokers. Technology.</strong> come together — in the heart of India's trading boom.</p>
            <div className="hero-ctas" data-hero>
              <a href="tickets.html" className="btn btn-primary btn-lg">Book Your Ticket</a>
              <a href="exhibit.html" className="btn btn-glass btn-lg">Become an Exhibitor</a>
            </div>
            <Countdown />
          </div>
          <a className="scroll-cue" href="#manifesto" aria-label="Scroll down"><span></span></a>
        </section>

        {/* ============ MARKET TICKER (sample snapshot) ============ */}
        <MarketTicker />

        {/* ============ MARQUEE ============ */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            <span>Traders</span><span>Brokers</span><span>Technology</span><span>Forex</span><span>Crypto</span><span>Fintech</span><span>Stocks</span><span>Derivatives</span><span>AI Trading</span><span>Networking</span>
            <span>Traders</span><span>Brokers</span><span>Technology</span><span>Forex</span><span>Crypto</span><span>Fintech</span><span>Stocks</span><span>Derivatives</span><span>AI Trading</span><span>Networking</span>
          </div>
        </div>

        {/* ============ MANIFESTO ============ */}
        <section className="manifesto" id="manifesto">
          <div className="container narrow">
            <Reveal as="p" className="eyebrow">The gathering</Reveal>
            <Reveal as="p" className="manifesto-text">India's trading community is exploding — and this is where it meets. Two days of exhibitions, conferences and deal-making in the world's most exciting market.</Reveal>
            <Reveal className="center"><a href="venue.html" className="btn btn-ghost">Why India</a></Reveal>
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section className="stats-band">
          <div className="container">
            <div className="stats-grid">
              {STATS.map((s, i) => (
                <Reveal key={i} className="stat" delay={i * 0.08}>
                  <CountUp as="strong" end={s.end} suffix={s.suffix} /><span>{s.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ ABOUT SNAPSHOT ============ */}
        <section className="section" id="about">
          <div className="container">
            <div className="split-head">
              <div>
                <Reveal as="p" className="eyebrow">About the event</Reveal>
                <Reveal as="h2" className="section-title">Where India's Traders<br />Meet the <span className="grad">World.</span></Reveal>
              </div>
              <Reveal as="p" className="split-lead">A two-day exhibition and conference connecting India's trading community with global brokers, fintech innovators and trading technology.</Reveal>
            </div>
            <Reveal as="figure" className="banner">
              <ParallaxImg src={ab + 'img/expo-grand-hall.webp'} alt="Grand exhibition hall at Trading Expo India" loading="lazy" data-parallax-img />
              <figcaption>The exhibition floor — 70–80 brands, live demos, real conversations</figcaption>
            </Reveal>
            <Reveal className="center"><a href="exhibit.html" className="btn btn-primary btn-lg">Exhibit With Us</a></Reveal>
          </div>
        </section>

        {/* ============ EXPERIENCE ============ */}
        <section className="section section-alt" id="experience">
          <div className="container">
            <Reveal as="p" className="eyebrow">The experience</Reveal>
            <Reveal as="h2" className="section-title">What you will <span className="grad">experience.</span></Reveal>
            <div className="exp-grid">
              {EXP.map((c, i) => (
                <Reveal as="article" key={i} className="exp-card" delay={i * 0.08}>
                  <img src={ab + c.img} alt={c.alt} loading="lazy" />
                  <div><h3>{c.h}</h3><p>{c.p}</p></div>
                </Reveal>
              ))}
            </div>
            <Reveal className="center"><a href="agenda.html" className="btn btn-ghost btn-lg">Explore the Agenda</a></Reveal>
          </div>
        </section>

        {/* ============ TICKETS TEASER ============ */}
        <section className="section" id="tickets">
          <div className="container">
            <Reveal as="p" className="eyebrow">Tickets</Reveal>
            <Reveal as="h2" className="section-title">Choose your <span className="grad">experience.</span></Reveal>
            <div className="ticket-grid mini">
              {TICKETS.map((t, i) => (
                <Reveal as="article" key={i} className={'ticket' + (t.featured ? ' ticket-featured' : '')} delay={i * 0.08}>
                  {t.featured && <span className="flag">Most Popular</span>}
                  <h3>{t.h}</h3>
                  <div className="price"><span className="amount">{t.amount}</span><span className="per">Early Bird</span></div>
                  <p className="was">{t.was}</p>
                  <p className="ticket-desc">{t.desc}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="center"><a href="tickets.html" className="btn btn-primary btn-lg">Book Your Ticket</a></Reveal>
            <Reveal className="lucky-strip">
              <div className="lucky-glow" aria-hidden="true"></div>
              <div>
                <strong>Lucky Draw — every ticket is an entry</strong>
                <span>All ticket holders are automatically entered into the lucky draw on Day 2.</span>
              </div>
              <a href="tickets.html" className="btn btn-primary">Enter with a Ticket</a>
            </Reveal>
          </div>
        </section>

        {/* ============ GALLERY PREVIEW ============ */}
        <section className="gallery-sec" id="gallery">
          <div className="container">
            <Reveal as="p" className="eyebrow">Inside the expo</Reveal>
            <Reveal as="h2" className="section-title">A glimpse of the <span className="grad">experience.</span></Reveal>
            <Reveal as="p" className="section-lead">Concept imagery — the world we're building for April 2027.</Reveal>
          </div>
          <GalleryTrack
            items={GALLERY.map((g) => ({ src: ab + g.img, alt: g.alt, top: g.top, bottom: g.bottom }))}
            navClassName="container gallery-nav"
            navExtra={<a href="gallery.html" className="btn btn-ghost" style={{ marginLeft: 12 }}>Open Full Gallery</a>}
          />
        </section>

        {/* ============ INDIA SPOTLIGHT ============ */}
        <section className="section" id="india">
          <div className="container">
            <Reveal as="p" className="eyebrow">Why India</Reveal>
            <Reveal as="h2" className="section-title">The world's most exciting<br />trading <span className="grad">market.</span></Reveal>
            <Reveal as="figure" className="banner">
              <ParallaxImg src={ab + 'img/india-mumbai-skyline.webp'} alt="Mumbai skyline at dusk" loading="lazy" data-parallax-img />
              <figcaption>India — mobile-first, high-growth, fintech-ready</figcaption>
            </Reveal>
            <Reveal className="india-cards">
              <div className="india-card"><strong>Mobile-first</strong><span>A generation trading from their phones</span></div>
              <div className="india-card"><strong>High-growth</strong><span>Rapidly expanding retail participation</span></div>
              <div className="india-card"><strong>Fintech-ready</strong><span>Deep digital-payments &amp; platform adoption</span></div>
            </Reveal>
            <Reveal className="center"><a href="venue.html" className="btn btn-ghost btn-lg">Venue &amp; Floor Plan</a></Reveal>
          </div>
        </section>

        {/* ============ SPONSORS STRIP ============ */}
        <section className="section section-alt" id="sponsors">
          <div className="container">
            <Reveal as="p" className="eyebrow">Sponsors &amp; partners</Reveal>
            <Reveal as="h2" className="section-title">Your brand, <span className="grad">centre stage.</span></Reveal>
            <Reveal as="p" className="section-lead">Partner announcements coming soon — reserve your place early.</Reveal>
            <div className="logo-wall" aria-label="Sponsor placeholders">
              {['Title Sponsor', 'Platinum', 'Gold', 'Silver', 'Media Partner', 'Media Partner'].map((tier, i) => (
                <Reveal key={i} className="logo-tile" delay={i * 0.06}><span>Your Logo</span><em>{tier}</em></Reveal>
              ))}
            </div>
            <Reveal className="center"><a href="sponsors.html" className="btn btn-primary btn-lg">Become a Sponsor</a></Reveal>
          </div>
        </section>

        {/* ============ FAQ TEASER ============ */}
        <section className="section" id="faq">
          <div className="container narrow">
            <Reveal as="p" className="eyebrow">FAQ</Reveal>
            <Reveal as="h2" className="section-title">Questions, answered.</Reveal>
            <div className="faq">
              {FAQ_TEASER.map((f, i) => (
                <Reveal as="details" key={i} className="faq-item" open={f.open || undefined}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="center"><a href="faq.html" className="btn btn-ghost">All FAQs</a></Reveal>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="final-cta" id="contact">
          <ParallaxLayer speed={0.15} className="final-bg" data-parallax="0.15" aria-hidden="true" />
          <div className="final-shade" aria-hidden="true"></div>
          <div className="container narrow">
            <Reveal as="p" className="eyebrow light">Final call</Reveal>
            <Reveal as="h2" className="final-title">India's trading community.<br /><span className="grad">One destination.</span></Reveal>
            <Reveal className="final-numbers">
              <span><strong>2</strong> days</span><span><strong>10,000+</strong> visitors</span><span><strong>70–80</strong> exhibitors</span><span><strong>80+</strong> speakers</span>
            </Reveal>
            <Reveal as="p" className="final-date">23–24 April 2027 · India</Reveal>
            <Reveal className="final-actions">
              <a href="tickets.html" className="btn btn-primary btn-lg">Book Tickets</a>
              <a href="exhibit.html" className="btn btn-glass btn-lg">Exhibit</a>
              <a href="sponsors.html" className="btn btn-glass btn-lg">Sponsor</a>
              <a href="portal.html" className="btn btn-glass btn-lg">Exhibitor Portal</a>
            </Reveal>
            <Reveal as="p" className="final-note">TradingExpo.com · Organized by ProFX Media FZ-LLC</Reveal>
          </div>
        </section>
      </main>

      {/* ============ AEO QUICK ANSWERS ============ */}
      <section className="aeo-quick-answers" aria-label="Quick answers">
        <div className="container">
          <h2 className="aeo-qa-title">Quick Answers</h2>
          <div className="aeo-qa-grid">
            <div className="aeo-qa-card">
              <h3 className="aeo-qa-q">When is Trading Expo India 2027?</h3>
              <p className="aeo-qa-a">23–24 April 2027 — two full days of exhibitions, conferences and networking in India.</p>
            </div>
            <div className="aeo-qa-card">
              <h3 className="aeo-qa-q">Where is it held?</h3>
              <p className="aeo-qa-a">In India. The host city and venue will be announced soon — check the venue page for updates.</p>
            </div>
            <div className="aeo-qa-card">
              <h3 className="aeo-qa-q">How much are tickets?</h3>
              <p className="aeo-qa-a">Early bird: Trader ₹249, Pro Trader ₹999, VIP ₹2,499. Book on the tickets page.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AEO FAQ ============ */}
      <section className="aeo-faq" aria-label="Frequently asked questions">
        <div className="container">
          <h2 className="aeo-faq-title">Frequently Asked Questions</h2>
          {AEO_FAQ.map((f, i) => (
            <details className="aeo-faq-item" key={i}>
              <summary className="aeo-faq-q">{f.q}</summary>
              <p className="aeo-faq-a">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: AEO_SCHEMA }} />
    </>
  );
}
