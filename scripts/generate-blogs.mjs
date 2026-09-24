// Generates 50 SEO blog articles + blog index JSON + sitemap entries for Trading Expo India 2027.
// Usage: node scripts/generate-blogs.mjs   (run from repo root)
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { articlesA } from "./blog-data-a.mjs";
import { articlesB } from "./blog-data-b.mjs";
import { articlesC } from "./blog-data-c.mjs";
import { expansions } from "./blog-data-d.mjs";
import { expansionsB } from "./blog-data-e.mjs";
import { expansionsC } from "./blog-data-f.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = join(ROOT, "blog");
mkdirSync(BLOG_DIR, { recursive: true });

const ARTICLES = [...articlesA, ...articlesB, ...articlesC];
const EXP = { ...expansions, ...expansionsB, ...expansionsC };
// Insert each expansion section just before the article's final expo-CTA section.
for (const a of ARTICLES) {
  const ex = EXP[a.slug];
  if (!ex) { console.error("ASSERT FAIL: missing expansion for", a.slug); process.exit(1); }
  a.sections.splice(a.sections.length - 1, 0, ex);
}

// ---------- validation of source data ----------
const fail = (msg) => { console.error("ASSERT FAIL:", msg); process.exit(1); };
if (ARTICLES.length !== 50) fail(`expected 50 articles, got ${ARTICLES.length}`);
const slugs = ARTICLES.map(a => a.slug);
if (new Set(slugs).size !== 50) fail("duplicate slugs");
const titles = ARTICLES.map(a => a.title);
if (new Set(titles).size !== 50) fail("duplicate titles");
const slugSet = new Set(slugs);
for (const a of ARTICLES) {
  for (const r of a.related) {
    if (!slugSet.has(r)) fail(`${a.slug}: related slug not found: ${r}`);
  }
  if (a.faq.length < 3) fail(`${a.slug}: fewer than 3 FAQs`);
  if (a.sections.length < 3) fail(`${a.slug}: fewer than 3 sections`);
}

// ---------- images (cycle through real repo assets) ----------
const IMGS = [
  "expo-floor.jpg","expo-main-stage.jpg","trading-tech.jpg","india-traders.jpg",
  "expo-floor-aerial.jpg","expo-grand-hall.jpg","conference-panel.jpg","keynote-stage.jpg",
  "expo-networking.jpg","networking-lounge.jpg","expo-registration.jpg","expo-vip-lounge.jpg",
  "booth-demo.jpg","brand-booth.jpg","india-mumbai-skyline.jpg","india-skyline.jpg",
  "hero-expo.jpg","brand-rollup.jpg","brand-signage.jpg","brand-badge.jpg"
];
const imgFor = (i) => IMGS[i % IMGS.length];

const stripTags = (s) => s.replace(/<[^>]*>/g, " ");
const wordCount = (s) => stripTags(s).split(/\s+/).filter(Boolean).length;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const bySlug = Object.fromEntries(ARTICLES.map(a => [a.slug, a]));

