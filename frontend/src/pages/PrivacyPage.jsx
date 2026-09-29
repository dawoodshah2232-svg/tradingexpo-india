import React from 'react';
import { Reveal } from '../components/ui.jsx';

/* Privacy policy — event data handling, storage and contact points. */
export default function PrivacyPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container narrow">
          <Reveal as="p" className="eyebrow">Legal</Reveal>
          <Reveal as="h1">Privacy <span className="grad">policy.</span></Reveal>
          <Reveal as="p" className="section-lead">How Trading Expo India 2027 collects, uses and protects your information.</Reveal>
          <Reveal as="p" className="muted">Last updated: 29 September 2026</Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container narrow legal-doc">
          <h2>1. Who we are</h2>
          <p>
            Trading Expo India 2027 is organised by <strong>ProFX Media FZ-LLC</strong>
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;). This policy explains what personal information we
            collect when you use this website, book tickets or a booth, or contact us —
            and what we do with it. Contact: <a href="mailto:info@tradingexpo.com">info@tradingexpo.com</a>.
          </p>

          <h2>2. Information we collect</h2>
          <ul>
            <li><strong>Booking details</strong> — name, email address, phone number, city and, for exhibitors, company name, website and booth preferences.</li>
            <li><strong>Enquiries</strong> — whatever you send us through the contact form or by email (name, email, message).</li>
            <li><strong>Portal data</strong> — booking references, team members, leads and offers you add in the exhibitor portal.</li>
            <li><strong>Technical information</strong> — the browser and device type collected automatically by standard web server logs. We do not run third-party analytics or advertising trackers on this site.</li>
          </ul>

          <h2>3. How we use your information</h2>
          <ul>
            <li>To process ticket and booth reservations and provide your portal access.</li>
            <li>To communicate with you about the event — confirmations, updates, schedules and changes.</li>
            <li>To operate the event: entry management, exhibitor services and support.</li>
            <li>To improve the website and prevent misuse.</li>
          </ul>
          <p>We do not sell your personal information. We share it only with service providers who help run the event (for example payment or email providers) and only as much as they need, or where required by law.</p>

          <h2>4. Storage on your device</h2>
          <p>
            This website uses your browser&rsquo;s <strong>local storage</strong> to remember your
            theme preference and any demo booking data you create on this device, and
            <strong>session storage</strong> for portal sign-in tokens. This data stays on your
            device and in our event database — it is not sold or used for advertising.
            Clearing your browser storage removes it from the device.
          </p>

          <h2>5. Cookies</h2>
          <p>We do not set tracking or advertising cookies. Because no cookies are used for analytics or marketing, no cookie-consent banner is shown.</p>

          <h2>6. Data retention</h2>
          <p>Booking and enquiry records are kept for up to 3 years after the event for operational and legal purposes, then deleted or anonymised. You can ask us to delete your data sooner — see section 8.</p>

          <h2>7. Security</h2>
          <p>We use reasonable technical and organisational measures to protect your information, including encrypted connections (HTTPS) and access controls. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.</p>

          <h2>8. Your rights</h2>
          <p>You may request a copy of the information we hold about you, ask us to correct it, or ask us to delete it, by emailing <a href="mailto:info@tradingexpo.com">info@tradingexpo.com</a>. We respond within a reasonable time, typically within 30 days.</p>

          <h2>9. Children</h2>
          <p>This site is intended for adults. We do not knowingly collect information from children under 18.</p>

          <h2>10. Changes to this policy</h2>
          <p>We may update this policy as the event or our practices change. The latest version is always published at this page, with the update date shown above.</p>
        </div>
      </section>
    </main>
  );
}
