// Generates public/sitemap.xml from the static pages + blog index.
// Run manually or via `npm run gen:sitemap` (hooked as `prebuild`).
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONT = join(__dirname, '..');
const BASE = 'https://dawoodshah2232-svg.github.io/tradingexpo-india';

const PAGES = [
  ['', 1.0], ['tickets.html', 0.9], ['exhibit.html', 0.9], ['agenda.html', 0.8],
  ['venue.html', 0.8], ['gallery.html', 0.7], ['sponsors.html', 0.8],
  ['awards.html', 0.7], ['blog.html', 0.9], ['faq.html', 0.7],
  ['contact.html', 0.8], ['privacy.html', 0.5], ['terms.html', 0.5],
  ['portal.html', 0.4],
];

const today = new Date().toISOString().slice(0, 10);
const urls = [];

for (const [path, pri] of PAGES) {
  urls.push(`  <url>\n    <loc>${BASE}/${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${pri}</priority>\n  </url>`);
}

const idxPath = join(FRONT, 'public', 'assets', 'blog-index.json');
if (existsSync(idxPath)) {
  const posts = JSON.parse(readFileSync(idxPath, 'utf8'));
  const seen = new Set();
  for (const p of posts) {
    if (!p.slug || seen.has(p.slug)) continue;
    seen.add(p.slug);
    urls.push(`  <url>\n    <loc>${BASE}/blog/${p.slug}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
writeFileSync(join(FRONT, 'public', 'sitemap.xml'), xml);
console.log(`sitemap.xml written: ${urls.length} URLs`);
