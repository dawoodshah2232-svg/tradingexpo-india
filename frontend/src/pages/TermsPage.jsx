import React from 'react';
import { Reveal } from '../components/ui.jsx';

/* Terms & conditions — tickets, exhibitors, conduct and liability. */
export default function TermsPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container narrow">
          <Reveal as="p" className="eyebrow">Legal</Reveal>
          <Reveal as="h1">Terms &amp; <span className="grad">conditions.</span></Reveal>
          <Reveal as="p" className="section-lead">The rules for attending, exhibiting and using this website.</Reveal>
          <Reveal as="p" className="muted">Last updated: 29 September 2026</Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container narrow legal-doc">
          <h2>1. About these terms</h2>
          <p>
            These terms govern your use of this website and your attendance at or participation in
            Trading Expo India 2027 (the &ldquo;Event&rdquo;), organised by
            <strong> ProFX Media FZ-LLC</strong> (&ldquo;Organiser&rdquo;). By booking a ticket or booth,
            or by using this website, you agree to these terms.
          </p>

          <h2>2. The event</h2>
          <p>The Event is scheduled for <strong>23–24 April 2027 in India</strong> (exact venue to be announced). The Organiser may change dates, venue, programme, speakers or format if circumstances require, and will publish any change on this website.</p>

          <h2>3. Tickets</h2>
          <ul>
            <li>Ticket passes include entry to the exhibition areas and, depending on the pass type, conference sessions and networking areas as described at booking.</li>
            <li>Tickets are generally <strong>non-refundable</strong>, except where required by applicable law. If the Event is cancelled, ticket holders are refunded. If it is rescheduled, tickets remain valid for the new dates.</li>
            <li>Passes are for the named holder and may not be resold for commercial gain without written permission.</li>
            <li>Early-bird pricing is limited to the advertised allocation; prices rise once it is exhausted.</li>
            <li>You must be 18 or older to purchase a ticket or attend.</li>
          </ul>

          <h2>4. Exhibitors &amp; sponsors</h2>
          <ul>
            <li>Booth reservations are confirmed by the Organiser in writing after pricing and availability are agreed; no payment is taken at reservation.</li>
            <li>Booth locations are allocated on a first-come, first-served basis.</li>
            <li>Exhibitors must comply with the exhibitor manual (setup times, safety, sound levels) and the venue&rsquo;s rules.</li>
            <li>Exhibitors are responsible for their own staff, equipment, insurance and promotional materials.</li>
          </ul>

          <h2>5. Code of conduct</h2>
          <p>All attendees, exhibitors, speakers and staff are expected to behave professionally. Harassment, fraud, misrepresentation or disruptive behaviour may result in removal from the Event without refund. Trading and investment content at the Event is educational and is <strong>not financial advice</strong>.</p>

          <h2>6. Media &amp; photography</h2>
          <p>The Organiser may photograph and record the Event for promotional use. If you do not wish to appear, tell the registration desk on arrival and we will take reasonable steps to accommodate you.</p>

          <h2>7. Limitation of liability</h2>
          <p>The Organiser is not liable for any loss or damage arising from attendance, travel or accommodation, except where caused by its negligence. Attendees are responsible for their own travel, health and personal belongings.</p>

          <h2>8. Website use</h2>
          <ul>
            <li>Content on this site is for general information about the Event and may change without notice.</li>
            <li>You must not misuse the site, attempt to gain unauthorised access, or submit spam or malicious content through its forms.</li>
            <li>The site may link to third-party websites; we are not responsible for their content.</li>
          </ul>

          <h2>9. Governing law</h2>
          <p>These terms are governed by the laws of the jurisdiction in which the Organiser is registered, and disputes are subject to the exclusive jurisdiction of its courts.</p>

          <h2>10. Contact</h2>
          <p>Questions about these terms: <a href="mailto:info@tradingexpo.com">info@tradingexpo.com</a>.</p>
        </div>
      </section>
    </main>
  );
}
