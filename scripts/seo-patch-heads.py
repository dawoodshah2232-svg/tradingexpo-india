#!/usr/bin/env python3
"""SEO patch for root *.html heads — idempotent.
- canonical on awards.html (was missing)
- trim meta descriptions >160 chars (awards, sponsors, portal)
- BreadcrumbList JSON-LD on every root page
- FAQPage JSON-LD on sponsors.html + venue.html (from React data files)
"""
import re, os, json, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://dawoodshah2232-svg.github.io/tradingexpo-india"

PAGES = ["index.html", "tickets.html", "exhibit.html", "agenda.html", "venue.html",
         "gallery.html", "sponsors.html", "awards.html", "blog.html", "faq.html",
         "contact.html", "portal.html", "privacy.html", "terms.html"]

TRIMMED = {
    "awards.html": "The Trading Expo India Awards 2027 celebrate India\u2019s best brokers, platforms and fintech innovators. Gala night 23 April 2027 \u2014 nominations opening soon.",
    "sponsors.html": "Sponsor Trading Expo India 2027 (23\u201324 April 2027, India): Title, Platinum, Gold, Silver, Bronze tiers plus spotlight branding. 10,000+ visitors.",
    "portal.html": "Log in to the Trading Expo India 2027 portal \u2014 dashboards for ticket holders, exhibitors and admins. Manage tickets, booths and announcements in one place.",
}


def breadcrumb_ld(name, page):
    data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/"},
        ] + ([] if page == "index.html" else [
            {"@type": "ListItem", "position": 2, "name": name,
             "item": f"{BASE}/{page}"},
        ]),
    }
    return '<script type="application/ld+json">\n' + json.dumps(data, indent=2) + '\n</script>'


def faq_ld_from_data(data_path):
    """Parse the exported faqItems array from a React data file into FAQPage JSON-LD."""
    s = open(os.path.join(ROOT, data_path), encoding="utf-8").read()
    pairs = re.findall(r'"q":\s*"((?:[^"\\]|\\.)*)"\s*,\s*"a":\s*"((?:[^"\\]|\\.)*)"', s)
    items = []
    def unesc(t):
        t = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), t)
        return t.replace("\\n", "\n").replace('\\"', '"').replace("\\\\", "\\")
    for q, a in pairs:
        q, a = unesc(q), unesc(a)
        items.append({"@type": "Question", "name": q,
                      "acceptedAnswer": {"@type": "Answer", "text": a}})
    data = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": items}
    return '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n</script>'


changed = 0
for page in PAGES:
    path = os.path.join(ROOT, page)
    if not os.path.exists(path):
        print("skip (missing):", page)
        continue
    s = open(path, encoding="utf-8").read()
    orig = s
    head_end = s.find("</head>")

    # 1. canonical
    if 'rel="canonical"' not in s[:head_end]:
        s = s.replace("</head>",
                      f'<link rel="canonical" href="{BASE}/{page if page != "index.html" else ""}">\n</head>', 1)
        head_end = s.find("</head>")

    # 2. trim long descriptions (+ og:description mirror if identical)
    if page in TRIMMED:
        new = TRIMMED[page]
        s = re.sub(r'(<meta name="description" content=")[^"]*(">)',
                   r"\g<1>" + new + r"\g<2>", s, count=1)

    # 3. breadcrumb JSON-LD
    if "BreadcrumbList" not in s[:head_end]:
        m = re.search(r"<title>(.*?)</title>", s, re.S)
        name = html.unescape(m.group(1)).split("\u2014")[0].split("|")[0].strip()
        s = s.replace("</head>", breadcrumb_ld(name, page) + "\n</head>", 1)

    # 4. FAQPage JSON-LD for sponsors + venue
    if page in ("sponsors.html", "venue.html") and '"@type": "FAQPage"' not in s[:s.find("</head>")]:
        data_file = ("frontend/src/data/sponsors-faq.js" if page == "sponsors.html"
                     else "frontend/src/data/venue-faq.js")
        s = s.replace("</head>", faq_ld_from_data(data_file) + "\n</head>", 1)

    if s != orig:
        open(path, "w", encoding="utf-8").write(s)
        changed += 1
        print("patched", page)

print("files changed:", changed)
