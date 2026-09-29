// Generates frontend/*.html entry shells from the current static pages.
// Preserves each page's <head> (SEO meta, OG tags, JSON-LD, fonts) verbatim,
// drops the old stylesheet <link>s (Vite injects bundled CSS via JS imports),
// and wires the body to the React entry module.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');      // repo root (old static site)
const FRONT = join(__dirname, '..');           // frontend/

const PAGES = [
  ['index.html', 'home'],
  ['tickets.html', 'tickets'],
  ['exhibit.html', 'exhibit'],
  ['agenda.html', 'agenda'],
  ['venue.html', 'venue'],
  ['gallery.html', 'gallery'],
  ['sponsors.html', 'sponsors'],
  ['awards.html', 'awards'],
  ['blog.html', 'blog'],
  ['faq.html', 'faq'],
  ['contact.html', 'contact'],
  ['portal.html', 'portal'],
];

const THEME_INIT = `<script>try{var t=localStorage.getItem("txi-theme");document.documentElement.setAttribute("data-theme",t==="light"||t==="dark"?t:"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}</script>`;

for (const [file, entry] of PAGES) {
  const src = readFileSync(join(ROOT, file), 'utf8');

  const headMatch = src.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) throw new Error(`no head in ${file}`);
  let head = headMatch[1]
    // drop old stylesheet links — Vite injects the bundled CSS
    .replace(/<link[^>]*rel="stylesheet"[^>]*href="[^"]*(styles\.css|portal\.css)[^"]*"[^>]*>\s*/gi, '')
    .replace(/<link[^>]*href="[^"]*(styles\.css|portal\.css)[^"]*"[^>]*rel="stylesheet"[^>]*>\s*/gi, '')
    // drop Google Fonts (Apple system font stack is used instead)
    .replace(/<link[^>]*fonts\.googleapis\.com[^>]*>\s*/gi, '')
    .replace(/<link[^>]*fonts\.gstatic\.com[^>]*>\s*/gi, '');

  const bodyAttrs = (src.match(/<body([^>]*)>/i) || [])[1] || '';

  const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
${THEME_INIT}
${head.trim()}
</head>
<body${bodyAttrs}>
<div id="root"></div>
<script type="module" src="/src/entries/${entry}.jsx"></script>
</body>
</html>
`;
  writeFileSync(join(FRONT, file), html);
  console.log('wrote', file, '-> entry', entry);
}
