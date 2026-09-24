/* Trading Expo India 2027 — site logic (multi-page) */
(function () {
  "use strict";

  /* ---------- Shared chrome: header + footer ---------- */
  var NAV_LINKS = [
    ["index.html", "home", "Home"],
    ["tickets.html", "tickets", "Tickets"],
    ["exhibit.html", "exhibit", "Exhibit"],
    ["agenda.html", "agenda", "Agenda"],
    ["venue.html", "venue", "Venue"],
    ["gallery.html", "gallery", "Gallery"],
    ["sponsors.html", "sponsors", "Sponsors"],
    ["awards.html", "awards", "Awards"],
    ["blog.html", "blog", "Blog"],
    ["faq.html", "faq", "FAQ"],
    ["contact.html", "contact", "Contact"]
  ];
  var page = (document.body && document.body.getAttribute("data-page")) || "home";

  function renderChrome() {
    var headerMount = document.getElementById("siteHeader");
    if (headerMount) {
      var links = NAV_LINKS.map(function (l) {
        return '<a href="' + l[0] + '"' + (l[1] === page ? ' class="active" aria-current="page"' : "") + ">" + l[2] + "</a>";
      }).join("");
      headerMount.innerHTML =
        '<header class="nav" id="nav"><div class="nav-inner">' +
        '<a class="logo" href="index.html" aria-label="Trading Expo India — home">' +
        '<img class="nav-logo theme-logo" src="assets/logo-dark-compact.png" data-logo-dark="assets/logo-dark-compact.png" data-logo-light="assets/logo-light-compact.png" alt="Trading Expo India"></a>' +
        '<nav class="nav-links" id="navLinks" aria-label="Primary">' + links + "</nav>" +
        '<div class="nav-actions">' +
        '<a href="portal.html" class="nav-portal">Portal</a>' +
        '<a href="tickets.html" class="btn btn-primary btn-sm nav-cta">Book Tickets</a>' +
        '<button class="theme-toggle" id="themeToggle" aria-label="Toggle light mode">' +
        '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
        '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
        "</button>" +
        '<button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
        "</div></div></header>";
    }
    var footerMount = document.getElementById("siteFooter");
    if (footerMount) {
      footerMount.innerHTML =
        '<footer class="footer"><div class="container"><div class="footer-grid">' +
        '<div class="footer-brand">' +
        '<a class="logo" href="index.html" aria-label="Trading Expo India — home">' +
        '<img class="footer-logo theme-logo" src="assets/logo-dark.png" data-logo-dark="assets/logo-dark.png" data-logo-light="assets/logo-light.png" alt="Trading Expo India"></a>' +
        "<p>India's premier online trading, fintech &amp; financial markets exhibition.<br>23–24 April 2027.</p></div>" +
        '<nav class="footer-col" aria-label="Event"><h4>Event</h4>' +
        '<a href="index.html">Home</a><a href="agenda.html">Agenda</a><a href="venue.html">Venue</a><a href="gallery.html">Gallery</a><a href="awards.html">Awards</a><a href="tickets.html">Tickets</a><a href="faq.html">FAQ</a><a href="blog.html">Blog</a></nav>' +
        '<nav class="footer-col" aria-label="Participate"><h4>Participate</h4>' +
        '<a href="exhibit.html">Exhibit</a><a href="sponsors.html">Sponsor</a><a href="contact.html">Speak</a><a href="sponsors.html">Partners</a><a href="portal.html">Exhibitor Portal</a></nav>' +
        '<div class="footer-col"><h4>Event Info</h4>' +
        '<p class="footer-meta">23–24 April 2027 · India<br>TradingExpo.com<br>Organizer: ProFX Media FZ-LLC</p>' +
        '<button class="theme-toggle theme-toggle-footer" id="themeToggleFooter" aria-label="Toggle light mode">' +
        '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
        '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
        '<span id="themeLabel">Light mode</span></button>' +
        "</div></div>" +
        '<div class="footer-bottom"><span>© 2027 Trading Expo India. All rights reserved.</span><span>Organizer: ProFX Media FZ-LLC</span></div>' +
        "</div></footer>";
    }
  }
  renderChrome();

  /* ---------- Theme: official Trading Expo dark/light logos ---------- */
  var root = document.documentElement;
  function applyLogos() {
    var dark = root.getAttribute("data-theme") !== "light";
    var imgs = document.querySelectorAll("img[data-logo-dark]");
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].src = dark ? imgs[i].getAttribute("data-logo-dark") : imgs[i].getAttribute("data-logo-light");
    }
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("txi-theme", t); } catch (e) {}
    var label = document.getElementById("themeLabel");
    if (label) label.textContent = t === "dark" ? "Light mode" : "Dark mode";
    applyLogos();
  }
  var saved = null;
  try { saved = localStorage.getItem("txi-theme"); } catch (e) {}
  applyTheme(saved === "light" || saved === "dark" ? saved : "dark");
  ["themeToggle", "themeToggleFooter"].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  });

  /* ---------- Preloader (home page only) ---------- */
  (function () {
    var pre = document.getElementById("preloader");
    if (!pre) { document.body.classList.add("loaded"); return; }
    var num = document.getElementById("preNum");
    var bar = document.getElementById("preBar");
    var finished = false;
    function set(p) {
      p = Math.max(0, Math.min(100, Math.round(p)));
      if (num) num.textContent = (p < 10 ? "0" : "") + p;
      if (bar) bar.style.width = p + "%";
    }
    function finish() {
      if (finished) return;
      finished = true;
      set(100);
      document.body.classList.add("loaded");
      document.body.classList.remove("pre-loading");
      setTimeout(function () {
        pre.classList.add("done");
        pre.setAttribute("aria-hidden", "true");
        setTimeout(function () {
          if (pre.parentNode) pre.parentNode.removeChild(pre);
        }, 950);
      }, 300);
    }
    var imgs = document.images ? Array.prototype.slice.call(document.images) : [];
    var total = imgs.length, loaded = 0;
    function tick() {
      loaded++;
      set(10 + (loaded / Math.max(total, 1)) * 80);
      if (loaded >= total) finish();
    }
    imgs.forEach(function (im) {
      if (im.complete) { tick(); }
      else {
        im.addEventListener("load", tick);
        im.addEventListener("error", tick);
      }
    });
    if (total === 0) finish();
    var creep = 10;
    var iv = setInterval(function () {
      if (finished) { clearInterval(iv); return; }
      creep = Math.min(creep + 5, 90);
      var cur = num ? parseInt(num.textContent, 10) || 0 : 0;
      if (creep > cur) set(creep);
    }, 240);
    setTimeout(finish, 6000); /* safety: never trap the visitor */
  })();

  /* ---------- Nav ---------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 12); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      var open = navLinks.classList.toggle("mobile-open");
      menuBtn.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("mobile-open");
        menuBtn.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Countdown to 23 Apr 2027, 09:00 IST ---------- */
  (function () {
    var dEl = document.getElementById("cdDays");
    if (!dEl) return;
    var hEl = document.getElementById("cdHours"),
        mEl = document.getElementById("cdMins"),
        sEl = document.getElementById("cdSecs");
    var target = new Date("2027-04-23T09:00:00+05:30").getTime();
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = "00";
        return;
      }
      dEl.textContent = Math.floor(diff / 864e5);
      hEl.textContent = pad(Math.floor(diff / 36e5) % 24);
      mEl.textContent = pad(Math.floor(diff / 6e4) % 60);
      sEl.textContent = pad(Math.floor(diff / 1e3) % 60);
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ---------- Animated counters ---------- */
  function fmt(n) { return n.toLocaleString("en-IN"); }
  function animateCount(el) {
    var end = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600, start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(end * eased)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Reveal on scroll (with stagger) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var groups = {};
  revealEls.forEach(function (el) {
    var parent = el.parentElement;
    var key = parent ? parent.className : "root";
    groups[key] = groups[key] || [];
    groups[key].push(el);
  });
  Object.keys(groups).forEach(function (key) {
    groups[key].forEach(function (el, i) {
      el.style.setProperty("--rd", Math.min(i, 5) * 0.08 + "s");
    });
  });
  var counted = new WeakSet();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        en.target.querySelectorAll("[data-count]").forEach(function (c) {
          if (!counted.has(c)) { counted.add(c); animateCount(c); }
        });
        if (en.target.hasAttribute("data-count") && !counted.has(en.target)) {
          counted.add(en.target); animateCount(en.target);
        }
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- FAQ: one open at a time ---------- */
  var faqs = document.querySelectorAll(".faq-item");
  faqs.forEach(function (item) {
    var sum = item.querySelector("summary");
    if (sum) sum.addEventListener("click", function () {
      faqs.forEach(function (other) {
        if (other !== item && other.open) other.open = false;
      });
    });
  });

  /* ---------- Anchor offset for fixed nav ---------- */
  document.querySelectorAll("section[id], footer[id]").forEach(function (s) {
    s.style.scrollMarginTop = "76px";
  });

  /* ---------- Booking flows (tickets + exhibit) ---------- */
  function money(n) { return "₹" + n.toLocaleString("en-IN"); }
  function makeRef(prefix) {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
    for (var i = 0; i < 6; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + "-" + s;
  }
  function makePass() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
    for (var i = 0; i < 6; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return s;
  }
  function initBooking(rootId) {
    var rootEl = document.getElementById(rootId);
    if (!rootEl) return;
    var steps = Array.prototype.slice.call(rootEl.querySelectorAll(".bstep"));
    var indicators = Array.prototype.slice.call(rootEl.querySelectorAll(".bsteps li"));
    var prefix = rootEl.getAttribute("data-ref-prefix") || "TXI27";
    var storeKey = rootEl.getAttribute("data-store-key") || "txi_bookings";
    var state = { option: null, qty: 1 };
    function show(n) {
      steps.forEach(function (s) { s.classList.toggle("active", s.getAttribute("data-step") === String(n)); });
      indicators.forEach(function (li) {
        var sn = parseInt(li.getAttribute("data-s"), 10);
        li.classList.toggle("active", sn === n);
        li.classList.toggle("done", sn < n);
      });
      var first = rootEl.querySelector('.bstep[data-step="' + n + '"]');
      if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function selectedCard() {
      return rootEl.querySelector(".pick-card.selected");
    }
    function refreshTotal() {
      var card = selectedCard();
      var tEl = rootEl.querySelector("[data-total]");
      var qEl = rootEl.querySelector("[data-qty]");
      if (qEl) qEl.textContent = state.qty;
      if (!tEl) return;
      if (!card) { tEl.textContent = "—"; return; }
      var price = parseInt(card.getAttribute("data-price"), 10) || 0;
      tEl.textContent = price > 0 ? money(price * state.qty) : "On request";
    }
    rootEl.querySelectorAll(".pick-card").forEach(function (card) {
      card.addEventListener("click", function () {
        rootEl.querySelectorAll(".pick-card").forEach(function (c) { c.classList.remove("selected"); });
        card.classList.add("selected");
        state.option = {
          name: card.getAttribute("data-name"),
          price: parseInt(card.getAttribute("data-price"), 10) || 0,
          note: card.getAttribute("data-note") || ""
        };
        refreshTotal();
      });
    });
    rootEl.querySelectorAll("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.qty = Math.min(10, Math.max(1, state.qty + parseInt(b.getAttribute("data-q"), 10)));
        refreshTotal();
      });
    });
    rootEl.querySelectorAll("[data-back]").forEach(function (b) {
      b.addEventListener("click", function () {
        show(parseInt(b.getAttribute("data-back"), 10));
      });
    });
    rootEl.querySelectorAll("[data-next]").forEach(function (b) {
      b.addEventListener("click", function () {
        var to = parseInt(b.getAttribute("data-next"), 10);
        var cur = to - 1;
        if (cur === 1 && !selectedCard()) {
          var grid = rootEl.querySelector(".pick-grid");
          if (grid) grid.classList.add("shake");
          setTimeout(function () { if (grid) grid.classList.remove("shake"); }, 500);
          return;
        }
        if (cur === 2) {
          var ok = true, firstBad = null;
          var stepEl = rootEl.querySelector('.bstep[data-step="2"]');
          stepEl.querySelectorAll("[required]").forEach(function (inp) {
            var bad = !inp.value || !inp.value.trim() ||
              (inp.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value));
            inp.classList.toggle("invalid", bad);
            if (bad) { ok = false; firstBad = firstBad || inp; }
          });
          if (!ok) { if (firstBad) firstBad.focus(); return; }
          if (to === 3) confirmBooking();
        }
        show(to);
      });
    });
    function confirmBooking() {
      var ref = makeRef(prefix);
      var card = selectedCard();
      var fields = {};
      rootEl.querySelectorAll('.bstep[data-step="2"] [name]').forEach(function (inp) {
        fields[inp.getAttribute("name")] = inp.value;
      });
      var rec = {
        ref: ref, password: makePass(),
        option: state.option, qty: state.qty,
        fields: fields, at: new Date().toISOString()
      };
      try {
        var all = JSON.parse(localStorage.getItem(storeKey) || "[]");
        all.push(rec);
        localStorage.setItem(storeKey, JSON.stringify(all));
      } catch (e) {}
      var refEl = rootEl.querySelector("[data-ref]");
      if (refEl) refEl.textContent = ref;
      rootEl.querySelectorAll("[data-pass]").forEach(function (el) { el.textContent = rec.password; });
      rootEl.querySelectorAll("[data-ref2]").forEach(function (el) { el.textContent = ref; });
      var emailEl = rootEl.querySelector("[data-email]");
      if (emailEl) emailEl.textContent = fields.email || "your email";
      var sumEl = rootEl.querySelector("[data-summary]");
      if (sumEl) {
        var price = state.option ? state.option.price : 0;
        var total = price > 0 ? money(price * state.qty) : "On request";
        var rows = "";
        if (state.option) rows += "<div><span>Selection</span><strong>" + state.option.name + "</strong></div>";
        if (state.qty > 1) rows += "<div><span>Quantity</span><strong>" + state.qty + "</strong></div>";
        rows += "<div><span>Total</span><strong>" + total + "</strong></div>";
        Object.keys(fields).forEach(function (k) {
          if (fields[k]) rows += "<div><span>" + k.charAt(0).toUpperCase() + k.slice(1) + "</span><strong>" + fields[k].replace(/</g, "&lt;") + "</strong></div>";
        });
        sumEl.innerHTML = rows;
      }
    }
    refreshTotal();
  }
  initBooking("ticketBooking");
  initBooking("exhibitBooking");
})();

