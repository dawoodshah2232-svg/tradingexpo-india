#!/usr/bin/env python3
"""SEO patch for root blog/*.html — idempotent.
- canonical link (per article)
- BreadcrumbList JSON-LD
- author bio block (.txi-author) + CSS
- hero img: .jpg -> .webp + width/height (kills layout shift)
- strip Google Fonts links; force Apple font stack via :root override
- trim meta descriptions >160 chars (og:description mirrors meta)
"""
import re, os, json, glob, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://dawoodshah2232-svg.github.io/tradingexpo-india"
DIMS = json.load(open(os.path.join(ROOT, "scripts", "blog-img-dims.json")))

TRIMMED = {
    "comparing-brokers-at-a-trading-expo": "Meet brokers face-to-face at a trading expo and know what to compare: SEBI registration, fees, platforms, support \u2014 and the red flags to walk away from.",
    "fiu-ind-crackdown-offshore-crypto-india": "FIU-IND issued non-compliance notices to 15 offshore crypto platforms on 9 September 2026 and ordered app takedowns. What traders must know to stay compliant.",
    "fpi-flows-india-september-2026": "Foreign investors pulled \u20b925,682 crore from Indian exchanges in September 2026 while putting \u20b98,551 crore into IPOs. What the flow split means for traders.",
    "india-demat-boom-2026": "India\u2019s demat accounts hit 237.7 million in August 2026 \u2014 the fastest additions in seven months. What\u2019s driving the boom and what new investors should know.",
    "nse-ipo-listing-2026": "NSE listed on the BSE on 24 September 2026 at \u20b91,800, valuing the exchange at \u20b94.5 lakh crore. What the listing and self-listing debate tell Indian traders.",
    "opening-brokerage-account-at-expo": "Expo-only brokerage offers can be genuinely good \u2014 or expensive traps. How to evaluate sign-up deals, what documents to carry, and the KYC checklist.",
    "post-expo-follow-up-guide": "The expo ends but the value starts now: a follow-up system for organising notes, testing ideas safely, following up with contacts, and reviewing event ROI.",
    "sebi-fo-study-2026-retail-losses": "SEBI\u2019s August 2026 study: 87.7% of individual F&O traders lost money in FY26, losing \u20b991,685 crore in aggregate. What the numbers say and how traders respond.",
}

FONT_OVERRIDE = (":root{--font-body:-apple-system,BlinkMacSystemFont,\"SF Pro Text\","
                  "\"Segoe UI\",\"Helvetica Neue\",Helvetica,Arial,sans-serif;"
                  "--font-display:-apple-system,BlinkMacSystemFont,\"SF Pro Display\","
                  "\"Segoe UI\",\"Helvetica Neue\",Helvetica,Arial,sans-serif}")
AUTHOR_CSS = (".txi-author{background:var(--card,#10151b);border:1px solid var(--border,#232b34);"
              "border-radius:16px;padding:26px 28px;margin:3em 0}"
              ".txi-author h3{margin:0 0 .6em;font-size:1.1rem}"
              ".txi-author p{margin:0;color:var(--muted,#9aa3ad);font-size:.95rem;line-height:1.8}"
              ".txi-author a{font-weight:600}")
AUTHOR_HTML = """<div class="txi-author">
<h3>About the author</h3>
<p>Written by the <strong>Trading Expo India editorial team</strong> &mdash; market researchers and event producers behind India&rsquo;s premier trading &amp; fintech exhibition, 23&ndash;24 April 2027. We publish practical, hype-free guides for Indian traders. <a href="../contact.html">Contact us</a>.</p>
</div>"""

def breadcrumb_ld(title, slug):
    data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home",
             "item": BASE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Blog",
             "item": BASE + "/blog.html"},
            {"@type": "ListItem", "position": 3, "name": title,
             "item": f"{BASE}/blog/{slug}.html"},
        ],
    }
    return '<script type="application/ld+json">\n' + json.dumps(data, indent=2) + '\n</script>'

changed = 0
for path in sorted(glob.glob(os.path.join(ROOT, "blog", "*.html"))):
    slug = os.path.basename(path)[:-5]
    s = open(path, encoding="utf-8").read()
    orig = s

    # 1. canonical
    if 'rel="canonical"' not in s:
        canon = (f'<link rel="canonical" href="{BASE}/blog/{slug}.html">\n')
        s = s.replace('<link rel="apple-touch-icon"',
                      canon + '<link rel="apple-touch-icon"', 1)

    # 2. breadcrumb JSON-LD
    if "BreadcrumbList" not in s:
        m = re.search(r"<title>(.*?)</title>", s, re.S)
        title = html.unescape(m.group(1)).replace(" \u2014 Trading Expo India 2027", "").strip()
        s = s.replace("</head>", breadcrumb_ld(title, slug) + "\n</head>", 1)

    # 3. author bio
    if "txi-author" not in s:
        s = s.replace('<div class="txi-related">', AUTHOR_HTML + "\n<div class=\"txi-related\">", 1)
        s = s.replace("</style>", AUTHOR_CSS + "\n</style>", 1)

    # 4. hero img -> webp + dims (first img inside .txi-article)
    def fix_img(m):
        tag = m.group(0)
        mm = re.search(r'src="\.\./assets/img/([^"]+)\.jpg"', tag)
        if not mm:
            return tag
        name = mm.group(1) + ".jpg"
        dims = DIMS.get(name)
        tag = tag.replace(f'../assets/img/{name}', f'../assets/img/{mm.group(1)}.webp')
        if dims and 'width=' not in tag:
            tag = tag.replace("<img ", f'<img width="{dims[0]}" height="{dims[1]}" ', 1)
        return tag
    s = re.sub(r'<img[^>]*>', fix_img, s, count=1)

    # 5. strip Google Fonts, force Apple stack
    s = re.sub(r'<link[^>]*fonts\.googleapis\.com[^>]*>\s*', '', s)
    s = re.sub(r'<link[^>]*fonts\.gstatic\.com[^>]*>\s*', '', s)
    if "--font-body:-apple-system" not in s:
        s = s.replace("<style>", "<style>\n" + FONT_OVERRIDE, 1)

    # 6. trim long descriptions
    if slug in TRIMMED:
        new = TRIMMED[slug]
        s = re.sub(r'(<meta name="description" content=")[^"]*(">)', r"\g<1>" + new + r"\g<2>", s, count=1)
        s = re.sub(r'(<meta property="og:description" content=")[^"]*(">)', r"\g<1>" + new + r"\g<2>", s, count=1)

    # sanity: exactly one h1
    assert len(re.findall(r"<h1[\s>]", s)) == 1, f"{slug}: h1 count broken"

    if s != orig:
        open(path, "w", encoding="utf-8").write(s)
        changed += 1
        print("patched", slug)

print("files changed:", changed)
