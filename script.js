/* Trading Expo India 2027 — interactions */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var KEY = "tx-theme";
  function currentTheme() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
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
    down = true; startX = e.clientX; startL = gal.scrollLeft;
    gal.classList.add('dragging'); gal.setPointerCapture(e.pointerId);
  });
  gal.addEventListener('pointermove', (e) => {
    if (!down) return;
    gal.scrollLeft = startL - (e.clientX - startX);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) =>
    gal.addEventListener(ev, () => { down = false; gal.classList.remove('dragging'); })
  );
})();