/* Gallery drag-scroll (home), filters (gallery page), lightbox, agenda tabs, floorplan zoom */
(function () {
  /* --- home horizontal gallery --- */
  var track = document.getElementById("galleryTrack");
  if (track) {
    var prev = document.getElementById("gPrev"), next = document.getElementById("gNext");
    function scrollByCards(dir) {
      var card = track.querySelector(".g-card");
      var w = card ? card.offsetWidth + 18 : 320;
      track.scrollBy({ left: dir * w * 2, behavior: "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { scrollByCards(-1); });
    if (next) next.addEventListener("click", function () { scrollByCards(1); });
    var down = false, sx = 0, sl = 0;
    track.addEventListener("pointerdown", function (e) { down = true; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener("pointermove", function (e) { if (down) track.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener("pointerup", function () { down = false; });
  }

  /* --- gallery page filters --- */
  var filters = document.querySelectorAll(".g-filters button");
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var f = btn.getAttribute("data-filter");
        document.querySelectorAll("#galleryPage .g-item").forEach(function (item) {
          item.classList.toggle("hide", f !== "all" && item.getAttribute("data-cat") !== f);
        });
      });
    });
  }

  /* --- lightbox --- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = document.getElementById("lbImg"), lbCap = document.getElementById("lbCap");
    var figs = Array.prototype.slice.call(document.querySelectorAll("#galleryTrack .g-card, #galleryPage .g-item"));
    var fp = document.getElementById("floorplanImg");
    if (fp) {
      var wrap = document.createElement("figure");
      wrap.style.display = "none";
      wrap.appendChild(fp.cloneNode(false));
      var cap = document.createElement("figcaption");
      cap.textContent = "Concept floor plan";
      wrap.appendChild(cap);
      figs.push(wrap);
      fp.addEventListener("click", function () { show(figs.length - 1); });
    }
    var i = 0;
    function show(n) {
      if (!figs.length) return;
      i = (n + figs.length) % figs.length;
      var img = figs[i].querySelector("img");
      var c = figs[i].querySelector("figcaption");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = c ? c.textContent : img.alt;
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function close() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    figs.forEach(function (f, n) {
      if (f.style.display === "none") return;
      f.addEventListener("click", function () { show(n); });
    });
    document.getElementById("lbClose").addEventListener("click", close);
    document.getElementById("lbPrev").addEventListener("click", function (e) { e.stopPropagation(); show(i - 1); });
    document.getElementById("lbNext").addEventListener("click", function (e) { e.stopPropagation(); show(i + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
  }

  /* --- agenda day tabs --- */
  var tabs = document.querySelectorAll(".agenda-tabs .tab");
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var day = tab.getAttribute("data-day");
        document.querySelectorAll(".agenda-day").forEach(function (d) {
          d.classList.toggle("active", d.getAttribute("data-day") === day);
        });
      });
    });
  }
})();

