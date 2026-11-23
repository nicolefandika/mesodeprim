/* ==========================================================
   MESO — shared script
   1) Nav + reveal-on-scroll   2) Hero video autoplay guard
   3) Meso Concierge chatbot   4) Find Your Dose (landing page)
   ========================================================== */

/* ---------- 1. Nav + reveal ---------- */
(() => {
  const nav = document.querySelector(".nav");
  if (nav && !nav.classList.contains("light")) {
    const onScroll = () => nav.classList.toggle("solid", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

/* ---------- 2. Hero video: make sure it autoplays + loops ---------- */
(() => {
  const v = document.querySelector(".hero video");
  if (!v) return;
  v.muted = true;            // browsers only autoplay muted video
  v.loop = true;
  const tryPlay = () => v.play().catch(() => {});
  tryPlay();
  v.addEventListener("ended", () => { v.currentTime = 0; tryPlay(); }); // belt-and-braces loop
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tryPlay(); });
  // If a browser blocks autoplay, the first tap/scroll anywhere starts it.
  ["pointerdown", "touchstart", "scroll", "keydown"].forEach((ev) =>
    window.addEventListener(ev, tryPlay, { once: true, passive: true }));
})();

/* ---------- 3. Meso Concierge chatbot ----------
   A self-contained rule-based assistant, so it works on GitHub Pages
   with no API key. To use your Lab 3 bot instead, see the comment
   near the bottom of index.html / story.html.                      */
(() => {
  const KB = [
    { k: [" hi ", "hello", " hey ", "hiya", "good morning", "good evening"],
      a: "Hi! I'm the Meso Concierge. Ask me about our products, the pump, which serum fits your marks, or what “Meso” means." },
    { k: ["name", "meaning", "mean", "shona", "meso mean", "pronounce", "say it"],
      a: "Meso (say it “meh-so”) is the Shona word for <em>face</em>. A brand named for the thing it cares for." },
    { k: ["pump", "dose", "dosage", "how much", "amount", "pea", "metered", "press", "hold", "too much", "too little"],
      a: "Every Meso product has a press-and-hold pump that dispenses the recommended amount, then stops on its own. No “pea-sized” guessing — one pump, one face." },
    { k: [" red ", "pink", "redness", "erythema", " pie "],
      a: "Red or pink marks left behind after a breakout are what <b>Serum No. 1 · Red Marks</b> is being designed for. Try <a href='#dose'>Find Your Dose</a> to see where it fits in your ritual." },
    { k: ["brown", "dark", "dark spot", "dark marks", "hyperpigmentation", "pih", "uneven", "discoloration"],
      a: "Brown or dark marks are the focus of <b>Serum No. 2 · Brown Marks</b>. We split serums by mark color — like matching a foundation shade, but for marks." },
    { k: ["both", "which serum", "what serum", "serum", "shade"],
      a: "Pick by the color of your marks: <b>Red Marks</b> for pink/red, <b>Brown Marks</b> for brown/dark. Got both? Many people will use one in the morning and one at night." },
    { k: ["cleanser", "wash", "face wash", "cleanse"],
      a: "<b>The Cleanser</b> is a gentle daily wash built sensitive-first, so it plays well with combination skin too. One pump, morning and night." },
    { k: ["sensitive", "irritat", "gentle", "react", "sting"],
      a: "Sensitive and combination skin are our starting point. A measured dose helps here — over-applying is one of the easiest ways to irritate skin. Always patch-test something new." },
    { k: ["combination", "combo", "oily", "dry", "normal", "skin type"],
      a: "Meso is designed for all skin types, with sensitive and combination skin first. The <a href='#dose'>Find Your Dose</a> quiz tailors your ritual to your type." },
    { k: ["product", "products", " line ", "sell", "what do you", "range", "offer"],
      a: "The first edit is three pieces: <b>The Cleanser</b>, <b>Serum No. 1 · Red Marks</b>, and <b>Serum No. 2 · Brown Marks</b>." },
    { k: ["scan", "scanner", " ai ", "camera", "analy", " app "],
      a: "Meso Scan is our AI layer in development: it looks for redness, acne marks and dryness — like a med-spa skin analyzer — then recommends the right Meso products. <a href='story.html#scan'>Read more</a>." },
    { k: ["ingredient", "formula", "niacinamide", "vitamin c", "acid", "retinol", "contain"],
      a: "Formulation with a cosmetic chemist is our next step, so the final ingredient lists aren't set yet. We'll publish full INCI lists before launch." },
    { k: ["price", "cost", "how much is", "$", "expensive", "cheap"],
      a: "Pricing isn't set yet — we're still in development. Join us at launch and you'll be first to know." },
    { k: ["launch", "when", "available", "buy", "release", "ship", "waitlist", "purchase"],
      a: "Meso is in the concept and packaging-design stage now. Formulation is next, then launch of the first edit. <a href='story.html#roadmap'>See the roadmap</a>." },
    { k: ["order", "routine", "steps", "ritual", "first", "layer", "apply", "how to use", "how do i use"],
      a: "Simple order: cleanse (1 pump) → serum (1 pump) → your moisturizer → SPF in the morning." },
    { k: ["spf", "sunscreen", " sun "],
      a: "Meso doesn't make SPF (yet), but daily sunscreen is the best friend of any dark-mark routine. Finish every morning with it." },
    { k: ["founder", "who made", "who started", "nicole", "owner", "ceo"],
      a: "Meso was founded by Nicole Fandika. <a href='story.html'>Read the story</a>." },
    { k: ["thank", "thanks", " ty ", "appreciate"],
      a: "Anytime. One pump, one face. ✦" },
    { k: ["bye", "goodbye", "see you"],
      a: "Take care of that face. ✦" },
  ];
  const CHIPS = ["What does Meso mean?", "How does the pump work?", "Which serum is for me?", "When do you launch?"];
  const FALLBACK = "Good question — I'm still learning. Try asking about our products, the pump, red vs brown marks, or Meso Scan.";

  const fab = document.createElement("button");
  fab.className = "chat-fab"; fab.type = "button"; fab.setAttribute("aria-label", "Open Meso chat");
  fab.innerHTML = '<span class="pulse"></span>Ask Meso';

  const panel = document.createElement("div");
  panel.className = "chat-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Meso Concierge chat");
  panel.innerHTML = `
    <div class="chat-head">
      <div class="chat-avatar">M</div>
      <div><b>Meso Concierge</b><small>Usually replies instantly</small></div>
      <button class="chat-close" type="button" aria-label="Close chat">×</button>
    </div>
    <div class="chat-log" aria-live="polite"></div>
    <div class="chips"></div>
    <form class="chat-form" autocomplete="off">
      <input type="text" placeholder="Ask about products, the pump…" aria-label="Message" />
      <button type="submit" aria-label="Send">↑</button>
    </form>`;
  document.body.append(fab, panel);

  const log = panel.querySelector(".chat-log");
  const chips = panel.querySelector(".chips");
  const form = panel.querySelector("form");
  const input = form.querySelector("input");
  let started = false;

  const add = (html, who) => {
    const m = document.createElement("div");
    m.className = `msg ${who}`;
    m.innerHTML = html;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  };
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const answer = (q) => {
    const t = " " + q.toLowerCase().replace(/[^a-z0-9$ ]/g, " ") + " ";
    let best = null, score = 0;
    KB.forEach((item) => {
      const s = item.k.reduce((n, k) => n + (t.includes(k) ? k.length : 0), 0);
      if (s > score) { score = s; best = item; }
    });
    let a = best ? best.a : FALLBACK;
    // links to #dose only make sense on the landing page
    if (!document.getElementById("dose")) a = a.replace(/href='#dose'/g, "href='index.html#dose'");
    return a;
  };
  const reply = (q) => {
    const typing = add('<span class="typing"><i></i><i></i><i></i></span>', "bot");
    setTimeout(() => { typing.innerHTML = answer(q); log.scrollTop = log.scrollHeight; }, 550 + Math.random() * 400);
  };
  const send = (q) => { q = q.trim(); if (!q) return; add(esc(q), "user"); reply(q); };

  CHIPS.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = c;
    b.addEventListener("click", () => send(c));
    chips.appendChild(b);
  });

  const open = (state) => {
    panel.classList.toggle("open", state);
    if (state && !started) { started = true; add("Hi, I'm the Meso Concierge ✦ What can I help your face with today?", "bot"); }
    if (state) setTimeout(() => input.focus(), 250);
  };
  fab.addEventListener("click", () => open(!panel.classList.contains("open")));
  panel.querySelector(".chat-close").addEventListener("click", () => open(false));
  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); input.value = ""; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") open(false); });
})();

