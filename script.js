/* Trading Expo India 2027 — interactions */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var KEY = "tx-theme";
  function currentTheme() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function applyLogos(t) {
    var imgs = document.querySelectorAll("img[data-logo-dark]");
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].src = t === "light" ? imgs[i].getAttribute("data-logo-light") : imgs[i].getAttribute("data-logo-dark");
    }
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    applyLogos(t);
    var label = document.getElementById("themeLabel");
    if (label) label.textContent = t === "dark" ? "Light mode" : "Dark mode";
    try { localStorage.setItem(KEY, t); } catch (e) {}
  }
  var saved = currentTheme();
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  } else {
    applyTheme("light");
  }
  ["themeToggle", "themeToggleFooter"].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  });

  /* ---------- Nav ---------- */
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 12); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");
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

  /* ---------- Countdown to 23 Apr 2027, 09:00 IST ---------- */
  var target = new Date("2027-04-23T09:00:00+05:30").getTime();
  var dEl = document.getElementById("cdDays"),
      hEl = document.getElementById("cdHours"),
      mEl = document.getElementById("cdMins"),
      sEl = document.getElementById("cdSecs");
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

  /* ---------- FAQ: one open at a time ---------- */
  var faqs = document.querySelectorAll(".faq-item");
  faqs.forEach(function (item) {
    item.querySelector("summary").addEventListener("click", function () {
      faqs.forEach(function (other) {
        if (other !== item && other.open) other.open = false;
      });
    });
  });

  /* ---------- Anchor offset for fixed nav ---------- */
  document.querySelectorAll("section[id], footer[id]").forEach(function (s) {
    s.style.scrollMarginTop = "76px";
  });
})();

/* Gallery: arrows + drag-to-scroll */
(function () {
  const gal = document.getElementById('galleryTrack');
  if (!gal) return;
  const step = () => {
    const card = gal.querySelector('.g-card');
    return card ? card.offsetWidth + 22 : 400;
  };
  document.getElementById('gPrev')?.addEventListener('click', () => gal.scrollBy({ left: -step(), behavior: 'smooth' }));
  document.getElementById('gNext')?.addEventListener('click', () => gal.scrollBy({ left: step(), behavior: 'smooth' }));

  let down = false, startX = 0, startL = 0;
  gal.addEventListener('pointerdown', (e) => {
    down = true; startX = e.clientX; startL = gal.scrollLeft; gal._moved = false;
    gal.classList.add('dragging'); gal.setPointerCapture(e.pointerId);
  });
  gal.addEventListener('pointermove', (e) => {
    if (!down) return;
    if (Math.abs(e.clientX - startX) > 6) gal._moved = true;
    gal.scrollLeft = startL - (e.clientX - startX);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) =>
    gal.addEventListener(ev, () => { down = false; gal.classList.remove('dragging'); })
  );
})();

/* Agenda day tabs */
(function () {
  const tabs = document.querySelectorAll('.agenda-tab');
  const panels = document.querySelectorAll('.agenda-panel');
  if (!tabs.length) return;
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
    panels.forEach((p) => p.classList.remove('active'));
    t.classList.add('active');
    t.setAttribute('aria-selected', 'true');
    document.getElementById(t.dataset.day)?.classList.add('active');
  }));
})();

/* Gallery lightbox (drag-aware: won't open after a swipe) */
(function () {
  const gal = document.getElementById('galleryTrack');
  const cards = [...document.querySelectorAll('.g-card')];
  const lb = document.getElementById('lightbox');
  if (!cards.length || !lb || !gal) return;
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCap');
  let i = 0;
  const show = (n) => {
    i = (n + cards.length) % cards.length;
    const cImg = cards[i].querySelector('img');
    const cCap = cards[i].querySelector('figcaption');
    img.src = cImg.src; img.alt = cImg.alt;
    cap.innerHTML = cCap ? cCap.innerHTML : '';
  };
  const open = (n) => { show(n); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('locked'); };
  const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('locked'); };
  cards.forEach((c, n) => c.addEventListener('click', () => { if (!gal._moved) open(n); }));
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', (e) => { e.stopPropagation(); show(i - 1); });
  document.getElementById('lbNext').addEventListener('click', (e) => { e.stopPropagation(); show(i + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
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
