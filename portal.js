/* Trading Expo India 2027 — Exhibitor / Ticket / Admin portal
   Preview build: data is stored in this browser (localStorage).
   Production build: /api/*.php + /db/schema.sql (MySQL) take over auth,
   bookings and automatic ticket emails on the event's own hosting. */
(function () {
  "use strict";
  var loginWrap = document.getElementById("portalLogin");
  var dashWrap = document.getElementById("portalDash");
  if (!loginWrap || !dashWrap) return;

  var SESSION_KEY = "txi_portal_session";
  var ADMIN_USER = "admin";
  var ADMIN_PASS = "expo2027"; /* preview demo only — production uses the PHP backend */

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function money(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
  function dstr(iso) {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch (e) { return ""; }
  }

  /* ---------- storage ---------- */
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

  /* ---------- demo seed ---------- */
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
          body: "Trader Pass ₹249, Pro Trader ₹999, VIP ₹2,499 — prices rise soon. Share your referral link with your community." },
        { id: "a2", title: "Exhibitor manual & booth allocation", audience: "exhibitor", at: now,
          body: "The exhibitor manual with setup timings, freight and branding guidelines will be published here. Complete your company profile and team details so we can prepare your badges." },
        { id: "a3", title: "Lucky draw on Day 2", audience: "ticket", at: now,
          body: "Every ticket is automatically entered into the Trading Expo lucky draw on 24 April. Be in the hall to win." }
      ]);
    }
  }
  seed();

  function announcements(aud) {
    return read("txi_announcements", []).filter(function (a) {
      return a.audience === "all" || a.audience === aud;
    });
  }

  /* ---------- toast ---------- */
  function toast(msg) {
    var t = $("portalToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- login ---------- */
  var roleTabs = loginWrap.querySelectorAll(".role-tab");
  roleTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      roleTabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var admin = tab.getAttribute("data-role") === "admin";
      $("attendeeForm").hidden = admin;
      $("adminForm").hidden = !admin;
      $("portalError").hidden = true;
    });
  });

  function loginError(msg) {
    var e = $("portalError");
    e.textContent = msg;
    e.hidden = false;
  }

  $("attendeeForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var b = findBooking($("portalRef").value, $("portalPass").value);
    if (!b) { loginError("No booking matches that reference and password. Check your booking confirmation email."); return; }
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

  /* ---------- dashboard shell ---------- */
  var TABS = {
    ticket: [["overview", "Overview"], ["ticket", "My Ticket"], ["promos", "Promotions"], ["event", "Event Info"]],
    exhibitor: [["overview", "Overview"], ["company", "Company Profile"], ["booth", "Booth Details"], ["team", "Team & Badges"], ["brand", "Brand Uploads"], ["checklist", "Checklist"], ["promos", "Promotions"], ["docs", "Documents"]],
    admin: [["overview", "Overview"], ["bookings", "Bookings"], ["promos", "Announcements"], ["settings", "Settings"]]
  };

  function openDash(session) {
    loginWrap.hidden = true;
    dashWrap.hidden = false;
    var tabs = TABS[session.role] || TABS.ticket;
    var tabsEl = $("portalTabs"), panelsEl = $("portalPanels");
    tabsEl.innerHTML = "";
    panelsEl.innerHTML = "";
    tabs.forEach(function (t, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "portal-tab" + (i === 0 ? " active" : "");
      b.textContent = t[1];
      b.setAttribute("data-tab", t[0]);
      b.addEventListener("click", function () {
        tabsEl.querySelectorAll(".portal-tab").forEach(function (x) { x.classList.remove("active"); });
        panelsEl.querySelectorAll(".portal-panel").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        panelsEl.querySelector("#pp-" + t[0]).classList.add("active");
      });
      tabsEl.appendChild(b);
      var p = document.createElement("div");
      p.className = "portal-panel" + (i === 0 ? " active" : "");
      p.id = "pp-" + t[0];
      panelsEl.appendChild(p);
    });

    if (session.role === "admin") renderAdmin(session);
    else {
      var b = findBookingByRef(session.ref);
      if (!b) { location.reload(); return; }
      session.booking = b;
      if (session.role === "exhibitor") renderExhibitor(session);
      else renderTicket(session);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- shared panel builders ---------- */
  function panel(id) { return $("pp-" + id); }

  function promoList(aud) {
    var list = announcements(aud);
    if (!list.length) return '<p class="muted">No announcements yet — check back soon.</p>';
    return list.map(function (a) {
      return '<article class="promo-card"><span class="promo-date">' + esc(dstr(a.at)) + '</span>' +
        "<h4>" + esc(a.title) + "</h4><p>" + esc(a.body) + "</p></article>";
    }).join("");
  }

  function ticketCardHTML(b) {
    var f = b.fields || {};
    return '<div class="pticket"><div class="pticket-top"><div><strong>TRADING EXPO INDIA 2027</strong>' +
      "<span>23–24 April 2027 · India</span></div></div>" +
      '<div class="pticket-grid">' +
      "<div><span>Holder</span><strong>" + esc(f.name || f.company || "—") + "</strong></div>" +
      "<div><span>Pass / Booth</span><strong>" + esc(b.option ? b.option.name : "—") + "</strong></div>" +
      "<div><span>Reference</span><strong class='ref'>" + esc(b.ref) + "</strong></div>" +
      "<div><span>Status</span><strong>Reserved</strong></div></div>" +
      '<p class="pticket-note">Present this reference at registration. A payment link will be emailed to ' + esc(f.email || "you") + ".</p></div>";
  }

  function printTicket(b) {
    var f = b.fields || {};
    var w = window.open("", "_blank");
    w.document.write("<html><head><title>Ticket " + esc(b.ref) + "</title><style>" +
      "body{font-family:Arial,sans-serif;background:#f4f4f4;display:flex;justify-content:center;padding:40px}" +
      ".t{background:#fff;border:2px solid #0B1F3B;border-radius:16px;max-width:520px;width:100%;overflow:hidden}" +
      ".h{background:#0B1F3B;color:#fff;padding:24px}" +
      ".b{padding:24px}.r{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #eee}" +
      ".ref{font-size:22px;letter-spacing:2px;color:#00A86B}" +
      "</style></head><body><div class='t'><div class='h'><strong>TRADING EXPO INDIA 2027</strong><br>23–24 April 2027 · India</div>" +
      "<div class='b'><div class='r'><span>Holder</span><strong>" + esc(f.name || f.company || "") + "</strong></div>" +
      "<div class='r'><span>Pass / Booth</span><strong>" + esc(b.option ? b.option.name : "") + "</strong></div>" +
      "<div class='r'><span>Reference</span><strong class='ref'>" + esc(b.ref) + "</strong></div>" +
      "<div class='r'><span>Status</span><strong>Reserved</strong></div></div></div>" +
      "<script>window.onload=function(){window.print()}<\/script></body></html>");
    w.document.close();
  }

  /* ---------- ticket holder ---------- */
  function renderTicket(s) {
    var b = s.booking, f = b.fields || {};
    $("pdRole").textContent = "Ticket holder portal";
    $("pdTitle").textContent = "Hi " + (f.name || "trader") + " — you're going!";
    $("pdSub").textContent = b.ref + " · " + (b.option ? b.option.name : "");

    panel("overview").innerHTML =
      '<div class="dash-cards">' +
      '<div class="dash-card"><span>Your pass</span><strong>' + esc(b.option ? b.option.name : "—") + "</strong></div>" +
      '<div class="dash-card"><span>Reference</span><strong class="mono">' + esc(b.ref) + "</strong></div>" +
      '<div class="dash-card"><span>Event</span><strong>23–24 April 2027</strong></div></div>' +
      '<div class="callout"><strong>What\'s next?</strong><span>Download your ticket below, and watch this space — event updates, offers and the lucky draw appear under Promotions.</span></div>';

    panel("ticket").innerHTML = ticketCardHTML(b) +
      '<div class="bnav"><button class="btn btn-primary" id="printTicketBtn" type="button">Download / Print Ticket</button>' +
      '<a class="btn btn-ghost" href="agenda.html">View Agenda</a></div>' +
      '<p class="fine">Your ticket was emailed to <strong>' + esc(f.email || "your email") + '</strong>. You can download it here anytime.</p>';
    $("printTicketBtn").addEventListener("click", function () { printTicket(b); });

    panel("promos").innerHTML = '<h3 class="panel-title">Promotions &amp; updates</h3>' + promoList("ticket");

    panel("event").innerHTML =
      '<div class="grid-3">' +
      '<div class="info-card"><h3>Dates</h3><p>23–24 April 2027, India. Venue announcement coming soon.</p></div>' +
      '<div class="info-card"><h3>Agenda</h3><p>Keynotes, panels, workshops and the live trading challenge. <a href="agenda.html">See the agenda →</a></p></div>' +
      '<div class="info-card"><h3>Support</h3><p>Questions about your ticket? <a href="contact.html">Contact us →</a></p></div></div>';
  }

  /* ---------- exhibitor ---------- */
  function renderExhibitor(s) {
    var b = s.booking, f = b.fields || {}, ref = b.ref;
    $("pdRole").textContent = "Exhibitor portal";
    $("pdTitle").textContent = esc(f.company || "Your booth");
    $("pdSub").textContent = b.ref + " · " + (b.option ? b.option.name : "");

    var info = read(pkey("info", ref), {});
    var booth = read(pkey("booth", ref), {});
    var team = read(pkey("team", ref), []);
    var files = read(pkey("files", ref), []);

    /* Overview */
    panel("overview").innerHTML =
      '<div class="dash-cards">' +
      '<div class="dash-card"><span>Booth</span><strong>' + esc(b.option ? b.option.name : "—") + "</strong></div>" +
      '<div class="dash-card"><span>Reference</span><strong class="mono">' + esc(b.ref) + "</strong></div>" +
      '<div class="dash-card"><span>Team badges</span><strong>' + team.length + " registered</strong></div>" +
      '<div class="dash-card"><span>Brand files</span><strong>' + files.length + " uploaded</strong></div></div>" +
      '<div class="callout"><strong>Exhibitor checklist</strong><span>Complete your company profile, booth requirements, team badges and logo upload before the event. Track it all under the Checklist tab.</span></div>' +
      '<h3 class="panel-title">Latest announcements</h3>' + promoList("exhibitor");

    /* Company profile */
    panel("company").innerHTML =
      '<h3 class="panel-title">Company profile</h3><p class="muted">This appears in the exhibitor directory and on your fascia branding.</p>' +
      '<div class="form-grid">' +
      '<label>Company name<input id="pcCompany" value="' + esc(info.pcCompany || f.company || "") + '"></label>' +
      '<label>Contact person<input id="pcContact" value="' + esc(info.pcContact || f.name || "") + '"></label>' +
      '<label>Work email<input id="pcEmail" type="email" value="' + esc(info.pcEmail || f.email || "") + '"></label>' +
      '<label>Phone<input id="pcPhone" value="' + esc(info.pcPhone || f.phone || "") + '"></label>' +
      '<label>Website<input id="pcWebsite" value="' + esc(info.pcWebsite || f.website || "") + '"></label>' +
      '<label>Category<select id="pcCategory">' +
      ["Broker", "Fintech", "Trading Technology", "Prop Firm", "Media / Affiliate", "Education", "Other"].map(function (c) {
        return '<option' + ((info.pcCategory || f.category) === c ? " selected" : "") + ">" + c + "</option>";
      }).join("") + "</select></label>" +
      '<label class="full">Company description (50 words for the directory)<textarea id="pcAbout" rows="3">' + esc(info.pcAbout || "") + "</textarea></label>" +
      "</div>" +
      '<div class="bnav"><button class="btn btn-primary" id="saveInfoBtn" type="button">Save Company Profile</button></div>';
    $("saveInfoBtn").addEventListener("click", function () {
      var d = {};
      ["pcCompany", "pcContact", "pcEmail", "pcPhone", "pcWebsite", "pcCategory", "pcAbout"].forEach(function (id) {
        d[id] = $(id).value;
      });
      if (!d.pcCompany.trim()) { toast("Please enter your company name."); return; }
      write(pkey("info", ref), d) ? toast("Company profile saved.") : toast("Could not save — storage is full.");
    });

    /* Booth details */
    panel("booth").innerHTML =
      '<h3 class="panel-title">Booth details &amp; requirements</h3>' +
      '<div class="form-grid">' +
      '<label>Reserved booth<input value="' + esc(b.option ? b.option.name : "") + '" disabled></label>' +
      '<label>Location preference<select id="pbLoc">' +
      ["No preference", "Near entrance", "Near main stage", "Near networking lounge", "Near food court"].map(function (c) {
        return '<option' + (booth.pbLoc === c ? " selected" : "") + ">" + c + "</option>";
      }).join("") + "</select></label>" +
      '<label>Power requirement<select id="pbPower">' +
      ["Standard (1 socket)", "Extra power", "Three-phase"].map(function (c) {
        return '<option' + (booth.pbPower === c ? " selected" : "") + ">" + c + "</option>";
      }).join("") + "</select></label>" +
      '<label>Internet<select id="pbNet">' +
      ["Shared Wi-Fi is fine", "Dedicated wired line", "No internet needed"].map(function (c) {
        return '<option' + (booth.pbNet === c ? " selected" : "") + ">" + c + "</option>";
      }).join("") + "</select></label>" +
      '<label class="check"><input type="checkbox" id="pbAV"' + (booth.pbAV ? " checked" : "") + '> AV / LED screen needed</label>' +
      '<label class="check"><input type="checkbox" id="pbStore"' + (booth.pbStore ? " checked" : "") + '> Lockable storage needed</label>' +
      '<label class="full">Extra furniture / special requirements<textarea id="pbNotes" rows="3">' + esc(booth.pbNotes || "") + "</textarea></label>" +
      "</div>" +
      '<div class="bnav"><button class="btn btn-primary" id="saveBoothBtn" type="button">Save Booth Requirements</button></div>';
    $("saveBoothBtn").addEventListener("click", function () {
      var d = { pbLoc: $("pbLoc").value, pbPower: $("pbPower").value, pbNet: $("pbNet").value, pbAV: $("pbAV").checked, pbStore: $("pbStore").checked, pbNotes: $("pbNotes").value };
      write(pkey("booth", ref), d) ? toast("Booth requirements saved.") : toast("Could not save — storage is full.");
    });

    /* Team & badges */
    panel("team").innerHTML =
      '<h3 class="panel-title">Team &amp; badges</h3><p class="muted">Add everyone staffing your booth — badges are printed from this list.</p>' +
      '<div id="teamList"></div>' +
      '<div class="bnav"><button class="btn btn-ghost" id="addTeamBtn" type="button">+ Add team member</button>' +
      '<button class="btn btn-primary" id="saveTeamBtn" type="button">Save Team</button></div>';
    function teamRow(m) {
      m = m || {};
      var div = document.createElement("div");
      div.className = "team-row";
      div.innerHTML =
        '<input placeholder="Full name" value="' + esc(m.name) + '" data-f="name">' +
        '<input placeholder="Role / title" value="' + esc(m.role) + '" data-f="role">' +
        '<select data-f="meal"><option value="">Meal…</option>' +
        '<option' + (m.meal === "Veg" ? " selected" : "") + ">Veg</option>" +
        '<option' + (m.meal === "Non-veg" ? " selected" : "") + ">Non-veg</option></select>" +
        '<select data-f="size"><option value="">T-shirt…</option>' +
        ["S", "M", "L", "XL", "XXL"].map(function (s2) {
          return "<option" + (m.size === s2 ? " selected" : "") + ">" + s2 + "</option>";
        }).join("") + "</select>" +
        '<button type="button" class="team-del" aria-label="Remove">×</button>';
      div.querySelector(".team-del").addEventListener("click", function () { div.remove(); });
      return div;
    }
    var teamList = $("teamList");
    team.forEach(function (m) { teamList.appendChild(teamRow(m)); });
    $("addTeamBtn").addEventListener("click", function () { teamList.appendChild(teamRow()); });
    $("saveTeamBtn").addEventListener("click", function () {
      var rows = [];
      teamList.querySelectorAll(".team-row").forEach(function (r) {
        var m = {};
        r.querySelectorAll("[data-f]").forEach(function (inp) { m[inp.getAttribute("data-f")] = inp.value; });
        if (m.name && m.name.trim()) rows.push(m);
      });
      write(pkey("team", ref), rows) ? toast("Team saved (" + rows.length + " badges).") : toast("Could not save — storage is full.");
    });

    /* Brand uploads */
    panel("brand").innerHTML =
      '<h3 class="panel-title">Brand uploads</h3><p class="muted">Upload your logo, posters and promotional material for the directory, app and on-site branding. Max 2 MB per file.</p>' +
      '<label class="upload-drop">Choose files<input type="file" id="brandFiles" multiple accept="image/*,.pdf" hidden></label>' +
      '<div id="fileList" class="file-list"></div>' +
      '<p class="fine">Files are stored in this browser\'s preview portal. On the live platform they upload to the event server automatically.</p>';
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
          '<button type="button">Remove</button>';
        div.querySelector("button").addEventListener("click", function () {
          var cur = read(pkey("files", ref), []);
          cur.splice(i, 1);
          write(pkey("files", ref), cur);
          renderFiles();
        });
        list.appendChild(div);
      });
    }
    renderFiles();
    $("brandFiles").addEventListener("change", function () {
      var fs = read(pkey("files", ref), []);
      var queue = Array.prototype.slice.call($("brandFiles").files);
      var done = 0;
      if (!queue.length) return;
      queue.forEach(function (file) {
        if (file.size > 2 * 1024 * 1024) { toast(file.name + " is over 2 MB — skipped."); check(); return; }
        var r = new FileReader();
        r.onload = function () { fs.push({ name: file.name, size: file.size, type: file.type, data: r.result }); check(); };
        r.onerror = check;
        r.readAsDataURL(file);
      });
      function check() {
        done++;
        if (done < queue.length) return;
        write(pkey("files", ref), fs) ? toast("Uploads saved.") : toast("Could not save — storage is full.");
        $("brandFiles").value = "";
        renderFiles();
      }
    });

    /* Checklist */
    var info2 = read(pkey("info", ref), {}), booth2 = read(pkey("booth", ref), {}),
        team2 = read(pkey("team", ref), []), files2 = read(pkey("files", ref), []);
    var checks = [
      ["Reservation confirmed", true, "Your booth is reserved."],
      ["Company profile completed", !!(info2.pcCompany && info2.pcCompany.trim()), "Add it under Company Profile."],
      ["Booth requirements submitted", !!booth2.pbLoc, "Tell us about power, internet and AV."],
      ["Team & badges submitted", team2.length > 0, "Add your booth staff."],
      ["Logo / brand files uploaded", files2.length > 0, "Upload your logo and posters."],
      ["Payment completed", false, "Our team will send your payment link."]
    ];
    var doneCount = checks.filter(function (c) { return c[1]; }).length;
    panel("checklist").innerHTML =
      '<h3 class="panel-title">Exhibitor checklist</h3>' +
      '<div class="progress"><i style="width:' + Math.round(doneCount / checks.length * 100) + '%"></i></div>' +
      '<p class="muted">' + doneCount + " of " + checks.length + " complete</p>" +
      checks.map(function (c) {
        return '<div class="check-row ' + (c[1] ? "done" : "") + '"><span class="check-ico">' + (c[1] ? "✓" : "○") + "</span>" +
          "<div><strong>" + c[0] + "</strong><span>" + c[2] + "</span></div></div>";
      }).join("");

    /* Promotions */
    panel("promos").innerHTML = '<h3 class="panel-title">Promotions &amp; updates</h3>' + promoList("exhibitor");

    /* Documents */
    panel("docs").innerHTML =
      '<h3 class="panel-title">Documents</h3>' +
      '<div class="doc-list">' +
      '<a class="doc-row" href="assets/brochure/trading-expo-india-2027-brochure.pdf" download><span class="file-ico">PDF</span><div><strong>Sponsorship brochure</strong><span>Booth options &amp; tiers</span></div></a>' +
      '<a class="doc-row" href="exhibit.html#floorplan"><span class="file-ico">MAP</span><div><strong>Concept floor plan</strong><span>Exhibition hall layout</span></div></a>' +
      '<div class="doc-row disabled"><span class="file-ico">PDF</span><div><strong>Exhibitor manual</strong><span>Coming soon — setup, freight &amp; guidelines</span></div></div>' +
      "</div>";
  }

  /* ---------- admin ---------- */
  function renderAdmin(s) {
    $("pdRole").textContent = "Admin portal";
    $("pdTitle").textContent = "Event control room";
    $("pdSub").textContent = "Bookings, exhibitors and announcements";

    var bookings = allBookings();
    var revenue = bookings.reduce(function (sum, b) {
      var p = b.option && b.option.price ? b.option.price : 0;
      return sum + p * (b.qty || 1);
    }, 0);
    var tickets = bookings.filter(function (b) { return b._kind === "ticket"; }).length;
    var exhibs = bookings.filter(function (b) { return b._kind === "exhibitor"; }).length;

    panel("overview").innerHTML =
      '<div class="dash-cards">' +
      '<div class="dash-card"><span>Total bookings</span><strong>' + bookings.length + "</strong></div>" +
      '<div class="dash-card"><span>Ticket bookings</span><strong>' + tickets + "</strong></div>" +
      '<div class="dash-card"><span>Exhibitor reservations</span><strong>' + exhibs + "</strong></div>" +
      '<div class="dash-card"><span>Potential ticket revenue</span><strong>' + money(revenue) + "</strong></div></div>" +
      '<div class="callout"><strong>Preview mode.</strong><span>This admin panel reads bookings stored in this browser. On the live platform it connects to the MySQL database via the PHP backend in <code>/api</code>.</span></div>';

    panel("bookings").innerHTML =
      '<h3 class="panel-title">All bookings</h3>' +
      (bookings.length ? '<div class="table-wrap"><table class="data-table"><thead><tr>' +
        "<th>Reference</th><th>Type</th><th>Name / Company</th><th>Email</th><th>Selection</th><th>Qty</th><th>Total</th><th>Date</th>" +
        "</tr></thead><tbody>" +
        bookings.map(function (b) {
          var f = b.fields || {};
          var price = b.option && b.option.price ? b.option.price : 0;
          return "<tr><td class='mono'>" + esc(b.ref) + "</td><td>" + (b._kind === "exhibitor" ? "Exhibitor" : "Ticket") + "</td>" +
            "<td>" + esc(f.company || f.name || "—") + "</td><td>" + esc(f.email || "—") + "</td>" +
            "<td>" + esc(b.option ? b.option.name : "—") + "</td><td>" + (b.qty || 1) + "</td>" +
            "<td>" + (price ? money(price * (b.qty || 1)) : "On request") + "</td><td>" + esc(dstr(b.at)) + "</td></tr>";
        }).join("") + "</tbody></table></div>"
        : '<p class="muted">No bookings yet.</p>');

    function renderAnns() {
      var list = read("txi_announcements", []);
      panel("promos").innerHTML =
        '<h3 class="panel-title">Announcements &amp; promotions</h3>' +
        '<p class="muted">Published here and inside the ticket-holder and exhibitor portals instantly.</p>' +
        '<div class="form-grid"><label class="full">Title<input id="anTitle" placeholder="Announcement title"></label>' +
        '<label>Show to<select id="anAud"><option value="all">Everyone</option><option value="ticket">Ticket holders</option><option value="exhibitor">Exhibitors</option></select></label>' +
        '<label class="full">Message<textarea id="anBody" rows="3" placeholder="Write the announcement…"></textarea></label></div>' +
        '<div class="bnav"><button class="btn btn-primary" id="anAdd" type="button">Publish Announcement</button></div>' +
        '<div class="ann-list">' + (list.length ? list.map(function (a) {
          return '<div class="ann-row"><div><strong>' + esc(a.title) + '</strong><span class="ann-aud">' + esc(a.audience) + " · " + esc(dstr(a.at)) + "</span><p>" + esc(a.body) + '</p></div><button type="button" data-del="' + a.id + '">Delete</button></div>';
        }).join("") : '<p class="muted">No announcements yet.</p>') + "</div>";
      $("anAdd").addEventListener("click", function () {
        var t = $("anTitle").value.trim(), bd = $("anBody").value.trim();
        if (!t || !bd) { toast("Add a title and a message first."); return; }
        var cur = read("txi_announcements", []);
        cur.unshift({ id: "a" + Date.now(), title: t, body: bd, audience: $("anAud").value, at: new Date().toISOString() });
        write("txi_announcements", cur) ? toast("Announcement published.") : toast("Could not save.");
        renderAnns();
      });
      panel("promos").querySelectorAll("[data-del]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var cur = read("txi_announcements", []).filter(function (a) { return a.id !== btn.getAttribute("data-del"); });
          write("txi_announcements", cur);
          renderAnns();
          toast("Announcement deleted.");
        });
      });
    }
    renderAnns();

    panel("settings").innerHTML =
      '<h3 class="panel-title">Settings &amp; production backend</h3>' +
      '<div class="info-card"><h3>Demo admin access</h3><p>Username <code>admin</code> · password <code>expo2027</code>. This preview authenticates in the browser only.</p></div>' +
      '<div class="info-card"><h3>Going live — PHP + MySQL</h3><p>The repository includes a production backend ready for cPanel hosting: <code>/db/schema.sql</code> (bookings, users, announcements tables), <code>/api/config.php</code> (database credentials), <code>/api/book.php</code> (creates bookings, hashes portal passwords and <strong>sends the ticket email automatically</strong>). Import the schema, set the credentials, and bookings start emailing tickets without any further code changes.</p></div>';
  }

  /* ---------- session restore ---------- */
  try {
    var s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (s && (s.role === "admin" || findBookingByRef(s.ref))) openDash(s);
  } catch (e) {}
  function findBookingByRef(ref) {
    var list = allBookings();
    for (var i = 0; i < list.length; i++) if (list[i].ref === ref) return list[i];
    return null;
  }
})();
