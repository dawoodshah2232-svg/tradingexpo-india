import React from 'react';
import { Reveal } from '../components/ui.jsx';
import { GalleryGrid } from '../components/Gallery.jsx';
import { useAssetBase } from '../lib/theme.jsx';

const ITEMS = [
  { f: 'expo-grand-hall.jpg', alt: 'Grand exhibition hall with hundreds of attendees', caption: 'The Grand Hall — 10,000+ visitors', cat: 'exhibition' },
  { f: 'expo-floor-aerial.jpg', alt: 'Aerial view of the exhibition floor', caption: 'The Floor — 70–80 brands', cat: 'exhibition' },
  { f: 'expo-registration.jpg', alt: 'Registration area with badge queues', caption: 'Welcome — fast-track entry', cat: 'exhibition' },
  { f: 'booth-demo.jpg', alt: 'Live booth demonstration', caption: 'Live demos on the floor', cat: 'exhibition' },
  { f: 'expo-main-stage.jpg', alt: 'Main stage keynote with giant LED screen', caption: 'Main Stage — keynotes', cat: 'conference' },
  { f: 'conference-panel.jpg', alt: 'Conference panel discussion', caption: 'Panels — industry voices', cat: 'conference' },
  { f: 'keynote-stage.jpg', alt: 'Keynote speaker on stage', caption: 'Keynotes — ideas that move markets', cat: 'conference' },
  { f: 'trading-tech.jpg', alt: 'Trading technology showcase', caption: 'Technology showcase', cat: 'conference' },
  { f: 'expo-networking.jpg', alt: 'Professionals networking at the expo lounge', caption: 'The Lounge — where deals start', cat: 'networking' },
  { f: 'expo-vip-lounge.jpg', alt: 'VIP lounge with city views', caption: 'VIP — an experience above it all', cat: 'networking' },
  { f: 'networking-lounge.jpg', alt: 'Networking lounge', caption: 'Connections that compound', cat: 'networking' },
  { f: 'india-mumbai-skyline.jpg', alt: 'Mumbai skyline at dusk', caption: "Host nation — India's trading moment", cat: 'india' },
  { f: 'india-traders.jpg', alt: 'Indian trading professionals in discussion', caption: "India's traders — mobile-first, ambitious", cat: 'india' },
  { f: 'india-skyline.jpg', alt: 'Indian city skyline', caption: 'A market on the move', cat: 'india' },
  { f: 'brand-lockup.jpg', alt: 'Trading Expo official brand identity', caption: 'The Identity — Traders · Brokers · Technology', cat: 'brand' },
  { f: 'brand-booth.jpg', alt: 'Official booth design', caption: 'Booth design — the official look', cat: 'brand' },
  { f: 'brand-signage.jpg', alt: 'Official expo signage', caption: 'Signage — find your way', cat: 'brand' },
  { f: 'brand-rollup.jpg', alt: 'Official rollup banner design', caption: 'Brand in the wild', cat: 'brand' },
];

export default function GalleryPage() {
  const ab = useAssetBase();
  const items = ITEMS.map((it) => ({ ...it, src: ab + 'img/' + it.f }));
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal className="eyebrow">Gallery</Reveal>
          <Reveal as="h1">Inside the <span className="grad">expo.</span></Reveal>
          <Reveal className="section-lead">Concept imagery — the world we're building for 23–24 April 2027. Tap any image to view it full size.</Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <GalleryGrid items={items} />

          <div className="center" style={{ marginTop: '40px' }}>
            <Reveal as="a" href="tickets.html" className="btn btn-primary btn-lg">Be There in Person</Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
