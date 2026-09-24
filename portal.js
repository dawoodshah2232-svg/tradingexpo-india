/* Trading Expo India 2027 — Portal CRM (preview build)
   Demo preview: all data is stored in this browser (localStorage).
   Production build: /api/*.php + /db/schema.sql (MySQL) take over auth,
   bookings and automatic ticket emails on the event's own hosting. */
(function () {
  "use strict";
  var loginWrap = document.getElementById("portalLogin");
  var dashWrap = document.getElementById("portalDash");
  if (!loginWrap || !dashWrap) return;

  var SESSION_KEY = "txi_portal_session";
  var ADMIN_USER = "admin";
  var ADMIN_PASS = "expo2027"; /* demo preview only — production uses the PHP backend */
  var EVENT_DATE = new Date("2027-04-23T09:00:00+05:30");

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function money(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
  function dstr(iso) {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch (e) { return ""; }
  }
  function dtime(iso) {
    try { return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }); }
    catch (e) { return ""; }
  }
  function uid(p) { return (p || "x") + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
  function daysToEvent() { return Math.max(0, Math.ceil((EVENT_DATE - Date.now()) / 86400000)); }

  /* ---------- storage (keys unchanged — compatible with tickets.html / exhibit.html) ---------- */
  function read(key, fb) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; }
    catch (e) { return fb; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }
  function pkey(k, ref) { return "txi_portal_" + k + "_" + ref; }

  function allBookings() {
    var out = [];
    read("txi_bookings", []).forEach(function (b) { b._kind = "ticket"; out.push(b); });
    read("txi_exhibit", []).forEach(function (b) { b._kind = "exhibitor"; out.push(b); });
    out.sort(function (a, b) { return (b.at || "").localeCompare(a.at || ""); });
    return out;
  }
  function findBooking(ref, pass) {
    ref = (ref || "").trim().toUpperCase();
    var list = allBookings();
    for (var i = 0; i < list.length; i++) {
      if (list[i].ref === ref && String(list[i].password || "") === String(pass || "")) return list[i];
    }
    return null;
  }
  function findBookingByRef(ref) {
    var list = allBookings();
    for (var i = 0; i < list.length; i++) if (list[i].ref === ref) return list[i];
    return null;
  }

  /* ---------- demo seed (only when keys absent) ---------- */
  function seed() {
    if (!localStorage.getItem("txi_bookings")) {
      write("txi_bookings", [{
        ref: "TXI27-DEMO", password: "demo123", qty: 1,
        option: { name: "Pro Trader Pass", price: 999 },
        fields: { name: "Demo Trader", email: "demo@tradingexpo.com", phone: "+91 90000 00000", city: "Mumbai" },
        at: new Date().toISOString()
      }]);
    }
    if (!localStorage.getItem("txi_exhibit")) {
      write("txi_exhibit", [{
        ref: "EXB27-DEMO", password: "demo123", qty: 1,
        option: { name: "Premium 6×3m", price: 0 },
        fields: { company: "Demo Fintech Pvt Ltd", name: "Demo Exhibitor", email: "demo@tradingexpo.com", phone: "+91 90000 00001", website: "https://example.com", category: "Fintech" },
        at: new Date().toISOString()
      }]);
    }
    if (!localStorage.getItem("txi_announcements")) {
      var now = new Date().toISOString();
      write("txi_announcements", [
        { id: "a1", title: "Early bird pricing is live", audience: "all", at: now,
          body: "Trader Pass ₹249, Pro Trader ₹999, VIP ₹2,499 — prices rise soon. Share the expo with your trading community." },
        { id: "a2", title: "Exhibitor manual & booth allocation", audience: "exhibitor", at: now,
          body: "The exhibitor manual with setup timings, freight and branding guidelines will be published here. Complete your company profile and team details so we can prepare your badges." },
        { id: "a3", title: "Lucky draw on Day 2", audience: "ticket", at: now,
          body: "Every ticket is automatically entered into the Trading Expo lucky draw on 24 April. Be in the hall to win." }
      ]);
    }
  }
  seed();

  /* ---------- toast ---------- */
  function toast(msg) {
    var t = $("portalToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- login ---------- */
  var loginRole = "exhibitor";
  var roleTabs = loginWrap.querySelectorAll(".role-tab");
  roleTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      roleTabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      loginRole = tab.getAttribute("data-role");
      var admin = loginRole === "admin";
      $("bookingForm").hidden = admin;
      $("adminForm").hidden = !admin;
      $("portalRef").placeholder = loginRole === "ticket" ? "e.g. TXI27-AB12CD" : "e.g. EXB27-AB12CD";
      $("portalError").hidden = true;
    });
  });
  function loginError(msg) {
    var e = $("portalError");
    e.textContent = msg;
    e.hidden = false;
  }
  $("bookingForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var b = findBooking($("portalRef").value, $("portalPass").value);
    if (!b) { loginError("No booking matches that reference and password. Check your booking confirmation."); return; }
    if (b._kind !== loginRole) {
      loginError("This reference is a " + (b._kind === "ticket" ? "ticket" : "booth") +
        " booking — please use the " + (b._kind === "ticket" ? "Ticket Holder" : "Exhibitor") + " tab.");
      return;
    }
    startSession({ role: b._kind, ref: b.ref });
  });
  $("adminForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("adminUser").value.trim() === ADMIN_USER && $("adminPass").value === ADMIN_PASS) {
      startSession({ role: "admin", ref: "ADMIN" });
    } else {
      loginError("Invalid admin username or password.");
    }
  });
  function startSession(s) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
    openDash(s);
    toast("Welcome back.");
  }
  $("portalLogout").addEventListener("click", function () {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    location.reload();
  });

  /* ---------- app state ---------- */
  var state = {
    session: null, view: "dashboard", search: "",
    bq: "", btype: "all", bsort: "at", bdir: -1,
    leadQ: "", teamQ: ""
  };

  var NAV = {
    admin: [
      ["dashboard", "Dashboard", "📊"], ["bookings", "Bookings", "🎟"],
      ["reports", "Reports", "📈"], ["announcements", "Announcements", "📣"],
      ["settings", "Settings", "⚙"]
    ],
    exhibitor: [
      ["dashboard", "Dashboard", "📊"], ["company", "Company Profile", "🏢"],
      ["booth", "Booth Details", "🏗"], ["team", "Team & Badges", "👥"],
      ["leads", "Lead Capture", "🧲"], ["docs", "Documents", "📁"],
      ["offers", "My Offers", "🏷"], ["announcements", "Announcements", "📣"]
    ],
    ticket: [
      ["dashboard", "Dashboard", "📊"], ["tickets", "My Tickets", "🎫"],
      ["event", "Event Info", "ℹ"], ["promos", "Promotions", "🎁"]
    ]
  };
  var ROLE_LABEL = { admin: "Admin portal", exhibitor: "Exhibitor portal", ticket: "Ticket holder portal" };
  var VIEW_TITLE = {
    dashboard: ["Dashboard", "Your command centre at a glance."],
    bookings: ["Bookings", "Every ticket and booth reservation in one table."],
    reports: ["Reports", "Revenue and booking analytics."],
    announcements: ["Announcements", "Publish updates to ticket holders and exhibitors."],
    settings: ["Settings", "Portal preferences and production backend."],
    company: ["Company Profile", "How you appear in the exhibitor directory."],
    booth: ["Booth Details", "Your space, power, internet and AV requirements."],
    team: ["Team & Badges", "Everyone staffing your booth — badges print from this list."],
    leads: ["Lead Capture", "Log every visitor conversation at your booth."],
    docs: ["Documents", "Uploads, downloads and your readiness checklist."],
    offers: ["My Offers", "Promotions visitors see at your booth listing."],
    tickets: ["My Tickets", "Your passes — download or print anytime."],
    event: ["Event Info", "Dates, venue, travel and agenda."],
    promos: ["Promotions", "Offers and updates from the organisers."]
  };

  /* ---------- dashboard shell ---------- */
  function openDash(session) {
    state.session = session;
    loginWrap.hidden = true;
    dashWrap.hidden = false;

    $("sideRole").textContent = session.role === "admin" ? "Admin" : (session.role === "exhibitor" ? "Exhibitor" : "Ticket Holder");
    var nav = $("sideNav");
    nav.innerHTML = "";
    (NAV[session.role] || []).forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "side-link" + (item[0] === "dashboard" ? " active" : "");
      b.setAttribute("data-view", item[0]);
      b.innerHTML = '<span class="ico">' + item[2] + "</span><span>" + item[1] + "</span>";
      b.addEventListener("click", function () { go(item[0]); });
      nav.appendChild(b);
    });

    var name, refLabel;
    if (session.role === "admin") { name = "Event Admin"; refLabel = "ProFX Media"; }
    else {
      var bk = findBookingByRef(session.ref);
      if (!bk) { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {} location.reload(); return; }
      session.booking = bk;
      var f = bk.fields || {};
      name = f.company || f.name || session.ref;
      refLabel = session.ref;
    }
    $("sideUserName").textContent = name;
    $("sideUserRef").textContent = refLabel;
    $("topUserName").textContent = name;
    var av = (name || "?").trim().charAt(0).toUpperCase();
    $("sideAvatar").textContent = av;
    $("topAvatar").textContent = av;

    renderNotifDot();
    go("dashboard");
    window.scrollTo(0, 0);
  }

  function go(view) {
    state.view = view;
    document.querySelectorAll(".side-link").forEach(function (l) {
      l.classList.toggle("active", l.getAttribute("data-view") === view);
    });
    var t = VIEW_TITLE[view] || ["Portal", ""];
    $("pdRole").textContent = ROLE_LABEL[state.session.role] || "Portal";
    $("pdTitle").textContent = t[0];
    $("pdSub").textContent = t[1];
    $("pageActions").innerHTML = "";
    document.body.classList.remove("nav-open");
    $("sideScrim").hidden = true;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function rerender() { render(); }

  function render() {
    var s = state.session, el = $("portalPanels");
    if (!s) return;
    if (s.role === "admin") {
      if (state.view === "bookings") return renderAdminBookings(s, el);
      if (state.view === "reports") return renderAdminReports(s, el);
      if (state.view === "announcements") return renderAdminAnns(s, el);
      if (state.view === "settings") return renderAdminSettings(s, el);
      return renderAdminDashboard(s, el);
    }
    if (s.role === "exhibitor") {
      if (state.view === "company") return renderExCompany(s, el);
      if (state.view === "booth") return renderExBooth(s, el);
      if (state.view === "team") return renderExTeam(s, el);
      if (state.view === "leads") return renderExLeads(s, el);
      if (state.view === "docs") return renderExDocs(s, el);
      if (state.view === "offers") return renderExOffers(s, el);
      if (state.view === "announcements") return renderAnnsView(s, el, "exhibitor");
      return renderExDashboard(s, el);
    }
    if (state.view === "tickets") return renderMyTickets(s, el);
    if (state.view === "event") return renderEventInfo(s, el);
    if (state.view === "promos") return renderAnnsView(s, el, "ticket");
    return renderTicketDashboard(s, el);
  }

  /* ---------- mobile sidebar ---------- */
  $("menuBtn").addEventListener("click", function () {
    document.body.classList.add("nav-open");
    $("sideScrim").hidden = false;
  });
  $("sideScrim").addEventListener("click", function () {
    document.body.classList.remove("nav-open");
    $("sideScrim").hidden = true;
  });

  /* ---------- global search ---------- */
  $("globalSearch").addEventListener("input", function (e) {
    state.search = (e.target.value || "").toLowerCase();
    rerender();
  });
  function matchQ(q) {
    return function (str) { return !q || String(str || "").toLowerCase().indexOf(q) >= 0; };
  }

  /* ---------- notifications ---------- */
  function audienceAnns(s) {
    var a = read("txi_announcements", []);
    if (!s || s.role === "admin") return a;
    return a.filter(function (x) { return x.audience === "all" || x.audience === s.role; });
  }
  function readNotifIds() {
    try { return JSON.parse(sessionStorage.getItem("txi_notif_read") || "[]"); } catch (e) { return []; }
  }
  function unreadCount() {
    var ids = readNotifIds();
    return audienceAnns(state.session).filter(function (a) { return ids.indexOf(a.id) < 0; }).length;
  }
  function renderNotifDot() {
    var n = state.session ? unreadCount() : 0;
    $("notifDot").hidden = n === 0;
  }
  $("notifBtn").addEventListener("click", function (e) {
    e.stopPropagation();
    var drop = $("notifDrop");
    if (drop.hidden) {
      var list = audienceAnns(state.session);
      drop.innerHTML = '<div class="notif-head"><span>Notifications</span><button type="button" id="notifRead">Mark all read</button></div>' +
        (list.length ? list.slice(0, 8).map(function (a) {
          return '<div class="notif-item"><strong>' + esc(a.title) + "</strong><p>" + esc(a.body).slice(0, 120) + (a.body.length > 120 ? "…" : "") + "</p><span>" + esc(dstr(a.at)) + "</span></div>";
        }).join("") : '<div class="notif-item"><p>No notifications yet.</p></div>');
      drop.hidden = false;
      $("notifRead").addEventListener("click", function (ev) {
        ev.stopPropagation();
        try { sessionStorage.setItem("txi_notif_read", JSON.stringify(list.map(function (a) { return a.id; }))); } catch (e2) {}
        renderNotifDot();
        drop.hidden = true;
      });
    } else {
      drop.hidden = true;
    }
  });
  document.addEventListener("click", function (e) {
    var drop = $("notifDrop");
    if (!drop.hidden && !e.target.closest(".notif-wrap")) drop.hidden = true;
  });

  /* ---------- drawer ---------- */
  function openDrawer(title, sub, html) {
    var d = $("drawer");
    d.innerHTML = '<button class="icon-btn drawer-close" id="drawerClose" type="button" aria-label="Close">×</button>' +
      "<h2>" + esc(title) + "</h2><p class='muted' style='margin:4px 0 16px;font-size:13px'>" + esc(sub) + "</p>" + html;
    $("drawerWrap").hidden = false;
    $("drawerClose").addEventListener("click", closeDrawer);
  }
  function closeDrawer() { $("drawerWrap").hidden = true; }
  $("drawerScrim").addEventListener("click", closeDrawer);

  /* ---------- shared builders ---------- */
  function kpi(label, value, sub, cls) {
    return '<div class="kpi ' + (cls || "") + '"><span>' + esc(label) + "</span><strong>" + value + "</strong>" +
      (sub ? "<small>" + sub + "</small>" : "") + "</div>";
  }
  function barChart(rows) {
    // rows: [[label, value, cls]]
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([1]));
    return '<div class="bar-chart">' + rows.map(function (r) {
      var h = Math.max(4, Math.round(r[1] / max * 100));
      return '<div class="bar-col"><span class="bar-val">' + r[1] + '</span><div class="bar ' + (r[2] || "") + '" style="height:' + h + '%"></div><span class="bar-lbl">' + esc(r[0]) + "</span></div>";
    }).join("") + "</div>";
  }
  function donut(segs, label) {
    // segs: [[cls, pct]] — rendered as conic stops via --p1/--p2
    var p1 = Math.min(100, Math.max(0, segs[0] ? segs[0][1] : 0));
    var p2 = Math.min(100, p1 + (segs[1] ? segs[1][1] : 0));
    return '<div class="donut" style="--p1:' + p1 + '%;--p2:' + p2 + '%" data-label="' + esc(label) + '"></div>';
  }
  function promoList(aud) {
    var list = read("txi_announcements", []).filter(function (a) { return a.audience === "all" || a.audience === aud; });
    if (!list.length) return '<div class="empty-state"><span class="big">📣</span>No announcements yet — check back soon.</div>';
    return list.map(function (a) {
      return '<article class="promo-card"><span class="promo-date">' + esc(dstr(a.at)) + " · " + esc(a.audience) + '</span>' +
        "<h4>" + esc(a.title) + "</h4><p>" + esc(a.body) + "</p></article>";
    }).join("");
  }
  function ticketCardHTML(b, compact) {
    var f = b.fields || {};
    return '<div class="pticket"><div class="pticket-top"><div><strong>TRADING EXPO INDIA 2027</strong>' +
      "<span>23–24 April 2027 · India</span></div>" +
      '<div class="pticket-qr">' + esc(b.ref).replace(/-/g, "<br>") + "</div></div>" +
      '<div class="pticket-grid">' +
      "<div><span>Holder</span><strong>" + esc(f.name || f.company || "—") + "</strong></div>" +
      "<div><span>Pass / Booth</span><strong>" + esc(b.option ? b.option.name : "—") + "</strong></div>" +
      "<div><span>Reference</span><strong class='ref'>" + esc(b.ref) + "</strong></div>" +
      "<div><span>Status</span><strong>Reserved ✓</strong></div></div>" +
      (compact ? "" : '<p class="pticket-note">Present this reference at registration. Payment link will be emailed to ' + esc(f.email || "you") + ".</p>") + "</div>";
  }
  function printTicket(b) {
    var f = b.fields || {};
    var w = window.open("", "_blank");
    if (!w) { toast("Please allow pop-ups to print your ticket."); return; }
    w.document.write("<html><head><title>Ticket " + esc(b.ref) + "</title><style>" +
      "body{font-family:Arial,sans-serif;background:#f4f4f4;display:flex;justify-content:center;padding:40px}" +
      ".t{background:#fff;border:2px solid #0B1F3B;border-radius:16px;max-width:560px;width:100%;overflow:hidden}" +
      ".h{background:#0B1F3B;color:#fff;padding:26px;display:flex;justify-content:space-between;align-items:center}" +
      ".b{padding:26px}.r{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #eee}" +
      ".ref{font-size:22px;letter-spacing:2px;color:#00A86B}" +
      ".f{padding:18px 26px;color:#666;font-size:12px}" +
      "</style></head><body><div class='t'><div class='h'><div><strong>TRADING EXPO INDIA 2027</strong><br>23–24 April 2027 · India</div>" +
      "<div style='font-size:12px;background:#00C853;color:#04240f;padding:8px 14px;border-radius:8px;font-weight:bold'>ADMIT</div></div>" +
      "<div class='b'><div class='r'><span>Holder</span><strong>" + esc(f.name || f.company || "") + "</strong></div>" +
      "<div class='r'><span>Pass / Booth</span><strong>" + esc(b.option ? b.option.name : "") + "</strong></div>" +
      "<div class='r'><span>Reference</span><strong class='ref'>" + esc(b.ref) + "</strong></div>" +
      "<div class='r'><span>Status</span><strong>Reserved</strong></div></div>" +
      "<div class='f'>Organised by ProFX Media FZ-LLC. Present this ticket at registration. Demo preview ticket.</div></div>" +
      "<script>window.onload=function(){window.print()}<\/script></body></html>");
    w.document.close();
  }
  function exportCSV(filename, rows) {
    var csv = rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 400);
  }
  function bookingRows() {
    return allBookings().map(function (b) {
      var f = b.fields || {};
      var price = b.option && b.option.price ? b.option.price : 0;
      return {
        ref: b.ref, kind: b._kind, name: f.company || f.name || "", email: f.email || "",
        phone: f.phone || "", option: b.option ? b.option.name : "", qty: b.qty || 1,
        total: price ? price * (b.qty || 1) : 0, at: b.at || "", raw: b
      };
    });
  }

  /* ================= ADMIN ================= */
  function renderAdminDashboard(s, el) {
    var rows = bookingRows();
    var tickets = rows.filter(function (r) { return r.kind === "ticket"; });
    var exhibs = rows.filter(function (r) { return r.kind === "exhibitor"; });
    var revenue = rows.reduce(function (sum, r) { return sum + r.total; }, 0);

    var byType = {};
    tickets.forEach(function (r) { byType[r.option || "Other"] = (byType[r.option || "Other"] || 0) + 1; });
    var typeRows = Object.keys(byType).map(function (k) { return [k.length > 14 ? k.slice(0, 13) + "…" : k, byType[k], ""]; })
      .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);

    var total = rows.length || 1;
    var feed = rows.slice(0, 6).map(function (r) {
      return '<div class="feed-item"><span class="feed-dot"></span><div><strong>' + esc(r.name) + " — " + esc(r.option) + "</strong>" +
        "<p>" + (r.kind === "ticket" ? "Ticket booking" : "Booth reservation") + " · <span class='mono'>" + esc(r.ref) + "</span></p>" +
        "<span>" + esc(dtime(r.at)) + "</span></div></div>";
    }).join("");

    el.innerHTML =
      '<div class="kpi-grid">' +
      kpi("Total bookings", rows.length, tickets.length + " tickets · " + exhibs.length + " booths") +
      kpi("Ticket bookings", tickets.length, "across " + Object.keys(byType).length + " pass types", "navy") +
      kpi("Exhibitor reservations", exhibs.length, "booths reserved", "amber") +
      kpi("Potential ticket revenue", money(revenue), "from priced passes") +
      "</div>" +
      '<div class="grid-2">' +
      '<div class="card"><h3>Bookings by pass type</h3><p class="card-sub">Ticket sales split across pass categories.</p>' +
      (typeRows.length ? barChart(typeRows) : '<div class="empty-state">No ticket bookings yet.</div>') + "</div>" +
      '<div class="card"><h3>Ticket vs exhibitor</h3><p class="card-sub">Share of all reservations.</p><div class="donut-wrap">' +
      donut([["g", Math.round(tickets.length / total * 100)], ["n", Math.round(exhibs.length / total * 100)]], rows.length + " total") +
      '<div class="legend"><span class="lg-green"><i></i>Tickets — ' + tickets.length + '</span>' +
      '<span class="lg-navy"><i></i>Exhibitors — ' + exhibs.length + "</span></div></div></div>" +
      "</div>" +
      '<div class="card"><h3>Recent activity</h3><p class="card-sub">Latest bookings across the event.</p><div class="feed">' +
      (feed || '<div class="empty-state">No activity yet.</div>') + "</div></div>" +
      '<div class="callout"><strong>Demo preview mode.</strong><span>This admin panel reads bookings stored in this browser. On the live platform it connects to the MySQL database via the PHP backend in <code>/api</code> — with real logins, shared data and automatic ticket emails.</span></div>';
  }

  function renderAdminBookings(s, el) {
    var q = (state.bq || state.search || "").toLowerCase();
    var rows = bookingRows().filter(function (r) {
      if (state.btype !== "all" && r.kind !== state.btype) return false;
      if (!q) return true;
      var m = matchQ(q);
      return m(r.ref) || m(r.name) || m(r.email) || m(r.option) || m(r.phone);
    });
    var sk = state.bsort, dir = state.bdir;
    rows.sort(function (a, b) {
      var va = a[sk], vb = b[sk];
      if (sk === "total" || sk === "qty") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
    function th(label, key, sortable) {
      if (!sortable) return "<th class='no-sort'>" + label + "</th>";
      var arrow = state.bsort === key ? (state.bdir === 1 ? " ▲" : " ▼") : "";
      return "<th data-sort='" + key + "'>" + label + arrow + "</th>";
    }
    $("pageActions").innerHTML = '<button class="btn btn-primary btn-sm" id="expCsv" type="button">⬇ Export CSV</button>';
    $("expCsv").addEventListener("click", function () {
      exportCSV("trading-expo-bookings.csv",
        [["Reference", "Type", "Name/Company", "Email", "Phone", "Selection", "Qty", "Total (INR)", "Booked at"]].concat(
          rows.map(function (r) { return [r.ref, r.kind, r.name, r.email, r.phone, r.option, r.qty, r.total, r.at]; })));
      toast("CSV downloaded (" + rows.length + " rows).");
    });

    el.innerHTML =
      '<div class="card"><div class="table-tools">' +
      '<input type="search" id="bq" placeholder="Search ref, name, email…" value="' + esc(state.bq) + '">' +
      '<select id="btype"><option value="all">All types</option>' +
      '<option value="ticket"' + (state.btype === "ticket" ? " selected" : "") + ">Tickets</option>" +
      '<option value="exhibitor"' + (state.btype === "exhibitor" ? " selected" : "") + ">Exhibitors</option></select>" +
      '<span class="fine">' + rows.length + " result" + (rows.length === 1 ? "" : "s") + " — click a row for details</span></div>" +
      (rows.length ? '<div class="table-wrap"><table class="data-table"><thead><tr>' +
        th("Reference", "ref", 1) + th("Type", "kind", 1) + th("Name / Company", "name", 1) + th("Email", "email", 0) +
        th("Selection", "option", 1) + th("Qty", "qty", 1) + th("Total", "total", 1) + th("Booked", "at", 1) +
        "</tr></thead><tbody>" +
        rows.map(function (r) {
          return "<tr data-ref='" + esc(r.ref) + "'><td class='mono'>" + esc(r.ref) + "</td>" +
            "<td><span class='pill " + (r.kind === "ticket" ? "pill-ticket" : "pill-exhibitor") + "'>" + r.kind + "</span></td>" +
            "<td><strong>" + esc(r.name || "—") + "</strong></td><td>" + esc(r.email || "—") + "</td>" +
            "<td>" + esc(r.option || "—") + "</td><td>" + r.qty + "</td>" +
            "<td><strong>" + (r.total ? money(r.total) : "On request") + "</strong></td><td>" + esc(dstr(r.at)) + "</td></tr>";
        }).join("") + "</tbody></table></div>"
        : '<div class="empty-state"><span class="big">🎟</span>No bookings match your filters.</div>') + "</div>";

    var bq = $("bq");
    bq.addEventListener("input", function () { state.bq = bq.value; state.search = ""; $("globalSearch").value = ""; rerender(); });
    $("btype").addEventListener("change", function (e) { state.btype = e.target.value; rerender(); });
    el.querySelectorAll("[data-sort]").forEach(function (thEl) {
      thEl.addEventListener("click", function () {
        var k = thEl.getAttribute("data-sort");
        if (state.bsort === k) state.bdir *= -1; else { state.bsort = k; state.bdir = 1; }
        rerender();
      });
    });
    el.querySelectorAll("tr[data-ref]").forEach(function (tr) {
      tr.addEventListener("click", function () { openBookingDrawer(tr.getAttribute("data-ref")); });
    });
  }

  function openBookingDrawer(ref) {
    var b = findBookingByRef(ref);
    if (!b) return;
    var f = b.fields || {};
    var price = b.option && b.option.price ? b.option.price : 0;
    var fieldRows = Object.keys(f).map(function (k) {
      return '<div class="d-row"><span>' + esc(k.charAt(0).toUpperCase() + k.slice(1)) + "</span><strong>" + esc(f[k]) + "</strong></div>";
    }).join("");
    openDrawer(b.ref, (b._kind === "ticket" ? "Ticket booking" : "Exhibitor reservation") + " · " + dstr(b.at),
      '<div class="d-row"><span>Type</span><strong>' + (b._kind === "ticket" ? "Ticket" : "Exhibitor") + "</strong></div>" +
      '<div class="d-row"><span>Selection</span><strong>' + esc(b.option ? b.option.name : "—") + "</strong></div>" +
      '<div class="d-row"><span>Quantity</span><strong>' + (b.qty || 1) + "</strong></div>" +
      '<div class="d-row"><span>Total</span><strong>' + (price ? money(price * (b.qty || 1)) : "On request") + "</strong></div>" +
      '<div class="d-row"><span>Booked at</span><strong>' + esc(dtime(b.at)) + "</strong></div>" +
      '<h3 class="panel-title">Contact details</h3>' + (fieldRows || "<p class='muted'>None captured.</p>") +
      '<div class="bnav"><button class="btn btn-primary" id="drawerPrint" type="button">Print / Download Ticket</button></div>' +
      '<p class="fine">Demo preview — passwords are never shown here.</p>');
    $("drawerPrint").addEventListener("click", function () { printTicket(b); });
  }

  function renderAdminReports(s, el) {
    var rows = bookingRows();
    var tickets = rows.filter(function (r) { return r.kind === "ticket"; });
    var revByType = {};
    tickets.forEach(function (r) {
      var k = r.option || "Other";
      revByType[k] = revByType[k] || { count: 0, rev: 0 };
      revByType[k].count += r.qty;
      revByType[k].rev += r.total;
    });
    var keys = Object.keys(revByType).sort(function (a, b) { return revByType[b].rev - revByType[a].rev; });
    var totalRev = keys.reduce(function (sum, k) { return sum + revByType[k].rev; }, 0);

    el.innerHTML =
      '<div class="kpi-grid">' +
      kpi("Total potential revenue", money(totalRev), "from " + tickets.length + " ticket bookings") +
      kpi("Avg. ticket value", money(tickets.length ? Math.round(totalRev / tickets.length) : 0), "per booking", "navy") +
      kpi("Days to event", daysToEvent(), "23 April 2027", "amber") +
      "</div>" +
      '<div class="card"><h3>Revenue by pass type</h3><p class="card-sub">Quantity sold and potential revenue per pass.</p>' +
      (keys.length ? '<div class="table-wrap"><table class="data-table"><thead><tr><th class="no-sort">Pass type</th><th class="no-sort">Qty</th><th class="no-sort">Revenue</th><th class="no-sort">Share</th></tr></thead><tbody>' +
        keys.map(function (k) {
          var pct = totalRev ? Math.round(revByType[k].rev / totalRev * 100) : 0;
          return "<tr><td><strong>" + esc(k) + "</strong></td><td>" + revByType[k].count + "</td><td><strong>" +
            money(revByType[k].rev) + "</strong></td><td><div class='progress' style='margin:0'><i style='width:" + pct + "%'></i></div><span class='fine'>" + pct + "%</span></td></tr>";
        }).join("") + "</tbody></table></div>"
        : '<div class="empty-state"><span class="big">📈</span>No revenue data yet.</div>') + "</div>" +
      '<div class="card"><h3>Bookings by pass type</h3><p class="card-sub">Volume across pass categories.</p>' +
      (keys.length ? barChart(keys.slice(0, 8).map(function (k) { return [k.length > 14 ? k.slice(0, 13) + "…" : k, revByType[k].count, "navy"]; }))
        : '<div class="empty-state">No data yet.</div>') + "</div>";
  }

  function renderAdminAnns(s, el) {
    function draw() {
      var list = read("txi_announcements", []);
      el.innerHTML =
        '<div class="card"><h3>Compose announcement</h3><p class="card-sub">Published instantly to the selected audience inside their portals.</p>' +
        '<div class="form-grid">' +
        '<label class="full">Title<input id="anTitle" placeholder="Announcement title"></label>' +
        '<label>Audience<select id="anAud"><option value="all">Everyone</option><option value="ticket">Ticket holders</option><option value="exhibitor">Exhibitors</option></select></label>' +
        '<label class="full">Message<textarea id="anBody" rows="4" placeholder="Write the announcement…"></textarea></label>' +
        "</div>" +
        '<div class="bnav"><button class="btn btn-primary" id="anAdd" type="button">📣 Publish Announcement</button></div></div>' +
        '<div class="card"><h3>Published (' + list.length + ")</h3><p class='card-sub'>Newest first.</p><div class='ann-list'>" +
        (list.length ? list.map(function (a) {
          return '<div class="ann-row"><div><strong>' + esc(a.title) + '</strong> <span class="ann-aud">' + esc(a.audience) + " · " + esc(dstr(a.at)) + "</span><p>" + esc(a.body) + '</p></div><button type="button" class="mini-btn danger" data-del="' + a.id + '">Delete</button></div>';
        }).join("") : '<div class="empty-state"><span class="big">📣</span>No announcements yet.</div>') + "</div></div>";
      $("anAdd").addEventListener("click", function () {
        var t = $("anTitle").value.trim(), bd = $("anBody").value.trim();
        if (!t || !bd) { toast("Add a title and a message first."); return; }
        var cur = read("txi_announcements", []);
        cur.unshift({ id: uid("a"), title: t, body: bd, audience: $("anAud").value, at: new Date().toISOString() });
        write("txi_announcements", cur) ? toast("Announcement published.") : toast("Could not save — storage is full.");
        try { sessionStorage.removeItem("txi_notif_read"); } catch (e) {}
        draw();
      });
      el.querySelectorAll("[data-del]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var cur = read("txi_announcements", []).filter(function (a) { return a.id !== btn.getAttribute("data-del"); });
          write("txi_announcements", cur);
          toast("Announcement deleted.");
          draw();
        });
      });
    }
    draw();
  }

  function renderAdminSettings(s, el) {
    el.innerHTML =
      '<div class="grid-2">' +
      '<div class="card"><h3>Demo access</h3><p class="card-sub">Preview credentials for this demo portal.</p>' +
      '<div class="d-row" style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px"><span class="muted">Admin</span><strong class="mono">admin / expo2027</strong></div>' +
      '<div class="d-row" style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px"><span class="muted">Exhibitor</span><strong class="mono">EXB27-DEMO / demo123</strong></div>' +
      '<div class="d-row" style="display:flex;justify-content:space-between;padding:10px 0;font-size:13.5px"><span class="muted">Ticket holder</span><strong class="mono">TXI27-DEMO / demo123</strong></div>' +
      '<p class="fine">Authentication happens in the browser only in this preview.</p></div>' +
      '<div class="card"><h3>Production backend — PHP + MySQL</h3><p class="card-sub">Ready for cPanel hosting.</p>' +
      '<p class="fine"><code>/db/schema.sql</code> holds the bookings, users and announcements tables. <code>/api/config.php</code> holds the database credentials. <code>/api/book.php</code> creates bookings, hashes portal passwords and <strong>sends the ticket email automatically</strong>. Import the schema, set the credentials, and bookings start emailing tickets with no further code changes.</p></div>' +
      "</div>" +
      '<div class="card"><h3>Demo data</h3><p class="card-sub">Reset everything stored in this browser.</p>' +
      '<div class="bnav"><button class="btn btn-danger" id="resetDemo" type="button">Reset demo data</button></div>' +
      '<p class="fine">Clears bookings, announcements and all portal records in this browser, then reloads.</p></div>';
    $("resetDemo").addEventListener("click", function () {
      if (!confirm("Reset all demo data in this browser?")) return;
      var kill = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf("txi_") === 0)) kill.push(k);
      }
      kill.forEach(function (k) { localStorage.removeItem(k); });
      try { sessionStorage.clear(); } catch (e) {}
      location.reload();
    });
  }

  /* ================= EXHIBITOR ================= */
  function exReadiness(ref) {
    var info = read(pkey("info", ref), {}), booth = read(pkey("booth", ref), {}),
        team = read(pkey("team", ref), []), files = read(pkey("files", ref), []),
        offers = read(pkey("offers", ref), []);
    var items = [
      ["Reservation confirmed", true, "Your booth is reserved."],
      ["Company profile completed", !!(info.pcCompany && info.pcCompany.trim()), "Add it under Company Profile."],
      ["Booth requirements submitted", !!booth.pbLoc, "Tell us about power, internet and AV."],
      ["Team & badges submitted", team.length > 0, "Add your booth staff."],
      ["Logo / brand files uploaded", files.length > 0, "Upload your logo and posters."],
      ["Offer published", offers.length > 0, "Add a visitor offer under My Offers."],
      ["Payment completed", false, "Our team will send your payment link."]
    ];
    return items;
  }

  function renderExDashboard(s, el) {
    var b = s.booking, f = b.fields || {}, ref = b.ref;
    var team = read(pkey("team", ref), []);
    var leads = read(pkey("leads", ref), []);
    var offers = read(pkey("offers", ref), []);
    var items = exReadiness(ref);
    var done = items.filter(function (c) { return c[1]; }).length;
    var pct = Math.round(done / items.length * 100);

    var byInterest = {};
    leads.forEach(function (l) { var k = l.interest || "General"; byInterest[k] = (byInterest[k] || 0) + 1; });
    var intRows = Object.keys(byInterest).map(function (k) { return [k, byInterest[k], "navy"]; });

    var feed = leads.slice(-5).reverse().map(function (l) {
      return '<div class="feed-item"><span class="feed-dot"></span><div><strong>' + esc(l.name) + (l.company ? " · " + esc(l.company) : "") + "</strong>" +
        "<p>" + esc(l.interest || "General enquiry") + "</p><span>" + esc(dtime(l.at)) + "</span></div></div>";
    }).join("");

    el.innerHTML =
      '<div class="kpi-grid">' +
      kpi("Your booth", esc(b.option ? b.option.name : "—"), "Ref " + esc(ref)) +
      kpi("Team badges", team.length + " registered", team.length ? "ready to print" : "add your booth staff", "navy") +
      kpi("Leads captured", leads.length, leads.length ? "keep the conversations coming" : "log booth visitors", "amber") +
      kpi("Readiness", pct + "%", done + " of " + items.length + " steps complete") +
      "</div>" +
      '<div class="grid-2">' +
      '<div class="card"><h3>Readiness checklist</h3><p class="card-sub">Complete these before 23 April 2027.</p>' +
      '<div class="progress"><i style="width:' + pct + '%"></i></div><p class="fine">' + done + " of " + items.length + " complete</p>" +
      '<div class="bnav"><button class="btn btn-ghost btn-sm" id="goDocs" type="button">Open Documents →</button></div></div>' +
      '<div class="card"><h3>Leads by interest</h3><p class="card-sub">What booth visitors asked about.</p>' +
      (intRows.length ? barChart(intRows) : '<div class="empty-state"><span class="big">🧲</span>No leads logged yet — add them under Lead Capture.</div>') + "</div>" +
      "</div>" +
      '<div class="grid-2">' +
      '<div class="card"><h3>Recent leads</h3><p class="card-sub">Latest visitor conversations.</p><div class="feed">' +
      (feed || '<div class="empty-state">No leads yet.</div>') + "</div></div>" +
      '<div class="card"><h3>Latest announcements</h3><p class="card-sub">From the organisers.</p>' + promoList("exhibitor") + "</div>" +
      "</div>";
    var gd = $("goDocs");
    if (gd) gd.addEventListener("click", function () { go("docs"); });
  }

  function renderExCompany(s, el) {
    var ref = s.ref, f = s.booking.fields || {};
    var info = read(pkey("info", ref), {});
    el.innerHTML =
      '<div class="card"><h3>Company profile</h3><p class="card-sub">This appears in the exhibitor directory and on your fascia branding.</p>' +
      '<div class="form-grid">' +
      '<label>Company name<input id="pcCompany" value="' + esc(info.pcCompany || f.company || "") + '"></label>' +
      '<label>Contact person<input id="pcContact" value="' + esc(info.pcContact || f.name || "") + '"></label>' +
      '<label>Work email<input id="pcEmail" type="email" value="' + esc(info.pcEmail || f.email || "") + '"></label>' +
      '<label>Phone<input id="pcPhone" value="' + esc(info.pcPhone || f.phone || "") + '"></label>' +
      '<label>Website<input id="pcWebsite" value="' + esc(info.pcWebsite || f.website || "") + '"></label>' +
      '<label>Category<select id="pcCategory">' +
      ["Broker", "Fintech", "Trading Technology", "Prop Firm", "Media / Affiliate", "Education", "Other"].map(function (c) {
        return "<option" + ((info.pcCategory || f.category) === c ? " selected" : "") + ">" + c + "</option>";
      }).join("") + "</select></label>" +
      '<label class="full">Company description (50 words for the directory)<textarea id="pcAbout" rows="3">' + esc(info.pcAbout || "") + "</textarea></label>" +
      "</div>" +
      '<div class="bnav"><button class="btn btn-primary" id="saveInfoBtn" type="button">Save Company Profile</button></div></div>';
    $("saveInfoBtn").addEventListener("click", function () {
      var d = {};
      ["pcCompany", "pcContact", "pcEmail", "pcPhone", "pcWebsite", "pcCategory", "pcAbout"].forEach(function (id) { d[id] = $(id).value; });
      if (!d.pcCompany.trim()) { toast("Please enter your company name."); return; }
      write(pkey("info", ref), d) ? toast("Company profile saved.") : toast("Could not save — storage is full.");
    });
  }

  function renderExBooth(s, el) {
    var ref = s.ref, b = s.booking;
    var booth = read(pkey("booth", ref), {});
    el.innerHTML =
      '<div class="card"><h3>Booth details &amp; requirements</h3><p class="card-sub">Our operations team works from these details.</p>' +
      '<div class="form-grid">' +
      '<label>Reserved booth<input value="' + esc(b.option ? b.option.name : "") + '" disabled></label>' +
      '<label>Location preference<select id="pbLoc">' +
      ["No preference", "Near entrance", "Near main stage", "Near networking lounge", "Near food court"].map(function (c) {
        return "<option" + (booth.pbLoc === c ? " selected" : "") + ">" + c + "</option>";
      }).join("") + "</select></label>" +
      '<label>Power requirement<select id="pbPower">' +
      ["Standard (1 socket)", "Extra power", "Three-phase"].map(function (c) {
        return "<option" + (booth.pbPower === c ? " selected" : "") + ">" + c + "</option>";
      }).join("") + "</select></label>" +
      '<label>Internet<select id="pbNet">' +
      ["Shared Wi-Fi is fine", "Dedicated wired line", "No internet needed"].map(function (c) {
        return "<option" + (booth.pbNet === c ? " selected" : "") + ">" + c + "</option>";
      }).join("") + "</select></label>" +
      '<label class="check"><input type="checkbox" id="pbAV"' + (booth.pbAV ? " checked" : "") + '> AV / LED screen needed</label>' +
      '<label class="check"><input type="checkbox" id="pbStore"' + (booth.pbStore ? " checked" : "") + '> Lockable storage needed</label>' +
      '<label class="full">Extra furniture / special requirements<textarea id="pbNotes" rows="3">' + esc(booth.pbNotes || "") + "</textarea></label>" +
      "</div>" +
      '<div class="bnav"><button class="btn btn-primary" id="saveBoothBtn" type="button">Save Booth Requirements</button></div></div>';
    $("saveBoothBtn").addEventListener("click", function () {
      var d = { pbLoc: $("pbLoc").value, pbPower: $("pbPower").value, pbNet: $("pbNet").value, pbAV: $("pbAV").checked, pbStore: $("pbStore").checked, pbNotes: $("pbNotes").value };
      write(pkey("booth", ref), d) ? toast("Booth requirements saved.") : toast("Could not save — storage is full.");
    });
  }

  function renderExTeam(s, el) {
    var ref = s.ref;
    var q = (state.teamQ || state.search || "").toLowerCase();
    function draw() {
      var team = read(pkey("team", ref), []);
      var shown = team.filter(function (m) {
        if (!q) return true;
        var mq = matchQ(q);
        return mq(m.name) || mq(m.role);
      });
      el.innerHTML =
        '<div class="card"><h3>Team &amp; badges (' + team.length + ")</h3>" +
        '<p class="card-sub">Badges are printed from this list — names must match ID.</p>' +
        '<div class="table-tools"><input type="search" id="teamQ" placeholder="Search team…" value="' + esc(state.teamQ) + '"></div>' +
        (shown.length ? '<div class="table-wrap"><table class="data-table"><thead><tr><th class="no-sort">Name</th><th class="no-sort">Role / Title</th><th class="no-sort">Meal</th><th class="no-sort">T-shirt</th><th class="no-sort"></th></tr></thead><tbody>' +
          shown.map(function (m, i) {
            return "<tr><td><strong>" + esc(m.name) + "</strong></td><td>" + esc(m.role || "—") + "</td><td>" + esc(m.meal || "—") + "</td><td>" + esc(m.size || "—") +
              '</td><td><div class="row-actions"><button type="button" class="mini-btn danger" data-tdel="' + team.indexOf(m) + '">Remove</button></div></td></tr>';
          }).join("") + "</tbody></table></div>"
          : '<div class="empty-state"><span class="big">👥</span>No team members yet — add your booth staff below.</div>') + "</div>" +
        '<div class="card"><h3>Add team member</h3><div class="form-grid">' +
        '<label>Full name<input id="tmName" placeholder="As on ID"></label>' +
        '<label>Role / title<input id="tmRole" placeholder="e.g. Sales Head"></label>' +
        '<label>Meal preference<select id="tmMeal"><option value="">Select…</option><option>Veg</option><option>Non-veg</option></select></label>' +
        '<label>T-shirt size<select id="tmSize"><option value="">Select…</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option></select></label>' +
        "</div>" +
        '<div class="bnav"><button class="btn btn-primary" id="tmAdd" type="button">+ Add to Team</button></div></div>';
      $("teamQ").addEventListener("input", function (e) { state.teamQ = e.target.value; state.search = ""; $("globalSearch").value = ""; draw(); });
      $("tmAdd").addEventListener("click", function () {
        var nm = $("tmName").value.trim();
        if (!nm) { toast("Enter the team member's name."); return; }
        var cur = read(pkey("team", ref), []);
        cur.push({ name: nm, role: $("tmRole").value.trim(), meal: $("tmMeal").value, size: $("tmSize").value });
        write(pkey("team", ref), cur) ? toast("Team member added (" + cur.length + " badges).") : toast("Could not save — storage is full.");
        draw();
      });
      el.querySelectorAll("[data-tdel]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var cur = read(pkey("team", ref), []);
          cur.splice(parseInt(btn.getAttribute("data-tdel"), 10), 1);
          write(pkey("team", ref), cur);
          toast("Team member removed.");
          draw();
        });
      });
    }
    draw();
  }

  function renderExLeads(s, el) {
    var ref = s.ref;
    var q = (state.leadQ || state.search || "").toLowerCase();
    var INTERESTS = ["General enquiry", "Platform demo", "Partnership", "IB / Affiliate", "Pricing", "API / Technology"];
    function draw() {
      var leads = read(pkey("leads", ref), []);
      var shown = leads.filter(function (l) {
        if (!q) return true;
        var mq = matchQ(q);
        return mq(l.name) || mq(l.company) || mq(l.email) || mq(l.interest);
      }).slice().reverse();
      $("pageActions").innerHTML = '<button class="btn btn-ghost btn-sm" id="leadCsv" type="button">⬇ Export CSV</button>';
      $("leadCsv").addEventListener("click", function () {
        exportCSV("booth-leads-" + ref + ".csv",
          [["Name", "Company", "Email", "Phone", "Interest", "Notes", "Captured"]].concat(
            leads.map(function (l) { return [l.name, l.company, l.email, l.phone, l.interest, l.notes, l.at]; })));
        toast("Leads exported (" + leads.length + ").");
      });
      el.innerHTML =
        '<div class="kpi-grid">' + kpi("Total leads", leads.length, "captured at your booth") +
        kpi("This week", leads.filter(function (l) { return Date.now() - new Date(l.at).getTime() < 7 * 864e5; }).length + " new", "last 7 days", "navy") + "</div>" +
        '<div class="card"><h3>Capture a lead</h3><p class="card-sub">Log every visitor conversation — scan or type, it takes 20 seconds.</p>' +
        '<div class="form-grid">' +
        '<label>Full name<input id="ldName" placeholder="Visitor name"></label>' +
        '<label>Company<input id="ldCompany" placeholder="Company"></label>' +
        '<label>Email<input id="ldEmail" type="email" placeholder="name@company.com"></label>' +
        '<label>Phone<input id="ldPhone" placeholder="+91 …"></label>' +
        '<label>Interest<select id="ldInterest">' + INTERESTS.map(function (x) { return "<option>" + x + "</option>"; }).join("") + "</select></label>" +
        '<label>Notes<textarea id="ldNotes" rows="2" placeholder="What did they want? Follow-up?"></textarea></label>' +
        "</div>" +
        '<div class="bnav"><button class="btn btn-primary" id="ldAdd" type="button">+ Save Lead</button></div></div>' +
        '<div class="card"><h3>Lead list (' + shown.length + ")</h3>" +
        '<div class="table-tools"><input type="search" id="leadQ" placeholder="Search leads…" value="' + esc(state.leadQ) + '"></div>' +
        (shown.length ? '<div class="table-wrap"><table class="data-table"><thead><tr><th class="no-sort">Name</th><th class="no-sort">Company</th><th class="no-sort">Contact</th><th class="no-sort">Interest</th><th class="no-sort">Captured</th><th class="no-sort"></th></tr></thead><tbody>' +
          shown.map(function (l) {
            var idx = leads.indexOf(l);
            return "<tr><td><strong>" + esc(l.name) + "</strong></td><td>" + esc(l.company || "—") + "</td>" +
              "<td>" + esc(l.email || l.phone || "—") + "</td>" +
              "<td><span class='pill pill-ticket'>" + esc(l.interest || "General") + "</span></td>" +
              "<td>" + esc(dstr(l.at)) + '</td><td><div class="row-actions"><button type="button" class="mini-btn danger" data-ldel="' + idx + '">Delete</button></div></td></tr>';
          }).join("") + "</tbody></table></div>"
          : '<div class="empty-state"><span class="big">🧲</span>No leads yet — your next customer starts here.</div>') + "</div>";
      $("leadQ").addEventListener("input", function (e) { state.leadQ = e.target.value; state.search = ""; $("globalSearch").value = ""; draw(); });
      $("ldAdd").addEventListener("click", function () {
        var nm = $("ldName").value.trim();
        if (!nm) { toast("Enter the visitor's name."); return; }
        var cur = read(pkey("leads", ref), []);
        cur.push({ id: uid("l"), name: nm, company: $("ldCompany").value.trim(), email: $("ldEmail").value.trim(), phone: $("ldPhone").value.trim(), interest: $("ldInterest").value, notes: $("ldNotes").value.trim(), at: new Date().toISOString() });
        write(pkey("leads", ref), cur) ? toast("Lead saved (" + cur.length + " total).") : toast("Could not save — storage is full.");
        draw();
      });
      el.querySelectorAll("[data-ldel]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var cur = read(pkey("leads", ref), []);
          cur.splice(parseInt(btn.getAttribute("data-ldel"), 10), 1);
          write(pkey("leads", ref), cur);
          toast("Lead deleted.");
          draw();
        });
      });
    }
    draw();
  }

  function renderExDocs(s, el) {
    var ref = s.ref;
    var items = exReadiness(ref);
    var done = items.filter(function (c) { return c[1]; }).length;
    var pct = Math.round(done / items.length * 100);
    el.innerHTML =
      '<div class="card"><h3>Readiness checklist</h3><p class="card-sub">' + done + " of " + items.length + " complete</p>" +
      '<div class="progress"><i style="width:' + pct + '%"></i></div>' +
      items.map(function (c) {
        return '<div class="check-row ' + (c[1] ? "done" : "") + '"><span class="check-ico">' + (c[1] ? "✓" : "○") + "</span>" +
          "<div><strong>" + c[0] + "</strong><span>" + c[2] + "</span></div></div>";
      }).join("") + "</div>" +
      '<div class="grid-2">' +
      '<div class="card"><h3>Brand uploads</h3><p class="card-sub">Logo, posters and promo material for the directory, app and on-site branding. Max 2 MB per file.</p>' +
      '<label class="upload-drop">Choose files<input type="file" id="brandFiles" multiple accept="image/*,.pdf" hidden></label>' +
      '<div id="fileList" class="file-list"></div>' +
      '<p class="fine">Files are stored in this browser\'s demo portal. On the live platform they upload to the event server automatically.</p></div>' +
      '<div class="card"><h3>Event documents</h3><p class="card-sub">Official downloads.</p><div class="doc-list">' +
      '<a class="doc-row" href="assets/brochure/trading-expo-india-2027-brochure.pdf" download><span class="file-ico">PDF</span><div><strong>Sponsorship brochure</strong><span>Booth options &amp; tiers</span></div></a>' +
      '<a class="doc-row" href="exhibit.html#floorplan"><span class="file-ico">MAP</span><div><strong>Concept floor plan</strong><span>Exhibition hall layout</span></div></a>' +
      '<div class="doc-row disabled"><span class="file-ico">PDF</span><div><strong>Exhibitor manual</strong><span>Coming soon — setup, freight &amp; guidelines</span></div></div>' +
      "</div></div></div>";

    function renderFiles() {
      var list = $("fileList"), fs = read(pkey("files", ref), []);
      list.innerHTML = "";
      if (!fs.length) { list.innerHTML = '<p class="muted">No files uploaded yet.</p>'; return; }
      fs.forEach(function (f2, i) {
        var div = document.createElement("div");
        div.className = "file-row";
        var preview = (f2.type || "").indexOf("image/") === 0
          ? '<img src="' + f2.data + '" alt="">' : '<span class="file-ico">PDF</span>';
        div.innerHTML = preview + "<div><strong>" + esc(f2.name) + "</strong><span>" + Math.round(f2.size / 1024) + " KB</span></div>" +
          '<button type="button" class="mini-btn danger">Remove</button>';
        div.querySelector("button").addEventListener("click", function () {
          var cur = read(pkey("files", ref), []);
          cur.splice(i, 1);
          write(pkey("files", ref), cur);
          renderFiles();
          toast("File removed.");
        });
        list.appendChild(div);
      });
    }
    renderFiles();
    $("brandFiles").addEventListener("change", function () {
      var fs = read(pkey("files", ref), []);
      var queue = Array.prototype.slice.call($("brandFiles").files);
      var doneN = 0;
      if (!queue.length) return;
      queue.forEach(function (file) {
        if (file.size > 2 * 1024 * 1024) { toast(file.name + " is over 2 MB — skipped."); check(); return; }
        var r = new FileReader();
        r.onload = function () { fs.push({ name: file.name, size: file.size, type: file.type, data: r.result }); check(); };
        r.onerror = check;
        r.readAsDataURL(file);
      });
      function check() {
        doneN++;
        if (doneN < queue.length) return;
        write(pkey("files", ref), fs) ? toast("Uploads saved.") : toast("Could not save — storage is full.");
        $("brandFiles").value = "";
        renderFiles();
      }
    });
  }

  function renderExOffers(s, el) {
    var ref = s.ref;
    function draw() {
      var offers = read(pkey("offers", ref), []);
      el.innerHTML =
        '<div class="card"><h3>Create an offer</h3><p class="card-sub">Visitors see your offers on your booth listing and in the event app.</p>' +
        '<div class="form-grid">' +
        '<label class="full">Offer title<input id="ofTitle" placeholder="e.g. 20% off Pro accounts for expo visitors"></label>' +
        '<label class="full">Details<textarea id="ofDetails" rows="3" placeholder="Terms, how to redeem, booth number…"></textarea></label>' +
        '<label>Valid until<input id="ofValid" type="date" value="2027-04-24"></label>' +
        "</div>" +
        '<div class="bnav"><button class="btn btn-primary" id="ofAdd" type="button">+ Publish Offer</button></div></div>' +
        '<div class="card"><h3>Your offers (' + offers.length + ")</h3>" +
        (offers.length ? '<div class="ann-list">' + offers.slice().reverse().map(function (o) {
          var idx = offers.indexOf(o);
          return '<div class="ann-row"><div><strong>🏷 ' + esc(o.title) + '</strong> <span class="ann-aud">valid until ' + esc(o.valid || "—") + "</span><p>" + esc(o.details) + '</p></div><button type="button" class="mini-btn danger" data-odel="' + idx + '">Delete</button></div>';
        }).join("") + "</div>" : '<div class="empty-state"><span class="big">🏷</span>No offers yet — give visitors a reason to stop by.</div>') + "</div>";
      $("ofAdd").addEventListener("click", function () {
        var t = $("ofTitle").value.trim();
        if (!t) { toast("Give your offer a title."); return; }
        var cur = read(pkey("offers", ref), []);
        cur.push({ id: uid("o"), title: t, details: $("ofDetails").value.trim(), valid: $("ofValid").value, at: new Date().toISOString() });
        write(pkey("offers", ref), cur) ? toast("Offer published.") : toast("Could not save — storage is full.");
        draw();
      });
      el.querySelectorAll("[data-odel]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var cur = read(pkey("offers", ref), []);
          cur.splice(parseInt(btn.getAttribute("data-odel"), 10), 1);
          write(pkey("offers", ref), cur);
          toast("Offer deleted.");
          draw();
        });
      });
    }
    draw();
  }

  /* ================= TICKET HOLDER ================= */
  var AGENDA_PICKS = [
    ["Day 1 · 10:00", "Opening keynote — the state of Indian trading"],
    ["Day 1 · 14:30", "Broker CXO panel: the future of retail trading"],
    ["Day 1 · 16:00", "Live trading challenge — heats"],
    ["Day 2 · 11:00", "Crypto & Web3 summit"],
    ["Day 2 · 15:00", "Prop trading masterclass"],
    ["Day 2 · 18:30", "Awards night & lucky draw"]
  ];

  function renderTicketDashboard(s, el) {
    var b = s.booking, f = b.fields || {};
    var anns = read("txi_announcements", []).filter(function (a) { return a.audience === "all" || a.audience === "ticket"; });
    el.innerHTML =
      '<div class="kpi-grid">' +
      kpi("Your pass", esc(b.option ? b.option.name : "—"), "Ref " + esc(b.ref)) +
      kpi("Days to event", daysToEvent(), "23–24 April 2027", "navy") +
      kpi("Ticket status", "Reserved ✓", "you're on the list", "amber") +
      kpi("Updates", anns.length, "announcements for you") +
      "</div>" +
      '<div class="grid-2">' +
      '<div class="card"><h3>Your ticket</h3><p class="card-sub">Download or print it anytime.</p>' +
      ticketCardHTML(b, true) +
      '<div class="bnav"><button class="btn btn-primary" id="dashPrint" type="button">Download / Print Ticket</button>' +
      '<a class="btn btn-ghost" href="agenda.html">View Full Agenda</a></div></div>' +
      '<div class="card"><h3>Agenda highlights</h3><p class="card-sub">Don\'t miss these sessions.</p><div class="feed">' +
      AGENDA_PICKS.map(function (a) {
        return '<div class="feed-item"><span class="feed-dot"></span><div><strong>' + esc(a[1]) + "</strong><span>" + esc(a[0]) + "</span></div></div>";
      }).join("") + "</div></div>" +
      "</div>" +
      '<div class="card"><h3>Latest promotions</h3><p class="card-sub">Offers and updates from the organisers.</p>' + promoList("ticket") + "</div>";
    $("dashPrint").addEventListener("click", function () { printTicket(b); });
  }

  function renderMyTickets(s, el) {
    var b = s.booking, f = b.fields || {};
    var others = allBookings().filter(function (x) {
      return x.ref !== b.ref && x.fields && f.email &&
        String(x.fields.email || "").toLowerCase() === String(f.email).toLowerCase();
    });
    el.innerHTML =
      ticketCardHTML(b) +
      '<div class="bnav"><button class="btn btn-primary" id="printTicketBtn" type="button">Download / Print Ticket</button>' +
      '<a class="btn btn-ghost" href="agenda.html">View Agenda</a></div>' +
      '<p class="fine">Your ticket was emailed to <strong>' + esc(f.email || "your email") + '</strong> at booking time (demo preview — connect the PHP backend for real email delivery). You can download it here anytime.</p>' +
      (others.length ? '<h3 class="panel-title">Other bookings on this email</h3>' + others.map(function (o) { return ticketCardHTML(o, true); }).join("") : "") +
      '<div class="callout"><strong>Lucky draw — Day 2.</strong><span>Your ticket is automatically entered into the Trading Expo lucky draw on 24 April. Be in the hall to win.</span></div>';
    $("printTicketBtn").addEventListener("click", function () { printTicket(b); });
  }

  function renderEventInfo(s, el) {
    el.innerHTML =
      '<div class="grid-3">' +
      '<div class="info-card"><h3>📅 Dates</h3><p>23–24 April 2027, two full days of expo floor, conferences and networking.</p></div>' +
      '<div class="info-card"><h3>📍 Venue</h3><p>India — city and venue to be announced. Watch Promotions for the reveal.</p></div>' +
      '<div class="info-card"><h3>🏢 Organiser</h3><p>ProFX Media FZ-LLC. <a href="contact.html">Contact the team →</a></p></div>' +
      "</div>" +
      '<h3 class="panel-title">Travel &amp; stay</h3>' +
      '<div class="grid-3">' +
      '<div class="info-card"><h3>✈️ Getting there</h3><p>Fly into the host city — international and domestic connections. Metro and cab details will be published with the venue.</p></div>' +
      '<div class="info-card"><h3>🏨 Where to stay</h3><p>Partner hotel rates near the venue will be announced. Book early — April is peak season.</p></div>' +
      '<div class="info-card"><h3>🎫 At the door</h3><p>Show your booking reference at registration to collect your badge. Gates open 9:00 AM both days.</p></div>' +
      "</div>" +
      '<h3 class="panel-title">Agenda highlights</h3>' +
      '<div class="card"><div class="feed">' +
      AGENDA_PICKS.map(function (a) {
        return '<div class="feed-item"><span class="feed-dot"></span><div><strong>' + esc(a[1]) + "</strong><span>" + esc(a[0]) + "</span></div></div>";
      }).join("") + '</div><div class="bnav"><a class="btn btn-ghost" href="agenda.html">Full Agenda →</a></div></div>';
  }

  function renderAnnsView(s, el, aud) {
    el.innerHTML = '<div class="card"><h3>Promotions &amp; updates</h3><p class="card-sub">Everything the organisers publish for ' +
      (aud === "ticket" ? "ticket holders" : "exhibitors") + ".</p>" + promoList(aud) + "</div>";
    renderNotifDot();
  }

  /* ---------- session restore ---------- */
  try {
    var sess = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (sess && (sess.role === "admin" || findBookingByRef(sess.ref))) {
      if (sess.role === "admin" || sess.role === "ticket" || sess.role === "exhibitor") {
        if (sess.role !== "admin") {
          var rb = findBookingByRef(sess.ref);
          if (rb) sess.booking = rb; else sess = null;
        }
        if (sess) openDash(sess);
      }
    }
  } catch (e) {}
})();
