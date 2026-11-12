/* Мінімальний рушій слайдів: клавіатура, свайпи, колесо, хеш у URL, огляд, повний екран, мобільний режим */
(function () {
  const html = document.documentElement;
  const deck = document.getElementById("deck");
  const slides = Array.from(deck.querySelectorAll(".slide"));
  const N = slides.length;
  const progress = document.getElementById("progress");
  const count = document.getElementById("count");
  let cur = -1, overview = false, flow = false, lock = 0;

  slides.forEach((s, i) => {
    const no = document.createElement("div");
    no.className = "slide-no";
    no.textContent = `${String(i + 1).padStart(2, "0")} / ${N}`;
    if (!s.classList.contains("title-slide")) s.appendChild(no);
  });

  function fit() {
    const wantFlow = window.innerWidth < 820 || window.innerHeight > window.innerWidth * 1.1;
    if (wantFlow !== flow) {
      flow = wantFlow;
      html.classList.toggle("flow", flow);
      if (flow) { exitOverview(); setupFlowObserver(); }
      else if (cur >= 0) { const c = cur; cur = -1; go(c); }
    }
    if (flow) return;
    const s = Math.min(window.innerWidth / 1600, (window.innerHeight - 36) / 900);
    html.style.setProperty("--scale", s.toFixed(4));
    if (overview) layoutOverview();
  }

  function go(i, fromHash) {
    i = Math.max(0, Math.min(N - 1, i));
    if (flow) { slides[i].scrollIntoView({ behavior: "smooth" }); return; }
    if (i === cur) return;
    const prev = cur;
    cur = i;
    slides.forEach((s, k) => {
      s.classList.toggle("active", k === i);
      s.classList.toggle("before", k < i);
    });
    if (prev >= 0 && window.SlideFX) window.SlideFX.leave(slides[prev]);
    if (window.SlideFX) setTimeout(() => window.SlideFX.enter(slides[i]), 120);
    progress.style.width = ((i + 1) / N) * 100 + "%";
    count.textContent = `${i + 1} / ${N}`;
    document.title = `${slides[i].dataset.title || ""} · Гроші, що думають`;
    const acc = getComputedStyle(slides[i]).getPropertyValue("--acc");
    document.querySelector(".bg .b1").style.background = `radial-gradient(circle, ${acc} 0%, transparent 62%)`;
    if (!fromHash) history.replaceState(null, "", "#" + (i + 1));
  }
  const next = () => go(cur + 1), prev = () => go(cur - 1);

  /* ----- Overview ----- */
  function layoutOverview() {
    const cols = 6, gap = 24;
    const cw = (window.innerWidth - gap * (cols + 1)) / cols;
    const sc = cw / 1600, ch = 900 * sc;
    slides.forEach((s, i) => {
      const x = gap + (i % cols) * (cw + gap) + cw / 2 - window.innerWidth / 2;
      const y = gap + Math.floor(i / cols) * (ch + gap) + ch / 2 - window.innerHeight / 2;
      s.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${sc})`;
    });
  }
  function enterOverview() {
    if (flow) return;
    overview = true; html.classList.add("overview"); layoutOverview();
  }
  function exitOverview() {
    if (!overview) return;
    overview = false; html.classList.remove("overview");
    slides.forEach((s) => (s.style.transform = ""));
  }
  slides.forEach((s, i) => s.addEventListener("click", () => { if (overview) { exitOverview(); const c = cur; cur = -1; go(i === c ? c : i); } }));

  /* ----- Fullscreen ----- */
  function toggleFull() {
    if (!document.fullscreenElement) (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)?.call(document.documentElement);
    else (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
  }

  /* ----- Input ----- */
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) { if (overview && k === "Enter") { exitOverview(); const c = cur; cur = -1; go(c); } else if (!flow) next(); e.preventDefault(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) { if (!flow) prev(); e.preventDefault(); }
    else if (k === "Home") go(0);
    else if (k === "End") go(N - 1);
    else if (k === "o" || k === "O" || k === "щ" || k === "Щ") overview ? exitOverview() : enterOverview();
    else if (k === "Escape" && overview) exitOverview();
    else if (k === "f" || k === "F" || k === "а" || k === "А") toggleFull();
  });
  document.getElementById("b-next").onclick = next;
  document.getElementById("b-prev").onclick = prev;
  document.getElementById("b-over").onclick = () => (overview ? exitOverview() : enterOverview());
  document.getElementById("b-full").onclick = toggleFull;

  window.addEventListener("wheel", (e) => {
    if (flow || overview) return;
    const now = Date.now();
    if (now - lock < 700 || Math.abs(e.deltaY) < 30) return;
    lock = now;
    e.deltaY > 0 ? next() : prev();
  }, { passive: true });

  let tx = 0, ty = 0;
  window.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchend", (e) => {
    if (flow || overview) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
  }, { passive: true });

  window.addEventListener("hashchange", () => { const n = parseInt(location.hash.slice(1), 10); if (n) go(n - 1, true); });
  window.addEventListener("resize", fit);

  /* ----- Flow mode: анімації при прокручуванні ----- */
  let io;
  function setupFlowObserver() {
    if (io) return;
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!flow) return;
        en.target.classList.toggle("active", en.isIntersecting);
        if (en.isIntersecting && !en.target._entered) { en.target._entered = true; window.SlideFX && window.SlideFX.enter(en.target); }
      });
    }, { threshold: 0.25 });
    slides.forEach((s) => io.observe(s));
  }

  /* ----- HUD ховається, коли миша нерухома ----- */
  const hud = document.querySelector(".hud");
  let idleT = 0;
  const wake = () => { hud.classList.remove("idle"); clearTimeout(idleT); idleT = setTimeout(() => { if (!hud.matches(":hover")) hud.classList.add("idle"); }, 2200); };
  ["mousemove", "touchstart", "keydown"].forEach((ev) => window.addEventListener(ev, wake, { passive: true }));
  wake();

  /* ----- Start ----- */
  if (window.SlideFX) window.SlideFX.init((i) => { exitOverview(); go(i); });
  fit();
  const start = parseInt(location.hash.slice(1), 10);
  const startIdx = start ? start - 1 : 0;
  if (flow) { if (start) setTimeout(() => slides[startIdx].scrollIntoView(), 300); }
  else go(startIdx, true);
  if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(() => { if (!flow && cur >= 0) window.SlideFX && window.SlideFX.enter(slides[cur]); });
})();