/* Enquiry form -> composes an email to the Trading Expo team */
(function () {
  const f = document.getElementById('enquiryForm');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(f);
    const subject = encodeURIComponent('Trading Expo India 2027 enquiry — ' + d.get('interest'));
    const body = encodeURIComponent(
      'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') +
      '\nInterested in: ' + d.get('interest') +
      '\n\nMessage:\n' + (d.get('message') || '—')
    );
    window.location.href = 'mailto:info@tradingexpo.com?subject=' + subject + '&body=' + body;
  });
})();

/* Back to top */
(function () {
  const b = document.getElementById('toTop');
  if (!b) return;
  window.addEventListener('scroll', () => b.classList.toggle('show', window.scrollY > 900), { passive: true });
  b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
/* v4: market ticker (illustrative sample data), scroll progress, hero parallax */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Sample market snapshot ticker (illustrative data, not live) ----- */
  var MKT = [
    ["EUR/USD", "1.0924", "+0.12%", "up"], ["GBP/USD", "1.2741", "-0.08%", "dn"],
    ["USD/JPY", "151.32", "+0.21%", "up"], ["USD/INR", "86.45", "-0.05%", "dn"],
    ["BTC/USD", "97,450", "+1.84%", "up"], ["ETH/USD", "3,620", "+2.15%", "up"],
    ["XAU/USD", "2,912.40", "+0.34%", "up"], ["Nifty 50", "26,180.55", "+0.42%", "up"]
  ];
  var tracks = document.querySelectorAll("[data-mkt]");
  tracks.forEach(function (track) {
    var html = "";
    for (var r = 0; r < 2; r++) { /* duplicated for a seamless CSS loop */
      MKT.forEach(function (m) {
        var arrow = m[3] === "up" ? "▲" : "▼";
        html += '<span class="mkt-item"><span class="sym">' + m[0] + '</span><span class="px">' + m[1] + '</span>' +
                '<span class="mv ' + m[3] + '">' + arrow + " " + m[2] + "</span></span>";
      });
    }
    track.innerHTML = html;
  });

  /* ----- Scroll progress bar ----- */
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  /* ----- Subtle parallax on [data-parallax] layers and [data-parallax-img] ----- */
  var layers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var imgs = Array.prototype.slice.call(document.querySelectorAll("[data-parallax-img]"));
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var st = window.scrollY || window.pageYOffset;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(Math.max(st / max, 0), 1) : 0).toFixed(4) + ")";
    if (reduce) return;
    layers.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      var sp = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      var off = (r.top + r.height / 2 - vh / 2) * -sp * 0.6;
      el.style.transform = "translateY(" + off.toFixed(1) + "px)";
    });
    imgs.forEach(function (img) {
      var r = img.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
      img.style.transform = "translateY(" + (p * 12).toFixed(2) + "%) scale(1.12)";
    });
  }
  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  update();
})();