// ---------- article template ----------
function articleHTML(a, idx) {
  const img = imgFor(idx);
  const bodyWords = wordCount(a.intro.join(" ")) + a.sections.reduce((n, s) => n + wordCount(s.ps.join(" ")), 0);
  if (bodyWords < 500 || bodyWords > 800) fail(`${a.slug}: body word count ${bodyWords} outside 500-800`);
  const readMins = Math.max(3, Math.ceil(bodyWords / 200));

  const sectionsHTML = a.sections.map(s =>
    `<h2>${esc(s.h)}</h2>\n` + s.ps.map(p => `<p>${p}</p>`).join("\n")
  ).join("\n");

  const faqHTML = a.faq.map(f =>
    `<details><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`
  ).join("\n");

  const relatedHTML = a.related.map(r => {
    const ra = bySlug[r];
    return `<li><a href="${r}.html">${esc(ra.title)}</a></li>`;
  }).join("\n");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": a.faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": stripTags(f.a) }
    }))
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": a.title,
    "description": a.meta,
    "datePublished": "2026-09-24",
    "author": { "@type": "Organization", "name": "Trading Expo India" }
  };
  // sanity: JSON-LD must parse
  JSON.parse(JSON.stringify(articleJsonLd));
  JSON.parse(JSON.stringify(faqJsonLd));

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(a.title)} — Trading Expo India 2027</title>
<meta name="description" content="${esc(a.meta)}">
<meta property="og:title" content="${esc(a.title)}">
<meta property="og:description" content="${esc(a.meta)}">
<meta property="og:image" content="../assets/og-image.png">
<meta property="og:type" content="article">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
<link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css?v=20260925a">
<style>
.txi-byline{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin:20px 0 34px;padding:16px 22px;border:1px solid var(--border,#232b34);border-radius:14px;font-size:.9rem;color:var(--muted,#9aa3ad)}
.txi-article{max-width:760px;margin:0 auto}
.txi-article p{line-height:1.85;margin:0 0 1.4em;font-size:1.02rem}
.txi-article h2{font-size:1.5rem;margin:2.2em 0 .8em;line-height:1.35}
.txi-article ul{margin:0 0 1.6em;padding-left:1.3em;line-height:1.85}
.txi-article li{margin-bottom:.5em}
.txi-article blockquote{border-left:3px solid #00C853;padding:.4em 0 .4em 1.2em;margin:2em 0;font-size:1.15rem;font-weight:600;line-height:1.65}
.txi-article figure{margin:2.4em 0}
.txi-article figure img{width:100%;border-radius:16px;display:block}
.txi-article figcaption{font-size:.85rem;color:var(--muted,#9aa3ad);margin-top:10px;text-align:center}
.txi-cta-box{background:linear-gradient(135deg,rgba(0,200,83,.12),rgba(0,168,107,.05));border:1px solid rgba(0,200,83,.3);border-radius:18px;padding:38px 30px;margin:3em 0;text-align:center}
.txi-cta-box h3{margin:0 0 .6em;font-size:1.4rem}
.txi-cta-box p{margin:0 0 1.5em;color:var(--muted,#9aa3ad)}
.txi-back{display:inline-block;margin:0 0 2em;text-decoration:none;font-weight:600;font-size:.95rem}
.txi-faq details{border:1px solid var(--border,#232b34);border-radius:12px;margin-bottom:12px;overflow:hidden}
.txi-faq summary{cursor:pointer;padding:16px 20px;font-weight:700;font-size:1rem;list-style:none}
.txi-faq summary::-webkit-details-marker{display:none}
.txi-faq summary::after{content:"+";float:right;color:#00C853;font-size:1.3rem;line-height:1}
.txi-faq details[open] summary::after{content:"\\2212"}
.txi-faq details p{padding:0 20px 18px;margin:0;color:var(--muted,#9aa3ad);font-size:.96rem}
.txi-related{background:var(--card,#10151b);border:1px solid var(--border,#232b34);border-radius:16px;padding:28px;margin:3em 0}
.txi-related h3{margin:0 0 1em;font-size:1.15rem}
.txi-related ul{margin:0;padding-left:1.2em}
.txi-related a{text-decoration:none;font-weight:600}
.txi-related a:hover{color:#00C853}
</style>
<script type="application/ld+json">
${JSON.stringify(articleJsonLd, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(faqJsonLd, null, 2)}
</script>
</head>
<body data-page="blog">
<div id="siteHeader"></div>
<main>
<section class="page-hero"><div class="container">
<p class="eyebrow">Blog &middot; ${esc(a.category)}</p>
<h1>${esc(a.title)}</h1>
<div class="txi-byline"><span><strong>Trading Expo India editorial team</strong></span><span>&middot;</span><span>September 24, 2026</span><span>&middot;</span><span>${readMins} min read</span></div>
</div></section>
<section class="section"><div class="container"><div class="txi-article">
<p><a class="txi-back" href="../blog.html">&larr; Back to all articles</a></p>
<figure>
<img src="../assets/img/${img}" alt="${esc(a.title)}" loading="lazy">
<figcaption>Trading Expo India 2027 &mdash; 23&ndash;24 April 2027, India.</figcaption>
</figure>
${a.intro.map(p => `<p>${p}</p>`).join("\n")}
${sectionsHTML}
<h2>Frequently asked questions</h2>
<div class="txi-faq">
${faqHTML}
</div>
<div class="txi-related">
<h3>Related articles</h3>
<ul>
${relatedHTML}
</ul>
</div>
<div class="txi-cta-box">
<h3>Meet the market in person.</h3>
<p>Join 10,000+ visitors at Trading Expo India 2027, 23&ndash;24 April 2027. Early-bird passes from &#8377;249.</p>
<p><a class="btn btn-primary btn-lg" href="../tickets.html">Book your ticket</a></p>
</div>
<p><a class="txi-back" href="../blog.html">&larr; Back to all articles</a></p>
</div></div></section>
</main>
<div id="siteFooter"></div>
<button class="to-top" id="toTop" aria-label="Back to top">&#8593;</button>
<script src="../script.js?v=20260925a"></script>
</body>
</html>
`;
}

// ---------- write the 50 articles ----------
let minW = Infinity, maxW = 0;
ARTICLES.forEach((a, i) => {
  const html = articleHTML(a, i);
  writeFileSync(join(BLOG_DIR, `${a.slug}.html`), html);
  const h1 = (html.match(/<h1>/g) || []).length;
  if (h1 !== 1) fail(`${a.slug}: found ${h1} <h1> tags`);
  const wc = wordCount(a.intro.join(" ") + " " + a.sections.map(s => s.ps.join(" ")).join(" "));
  minW = Math.min(minW, wc); maxW = Math.max(maxW, wc);
});
console.log(`Wrote 50 articles. Body word-count range: ${minW}-${maxW}`);

// ---------- verify internal links resolve ----------
const sitePages = ["index.html","tickets.html","exhibit.html","agenda.html","venue.html","gallery.html","sponsors.html","faq.html","contact.html","portal.html","blog.html"];
for (const a of ARTICLES) {
  const html = readFileSync(join(BLOG_DIR, `${a.slug}.html`), "utf8");
  const hrefs = [...html.matchAll(/href="([^"#]+)"/g)].map(m => m[1]);
  for (const h of hrefs) {
    if (h.endsWith(".html") && !h.startsWith("http")) {
      if (h.startsWith("../")) {
        const target = h.slice(3);
        if (!sitePages.includes(target) && !existsSync(join(ROOT, target)))
          fail(`${a.slug}: broken site link ${h}`);
      } else {
        if (!existsSync(join(BLOG_DIR, h))) fail(`${a.slug}: broken blog link ${h}`);
      }
    }
  }
  // spot-check JSON-LD parses
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (ldBlocks.length !== 2) fail(`${a.slug}: expected 2 JSON-LD blocks, got ${ldBlocks.length}`);
  for (const b of ldBlocks) JSON.parse(b[1]);
}
console.log("All internal links resolve; JSON-LD valid in all 50 files.");

// ---------- blog index JSON (50 new + 5 existing) ----------
const existing = [
  { slug: "why-india-is-the-future-of-online-trading", title: "Why India is the future of online trading", category: "India focus", img: "india-skyline.jpg", read: "6 min read", date: "Sep 25, 2026", excerpt: "A mobile-first generation, world-class digital payments and a surging retail investing culture — why the next chapter of online trading is being written in India." },
  { slug: "what-to-expect-at-trading-expo-india-2027", title: "What to expect at Trading Expo India 2027", category: "Event guide", img: "expo-floor.jpg", read: "7 min read", date: "Sep 25, 2026", excerpt: "Two days, 70–80 exhibitors, 80+ speakers, live demos and a lucky draw — a walkthrough of everything waiting for you on 23–24 April 2027." },
  { slug: "exhibitor-guide-trading-expo-india-2027", title: "The exhibitor's guide to Trading Expo India 2027", category: "For exhibitors", img: "booth-demo.jpg", read: "7 min read", date: "Sep 25, 2026", excerpt: "How to get the most out of your booth: preparation checklists, staffing tips, lead capture and making 10,000+ visitors remember your brand." },
  { slug: "top-reasons-to-attend-trading-expo-india-2027", title: "Top reasons to attend Trading Expo India 2027", category: "Visitors", img: "networking-lounge.jpg", read: "6 min read", date: "Sep 25, 2026", excerpt: "From hands-on trading technology to early-bird passes starting at ₹249 — eight reasons April 2027 belongs in your calendar." },
  { slug: "india-trading-community-by-the-numbers", title: "India's trading community, by the numbers", category: "By the numbers", img: "trading-tech.jpg", read: "5 min read", date: "Sep 25, 2026", excerpt: "The figures behind the event — 10,000+ visitors, 70–80 exhibitors, 80+ speakers — and the community trends making them possible." }
];
const index = [
  ...existing.map(e => ({ ...e, file: `blog/${e.slug}.html` })),
  ...ARTICLES.map((a, i) => {
    const wc = wordCount(a.intro.join(" ") + " " + a.sections.map(s => s.ps.join(" ")).join(" "));
    return {
      slug: a.slug, file: `blog/${a.slug}.html`, title: a.title,
      category: a.category, img: imgFor(i),
      read: `${Math.max(3, Math.ceil(wc / 200))} min read`,
      date: "Sep 24, 2026", excerpt: a.excerpt
    };
  })
];
writeFileSync(join(ROOT, "assets", "blog-index.json"), JSON.stringify(index, null, 2));
console.log(`Wrote assets/blog-index.json with ${index.length} entries.`);

// ---------- sitemap ----------
const SM = join(ROOT, "sitemap.xml");
let sm = readFileSync(SM, "utf8");
let added = 0;
for (const a of ARTICLES) {
  const url = `https://dawoodshah2232-svg.github.io/tradingexpo-india/blog/${a.slug}.html`;
  if (!sm.includes(url)) {
    sm = sm.replace("</urlset>", `  <url><loc>${url}</loc><lastmod>2026-09-24</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>`);
    added++;
  }
}
writeFileSync(SM, sm);
console.log(`Sitemap: added ${added} new URLs.`);
console.log("DONE");