/* ---------- 4. Find Your Dose (X-Factor) ---------- */
(() => {
  const root = document.getElementById("dose-app");
  if (!root) return;

  const PRODUCTS = {
    cleanser: { name: "The Cleanser", short: "CLEANSE", c: "var(--sage)" },
    red:      { name: "Serum No. 1 · Red Marks", short: "RED", c: "var(--rose)" },
    brown:    { name: "Serum No. 2 · Brown Marks", short: "BROWN", c: "var(--amber)" },
  };
  const TIPS = {
    sensitive: "Sensitive skin: start your serum every other night for the first two weeks, and patch-test first.",
    combination: "Combination skin: spread your one pump across the whole face — the dose is sized for T-zone and cheeks alike.",
    oily: "Oily skin: resist the urge to add more. One pump is the dose; extra product won't mean extra results.",
    dry: "Dry skin: apply your serum to slightly damp skin, then seal it in with your favorite moisturizer.",
    normal: "Normal skin: consistency beats quantity. One pump, every day, is the whole secret.",
  };
  const state = { marks: null, type: null };
  const steps = root.querySelectorAll(".q");
  const bars = root.querySelectorAll(".progress i");

  const show = (i) => {
    steps.forEach((s, j) => { s.classList.toggle("q-hidden", j !== i); if (j === i) { s.classList.remove("fade-in"); void s.offsetWidth; s.classList.add("fade-in"); } });
    bars.forEach((b, j) => b.classList.toggle("on", j <= i));
  };

  root.querySelectorAll(".opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { key, val } = btn.dataset;
      state[key] = val;
      btn.parentElement.querySelectorAll(".opt").forEach((b) => b.classList.toggle("sel", b === btn));
      setTimeout(() => { if (key === "marks") show(1); else { build(); show(2); } }, 260);
    });
  });
  root.querySelector("[data-restart]").addEventListener("click", () => {
    root.querySelectorAll(".opt").forEach((b) => b.classList.remove("sel"));
    state.marks = state.type = null; show(0); load("cleanser");
  });

  function build() {
    const am = ["cleanser"], pm = ["cleanser"];
    if (state.marks === "red") { am.push("red"); pm.push("red"); }
    if (state.marks === "brown") { am.push("brown"); pm.push("brown"); }
    if (state.marks === "both") { am.push("red"); pm.push("brown"); }
    const li = (k) => `<li><button type="button" data-p="${k}"><span class="dot" style="background:${PRODUCTS[k].c}"></span><span class="r-name">${PRODUCTS[k].name}</span><span class="r-dose">1 pump</span></button></li>`;
    root.querySelector("#ritual-am").innerHTML = am.map(li).join("") + `<li><button type="button" disabled style="opacity:.55;cursor:default"><span class="dot" style="background:transparent;border:1px solid rgba(250,247,242,.5)"></span><span>Your SPF</span><span class="r-dose">finish</span></button></li>`;
    root.querySelector("#ritual-pm").innerHTML = pm.map(li).join("");
    root.querySelector("#ritual-title").textContent =
      state.marks === "none" ? "Clear skin? Keep it simple." :
      state.marks === "both" ? "Red by day. Brown by night." :
      state.marks === "red" ? "Your ritual: calm the red." : "Your ritual: fade the brown.";
    root.querySelector("#ritual-tip").textContent = TIPS[state.type];
    root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => load(b.dataset.p)));
    load(state.marks === "none" ? "cleanser" : am[1]);
  }

  /* --- Press-and-hold pump demo --- */
  const holdBtn = document.getElementById("hold-btn");
  const bar = holdBtn.querySelector(".bar");
  const bottle = document.getElementById("pump-bottle");
  const bottleBody = bottle.querySelector(".body");
  const bottleLabel = bottle.querySelector(".label");
  const drop = document.getElementById("drop");
  const msg = document.getElementById("pump-msg");
  const sub = document.getElementById("pump-sub");
  const CIRC = 452, HOLD_MS = 1400;
  let current = "cleanser", progress = 0, raf = null, t0 = 0, done = false, fill = 82;

  function load(key) {
    current = key; progress = 0; done = false; fill = 82;
    const p = PRODUCTS[key];
    document.querySelector(".pump-panel").style.setProperty("--c", p.c);
    bottleBody.style.setProperty("--c", p.c);
    bottleBody.style.setProperty("--fill", fill + "%");
    bottleLabel.textContent = p.short;
    bar.style.strokeDashoffset = CIRC;
    drop.style.width = drop.style.height = "0px";
    msg.textContent = "Press and hold.";
    sub.textContent = p.name + " — feel the dose.";
    root.querySelectorAll("[data-p]").forEach((b) => b.classList.toggle("active", b.dataset.p === key));
  }
  function frame(now) {
    progress = Math.min(1, (now - t0) / HOLD_MS);
    bar.style.strokeDashoffset = CIRC * (1 - progress);
    const d = 8 + progress * 30;
    drop.style.width = drop.style.height = d + "px";
    bottleBody.style.setProperty("--fill", (fill - progress * 6) + "%");
    msg.textContent = progress < 0.5 ? "Dispensing…" : "Almost…";
    if (progress >= 1) return complete();
    raf = requestAnimationFrame(frame);
  }
  function complete() {
    done = true; cancelAnimationFrame(raf);
    fill -= 6; bottle.classList.remove("pressing");
    holdBtn.classList.remove("clicked"); void holdBtn.offsetWidth; holdBtn.classList.add("clicked");
    if (navigator.vibrate) navigator.vibrate(30);
    msg.innerHTML = "Click. <em>That's one face.</em>";
    sub.textContent = "The pump stopped itself — exactly one dose.";
  }
  function start(e) {
    e.preventDefault();
    if (done) { load(current); }
    bottle.classList.add("pressing");
    t0 = performance.now(); raf = requestAnimationFrame(frame);
  }
  function end() {
    if (!raf) return;
    cancelAnimationFrame(raf); raf = null; bottle.classList.remove("pressing");
    if (!done) {
      bar.style.strokeDashoffset = CIRC; drop.style.width = drop.style.height = "0px";
      bottleBody.style.setProperty("--fill", fill + "%");
      msg.textContent = "Keep holding — it stops for you.";
    }
  }
  holdBtn.addEventListener("pointerdown", start);
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => holdBtn.addEventListener(ev, end));
  holdBtn.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) start(e); });
  holdBtn.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") end(); });
  holdBtn.addEventListener("contextmenu", (e) => e.preventDefault());

  load("cleanser");
  show(0);
})();
