/* Візуалізації: Chart.js + власні SVG-інфографіки. Усі дані — з data.js */
(function () {
  const D = window.DATA;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const C = {
    text: css("--text"), text2: css("--text-2"), muted: css("--muted"),
    violet: css("--violet"), cyan: css("--cyan"), amber: css("--amber"), green: css("--green"), red: css("--red"),
  };
  const grid = "rgba(255,255,255,0.08)";
  const fmt = (n, dec = 0) => n.toLocaleString("uk-UA", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const alpha = (hex, a) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  /* ---------- Chart.js defaults ---------- */
  if (window.Chart) {
    Chart.defaults.color = C.text2;
    Chart.defaults.font.family = "'JetBrains Mono', ui-monospace, monospace";
    Chart.defaults.font.size = 15;
    Chart.defaults.borderColor = grid;
    Chart.defaults.devicePixelRatio = Math.max(2, window.devicePixelRatio || 1);
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.plugins.tooltip.backgroundColor = "rgba(10,16,32,.92)";
    Chart.defaults.plugins.tooltip.borderColor = "rgba(255,255,255,.18)";
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 12;
    Chart.defaults.animation.duration = 1100;
    Chart.defaults.animation.easing = "easeOutQuart";
  }

  /* Підписи значень над стовпчиками / в кінці смуг */
  const valueLabels = {
    id: "valueLabels",
    afterDatasetsDraw(chart, _a, opts) {
      if (!opts || !opts.format) return;
      const { ctx } = chart;
      chart.data.datasets.forEach((ds, di) => {
        if (opts.only != null && opts.only !== di) return;
        const meta = chart.getDatasetMeta(di);
        if (meta.hidden) return;
        meta.data.forEach((bar, i) => {
          const v = ds.data[i];
          if (v == null) return;
          const raw = typeof v === "object" ? v.y : v;
          if (raw == null) return;
          const txt = opts.format(raw, i);
          ctx.save();
          ctx.font = `600 ${opts.size || 17}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = opts.color || C.text;
          const horiz = chart.options.indexAxis === "y";
          if (horiz) { ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(txt, bar.x + 12, bar.y); }
          else { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(txt, bar.x, bar.y - (opts.offset || 10)); }
          ctx.restore();
        });
      });
    },
  };
  if (window.Chart) Chart.register(valueLabels);

  const vGrad = (ctx, area, color, a1 = 0.55, a2 = 0.02) => {
    const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, alpha(color, a1)); g.addColorStop(1, alpha(color, a2));
    return g;
  };
  const barFill = (color) => (c) => {
    const { chart } = c; const area = chart.chartArea;
    if (!area) return alpha(color, 0.6);
    return vGrad(chart.ctx, area, color, 0.95, 0.25);
  };
  const axisTitle = (text) => ({ display: true, text, color: C.muted, font: { size: 14 } });

  const builders = {
    "c-markowitz"(ctx) {
      const { pts, frontier } = D.portfolios(1500);
      const colors = pts.map((p) => {
        const s = (p.y - 4) / p.x; // «якість» = дохідність на одиницю ризику
        const t = Math.max(0, Math.min(1, (s - 0.25) / 0.55));
        return t > 0.5 ? alpha(C.cyan, 0.35 + t * 0.4) : alpha(C.violet, 0.35 + t * 0.5);
      });
      return new Chart(ctx, {
        type: "scatter",
        data: { datasets: [
          { data: frontier, showLine: true, borderColor: C.green, borderWidth: 4, pointRadius: 0, tension: 0.3, order: 0 },
          { data: pts, pointRadius: 3, pointBackgroundColor: colors, pointBorderWidth: 0, order: 1 },
        ] },
        options: {
          animation: { duration: 1600, delay: (c) => (c.datasetIndex === 1 ? c.dataIndex * 0.6 : 900) },
          scales: {
            x: { title: axisTitle("Ризик σ, %"), grid: { color: grid } },
            y: { title: axisTitle("Очікувана дохідність, %"), grid: { color: grid } },
          },
          plugins: { tooltip: { callbacks: { label: (c) => `σ ${fmt(c.parsed.x, 1)}% · дохідність ${fmt(c.parsed.y, 1)}%` } } },
        },
      });
    },

    "c-fico"(ctx) {
      const cols = [C.violet, C.cyan, C.green, C.amber, C.red];
      return new Chart(ctx, {
        type: "doughnut",
        data: { labels: D.ficoFactors.map((f) => f.label), datasets: [{ data: D.ficoFactors.map((f) => f.value), backgroundColor: cols, borderColor: "rgba(4,6,12,.9)", borderWidth: 4, hoverOffset: 10 }] },
        options: {
          cutout: "62%",
          layout: { padding: 6 },
          plugins: {
            legend: { display: true, position: "bottom", labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: "circle", padding: 10, font: { family: "Inter", size: 14 }, color: C.text2, generateLabels: (ch) => ch.data.labels.map((l, i) => ({ text: `${ch.data.datasets[0].data[i]}% ${l}`, fillStyle: cols[i], strokeStyle: cols[i], fontColor: C.text2, index: i })) } },
            tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}%` } },
          },
        },
      });
    },

    "c-options"(ctx) {
      const s = D.options.series;
      return new Chart(ctx, {
        type: "bar",
        data: { labels: s.map((d) => d.year), datasets: [{ data: s.map((d) => d.value), backgroundColor: barFill(C.violet), borderRadius: 10, borderSkipped: false, maxBarThickness: 80 }] },
        options: {
          scales: {
            y: { type: "logarithmic", min: 0.0005, max: 40, grid: { color: grid },
              ticks: { callback: (v) => ({ 0.001: "1 млн", 0.01: "10 млн", 0.1: "100 млн", 1: "1 млрд", 10: "10 млрд" }[v] || "") } },
            x: { grid: { display: false } },
          },
          plugins: {
            valueLabels: { format: (v) => (v < 0.01 ? "1,1 млн" : fmt(v, v >= 10 ? 1 : 2)) },
            tooltip: { callbacks: { label: (c) => (c.parsed.y < 0.01 ? " ≈1,1 млн контрактів" : ` ${fmt(c.parsed.y, 2)} млрд контрактів`) } },
          },
        },
      });
    },

    "c-medallion"(ctx) {
      const m = D.medallion;
      return new Chart(ctx, {
        type: "bar",
        data: { labels: m.map((d) => d.label), datasets: [{ data: m.map((d) => d.value), backgroundColor: [C.cyan, alpha(C.cyan, 0.55), "rgba(255,255,255,.25)"], borderRadius: 12, borderSkipped: false, barThickness: 64 }] },
        options: {
          indexAxis: "y",
          layout: { padding: { right: 90 } },
          scales: { x: { min: 0, max: 80, grid: { color: grid }, ticks: { stepSize: 10, callback: (v) => v + "%" } }, y: { grid: { display: false }, ticks: { font: { family: "Inter", size: 17 }, color: C.text } } },
          plugins: { valueLabels: { format: (v, i) => (i === 2 ? "≈10%" : fmt(v, 1) + "%"), size: 22 } },
        },
      });
    },

    "c-fraud"(ctx) {
      const f = D.fraudCents;
      return new Chart(ctx, {
        type: "line",
        data: { labels: f.map((d) => d.year), datasets: [{
          data: f.map((d) => d.value), spanGaps: true, borderColor: C.cyan, borderWidth: 4, tension: 0.35,
          pointRadius: (c) => (c.raw == null ? 0 : 6), pointBackgroundColor: "#04060c", pointBorderColor: C.cyan, pointBorderWidth: 3,
          fill: true, backgroundColor: (c) => (c.chart.chartArea ? vGrad(c.chart.ctx, c.chart.chartArea, C.cyan, 0.35, 0) : "transparent"),
        }] },
        options: {
          scales: { y: { min: 3, max: 8, grid: { color: grid }, ticks: { callback: (v) => fmt(v, v % 1 ? 1 : 0) + "¢" } }, x: { offset: true, grid: { display: false } } },
          plugins: { valueLabels: { format: (v, i) => ([0, 6, 13].includes(i) ? fmt(v, 2) + "¢" : ""), offset: 16 }, tooltip: { callbacks: { label: (c) => ` ${fmt(c.parsed.y, 2)}¢ на $100` } } },
        },
      });
    },

    "c-hft"(ctx) {
      const h = D.hft;
      const whisker = {
        id: "whisker",
        afterDatasetsDraw(chart) {
          const { ctx } = chart; const y = chart.scales.y; const meta = chart.getDatasetMeta(0);
          h.forEach((d, i) => {
            if (d.low == null) return;
            const x = meta.data[i].x;
            ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(x, y.getPixelForValue(d.low)); ctx.lineTo(x, y.getPixelForValue(d.high));
            ctx.moveTo(x - 16, y.getPixelForValue(d.low)); ctx.lineTo(x + 16, y.getPixelForValue(d.low));
            ctx.moveTo(x - 16, y.getPixelForValue(d.high)); ctx.lineTo(x + 16, y.getPixelForValue(d.high));
            ctx.stroke(); ctx.restore();
          });
        },
      };
      return new Chart(ctx, {
        type: "bar",
        data: { labels: h.map((d) => d.year), datasets: [{ data: h.map((d) => d.value), backgroundColor: barFill(C.amber), borderRadius: 12, borderSkipped: false, maxBarThickness: 110 }] },
        options: {
          scales: { y: { min: 0, max: 100, grid: { color: grid }, ticks: { callback: (v) => v + "%" } }, x: { grid: { display: false } } },
          plugins: { valueLabels: { format: (v, i) => (i === 1 ? "" : "≈" + v + "%"), size: 20 } },
        },
        plugins: [whisker],
      });
    },

    "c-cdo"(ctx) {
      const d = D.cdo;
      return new Chart(ctx, {
        type: "bar",
        data: { labels: d.map((x) => x.year), datasets: [{ data: d.map((x) => x.value), backgroundColor: (c) => (c.dataIndex === 0 ? barFill(C.amber)(c) : c.dataIndex === 1 ? barFill(C.red)(c) : alpha(C.red, 0.45)), borderRadius: 12, borderSkipped: false, maxBarThickness: 140 }] },
        options: {
          scales: { y: { min: 0, max: 600, grid: { color: grid }, ticks: { callback: (v) => "$" + v } }, x: { grid: { display: false } } },
          plugins: { valueLabels: { format: (v) => "$" + fmt(v, 1), size: 20 } },
        },
      });
    },

    "c-flash"(ctx) {
      const s = D.flash.series;
      const lowIdx = s.findIndex((p) => p.v === 9870);
      const lowLabel = {
        id: "lowLabel",
        afterDatasetsDraw(chart) {
          const p = chart.getDatasetMeta(0).data[lowIdx]; if (!p) return;
          const { ctx } = chart; ctx.save();
          ctx.fillStyle = C.red; ctx.font = "600 17px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
          ctx.fillText("14:47 · 9 869,62", p.x, p.y + 34); ctx.restore();
        },
      };
      return new Chart(ctx, {
        type: "line",
        data: { labels: s.map((p) => p.t), datasets: [
          { data: s.map((p) => p.v), borderColor: C.red, borderWidth: 4, tension: 0.25, pointRadius: (c) => (c.dataIndex === lowIdx ? 8 : 0), pointBackgroundColor: C.red,
            fill: true, backgroundColor: (c) => (c.chart.chartArea ? vGrad(c.chart.ctx, c.chart.chartArea, C.red, 0.3, 0) : "transparent") },
          { data: s.map(() => D.flash.prevClose), borderColor: "rgba(255,255,255,.35)", borderDash: [6, 6], borderWidth: 2, pointRadius: 0 },
        ] },
        options: {
          scales: { y: { min: 9600, max: 11000, grid: { color: grid }, ticks: { callback: (v) => fmt(v) } }, x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } } },
          plugins: { tooltip: { callbacks: { label: (c) => (c.datasetIndex ? " закриття 5 травня" : ` ${fmt(c.parsed.y)}`) } } },
          animation: { duration: 2200 },
        },
        plugins: [lowLabel],
      });
    },

    "c-alt"(ctx) {
      const d = D.altData;
      return new Chart(ctx, {
        type: "bar",
        data: { labels: d.map((x) => x.year), datasets: [{ data: d.map((x) => x.value), backgroundColor: (c) => (c.dataIndex < 2 ? barFill(C.amber)(c) : alpha(C.amber, 0.4)), borderRadius: 12, borderSkipped: false, maxBarThickness: 150 }] },
        options: {
          scales: { y: { min: 0, max: 2000, grid: { color: grid }, ticks: { callback: (v) => "$" + fmt(v) } }, x: { grid: { display: false } } },
          plugins: { valueLabels: { format: (v) => "$" + fmt(v) + " млн", size: 20 } },
        },
      });
    },

    "c-erica"(ctx) {
      const e = D.erica;
      return new Chart(ctx, {
        type: "line",
        data: { labels: e.map((x) => x.t), datasets: [{ data: e.map((x) => x.v), borderColor: C.green, borderWidth: 4, tension: 0.3, pointRadius: 7, pointBackgroundColor: "#04060c", pointBorderColor: C.green, pointBorderWidth: 3,
          fill: true, backgroundColor: (c) => (c.chart.chartArea ? vGrad(c.chart.ctx, c.chart.chartArea, C.green, 0.35, 0) : "transparent") }] },
        options: {
          layout: { padding: { top: 30, right: 20 } },
          scales: { y: { min: 0, max: 3, grid: { color: grid }, ticks: { stepSize: 1, callback: (v) => v + " млрд" } }, x: { offset: true, grid: { display: false } } },
          plugins: { valueLabels: { format: (v, i) => (i === 0 ? "запуск" : fmt(v, v % 1 ? 1 : 0) + " млрд"), offset: 16 } },
        },
      });
    },

    "c-bgpt"(ctx) {
      const b = D.bloombergGPT;
      return new Chart(ctx, {
        type: "doughnut",
        data: { labels: ["Фінансові дані Bloomberg", "Загальні тексти"], datasets: [{ data: [b.finTokens, b.genTokens], backgroundColor: [C.green, "rgba(255,255,255,.22)"], borderColor: "rgba(4,6,12,.9)", borderWidth: 4 }] },
        options: {
          cutout: "64%",
          plugins: {
            legend: { display: true, position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", font: { family: "Inter", size: 14 }, padding: 12, generateLabels: (ch) => ch.data.labels.map((l, i) => ({ text: `${ch.data.datasets[0].data[i]} млрд токенів · ${l}`, fillStyle: i ? "rgba(255,255,255,.4)" : C.green, strokeStyle: "transparent", fontColor: C.text2, index: i })) } },
            tooltip: { callbacks: { label: (c) => ` ${c.parsed} млрд токенів` } },
          },
        },
        plugins: [{ id: "center", afterDraw(ch) { const { ctx, chartArea: a } = ch; ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = C.text; ctx.font = "700 30px 'JetBrains Mono', monospace"; const cx = (a.left + a.right) / 2, cy = (a.top + a.bottom) / 2; ctx.fillText("708", cx, cy + 4); ctx.font = "500 13px 'JetBrains Mono', monospace"; ctx.fillStyle = C.muted; ctx.fillText("млрд токенів", cx, cy + 26); ctx.restore(); } }],
      });
    },

    "c-genai"(ctx) {
      const g = D.genaiUse;
      return new Chart(ctx, {
        type: "bar",
        data: { labels: g.map((x) => x.year), datasets: [{ data: g.map((x) => x.value), backgroundColor: barFill(C.green), borderRadius: 12, borderSkipped: false, maxBarThickness: 110 }] },
        options: {
          scales: { y: { min: 0, max: 100, grid: { color: grid }, ticks: { callback: (v) => v + "%" } }, x: { grid: { display: false } } },
          plugins: { valueLabels: { format: (v, i) => g[i].note || v + "%", size: 22 } },
        },
      });
    },

    "c-fail"(ctx) {
      const f = D.failures;
      return new Chart(ctx, {
        type: "bar",
        data: { labels: f.map((x) => `${x.year} · ${x.name}`), datasets: [{ data: f.map((x) => x.value), backgroundColor: [alpha(C.red, 0.85), alpha(C.red, 0.4), alpha(C.red, 0.85)], borderRadius: 12, borderSkipped: false, barThickness: 56 }] },
        options: {
          indexAxis: "y",
          layout: { padding: { right: 120 } },
          scales: {
            x: { type: "logarithmic", min: 0.1, max: 2000, grid: { color: grid }, ticks: { maxRotation: 0, autoSkip: false, callback: (v) => ({ 0.1: "$0,1", 1: "$1", 10: "$10", 100: "$100", 1000: "$1000" }[v] || "") } },
            y: { grid: { display: false }, ticks: { font: { family: "Inter", size: 16 }, color: C.text } },
          },
          plugins: { valueLabels: { format: (v) => (v >= 1000 ? "≈$1 трлн" : v < 1 ? "$440 млн" : "$" + fmt(v, 1) + " млрд"), size: 18 } },
        },
      });
    },
  };

  /* ---------- SVG / DOM інфографіки (будуються один раз) ---------- */
  function buildTimeline(goTo) {
    const host = document.getElementById("timeline"); if (!host) return;
    const W = 1408, H = 560, x0 = 30, x1 = W - 30, axisY = 280;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" }, host);
    const cols = [C.violet, C.cyan, C.amber, C.green, C.red];
    const yMin = 1950, yMax = 2026;
    const X = (y) => x0 + ((y - yMin) / (yMax - yMin)) * (x1 - x0);
    const bounds = [1950, 1980, 2000, 2015, 2024, 2026];
    D.chapters.forEach((ch, i) => {
      const a = X(bounds[i]), b = X(bounds[i + 1]);
      el("rect", { x: a, y: axisY - 3, width: b - a, height: 6, rx: 3, fill: cols[i], opacity: 0.85 }, svg);
      const t = el("text", { x: a + 4, y: axisY + 30, class: "chap", fill: cols[i], opacity: 0.9 }, svg);
      t.textContent = i < 4 ? `${ch.id} · ${ch.name}` : "V";
    });
    // уникаємо накладання підписів: чергуємо верх/низ і рівні
    const levels = [-62, 76, -138, 150, -212, 222];
    D.timeline.forEach((ev, i) => {
      const x = X(ev.year), col = cols[ev.ch];
      const off = levels[i % 6];
      const g = el("g", { class: "dot", tabindex: 0, role: "link", "aria-label": `${ev.year}: ${ev.label}` }, svg);
      el("line", { x1: x, x2: x, y1: axisY, y2: axisY + off + (off < 0 ? 26 : -40), stroke: col, "stroke-opacity": 0.45, "stroke-width": 1.5 }, g);
      el("circle", { cx: x, cy: axisY, r: 16, fill: col, opacity: 0.18 }, g);
      el("circle", { class: "core", cx: x, cy: axisY, r: 8, fill: col, style: `filter:drop-shadow(0 0 6px ${col})` }, g);
      const ty = axisY + off;
      const yr = el("text", { x, y: ty - (off < 0 ? 4 : 0), class: "yr", "text-anchor": "middle" }, g); yr.textContent = ev.year;
      const lb = el("text", { x, y: ty + 22 - (off < 0 ? 4 : 0), "text-anchor": "middle", "font-size": 15 }, g); lb.textContent = ev.label;
      g.style.opacity = 0; g.style.transition = `opacity .5s ease ${0.25 + i * 0.07}s`;
      g.addEventListener("click", () => goTo(ev.slide - 1));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter") goTo(ev.slide - 1); });
    });
    const list = document.createElement("div"); list.className = "m-list";
    list.innerHTML = D.timeline.map((ev) => `<a class="it" href="#${ev.slide}" style="--c:${cols[ev.ch]}"><span class="y">${ev.year}</span><span class="t">${ev.label}</span></a>`).join("");
    host.appendChild(list);
  }

  function buildGauge() {
    const host = document.getElementById("gauge"); if (!host) return;
    const svg = el("svg", { viewBox: "0 0 400 300", style: "width:100%;height:100%" }, host);
    const cx = 200, cy = 220, r = 150;
    const cols = [C.red, C.amber, "#d9e85b", C.cyan, C.green];
    const ang = (v) => Math.PI * (1 - (v - 300) / 550);
    const pt = (v, rr) => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
    D.ficoBands.forEach((b, i) => {
      const [x1, y1] = pt(b.from, r), [x2, y2] = pt(b.to + (i < 4 ? 1 : 0), r);
      el("path", { d: `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`, stroke: cols[i], "stroke-width": 26, fill: "none", "stroke-linecap": "butt" }, svg);
    });
    [300, 580, 670, 740, 800, 850].forEach((v) => {
      const [x, y] = pt(v, r + 32);
      const t = el("text", { x, y: y + 5, "text-anchor": "middle", "font-size": 15, "font-family": "JetBrains Mono", fill: C.text2 }, svg); t.textContent = v;
    });
    const needle = el("g", { style: "transition: transform 1.6s cubic-bezier(.2,.8,.2,1); transform-origin: 200px 220px; transform: rotate(-90deg)" }, svg);
    el("line", { x1: cx, y1: cy, x2: cx, y2: cy - r + 30, stroke: C.text, "stroke-width": 4, "stroke-linecap": "round" }, needle);
    el("circle", { cx, cy, r: 10, fill: C.text }, svg);
    const t1 = el("text", { x: cx, y: cy + 50, "text-anchor": "middle", "font-size": 34, "font-weight": 700, "font-family": "JetBrains Mono", fill: C.text }, svg); t1.textContent = "300–850";
    const t2 = el("text", { x: cx, y: cy + 76, "text-anchor": "middle", "font-size": 15, "font-family": "Inter", fill: C.muted }, svg); t2.textContent = "670+ — «добрий» бал";
    host._needle = needle;
  }

  function buildGrids() {
    const lev = document.getElementById("lev");
    if (lev) for (let i = 0; i < 25; i++) { const c = document.createElement("i"); if (i === 0) c.className = "own"; c.style.transitionDelay = `${0.3 + i * 0.04}s`; lev.appendChild(c); }
    const people = document.getElementById("people");
    if (people) for (let i = 0; i < 600; i++) { const c = document.createElement("i"); people.appendChild(c); }
    const eng = document.getElementById("engineers");
    if (eng) for (let i = 0; i < 200; i++) eng.appendChild(document.createElement("i"));
    const icons = document.getElementById("alt-icons");
    if (icons) {
      const items = [
        ["M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", "Супутникові знімки"],
        ["M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", "Геолокація смартфонів"],
        ["M3 5h18v14H3zM3 10h18", "Дані транзакцій і чеків"],
        ["M4 4h16v12H4zM8 20h8M12 16v4", "Соцмережі та веб-скрейпінг"],
      ];
      icons.innerHTML = `<h3>Нові джерела даних</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 20px">${items.map(([d, t]) => `<div style="display:flex;gap:12px;align-items:center;font-size:17px;color:var(--text-2)"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="var(--acc)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" style="flex:none"><path d="${d}"/></svg>${t}</div>`).join("")}</div>`;
    }
  }

  function buildOrbit() {
    const host = document.getElementById("orbit"); if (!host) return;
    const W = 1408, H = 610, cx = W / 2, cy = H / 2;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}` }, host);
    const spin = el("g", { class: "spin" }, svg);
    el("ellipse", { class: "ringline", cx, cy, rx: 300, ry: 165 }, spin);
    el("ellipse", { class: "ringline", cx, cy, rx: 560, ry: 270 }, svg);
    const core = el("g", {}, svg);
    el("circle", { cx, cy, r: 92, fill: alpha(C.green, 0.12), stroke: alpha(C.green, 0.6), "stroke-width": 2, style: `filter:drop-shadow(0 0 30px ${alpha(C.green, 0.5)})` }, core);
    const t = el("text", { x: cx, y: cy - 4, "text-anchor": "middle", "font-size": 24, "font-weight": 700, "font-family": "Unbounded", fill: C.text }, core); t.textContent = "ДАНІ";
    const t2 = el("text", { x: cx, y: cy + 24, "text-anchor": "middle", "font-size": 14, "font-family": "JetBrains Mono", fill: C.muted }, core); t2.textContent = "+ моделі";
    const nodes = [
      ["Кредитний скоринг", "1956", C.violet], ["Портфельна теорія", "1952", C.violet],
      ["Оцінка деривативів", "1973", C.violet], ["Кількісні фонди", "1988", C.cyan],
      ["Антифрод", "1992", C.cyan], ["Алгоритмічна торгівля", "2000-ні", C.amber],
      ["Робо-радники", "2010", C.green], ["Альтернативні дані", "2010-ті", C.amber],
      ["NLP-обробка документів", "2017", C.green], ["Чат-асистенти", "2018", C.green],
      ["Фінансові LLM", "2023", C.green], ["Модельний ризик", "2011 / 2024", C.red],
    ];
    nodes.forEach(([name, yr, col], i) => {
      const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + 600 * Math.cos(a), y = cy + 250 * Math.sin(a);
      const g = el("g", { class: "node" }, svg);
      el("line", { x1: cx + 92 * Math.cos(a), y1: cy + 92 * Math.sin(a), x2: x, y2: y, stroke: alpha(col, 0.25), "stroke-width": 1.5 }, g);
      const r = el("rect", { x: x - 100, y: y - 30, width: 200, height: 60, rx: 18, style: `stroke:${alpha(col, 0.6)};fill:${alpha(col, 0.1)}` }, g);
      const tt = el("text", { x, y: y - 3, "text-anchor": "middle" }, g); tt.textContent = name;
      const ty = el("text", { x, y: y + 19, "text-anchor": "middle", class: "y" }, g); ty.textContent = yr;
      g._fit = () => { const w = Math.max(150, tt.getComputedTextLength() + 44); r.setAttribute("x", x - w / 2); r.setAttribute("width", w); };
      g.style.opacity = 0; g.style.transition = `opacity .5s ease ${0.2 + i * 0.08}s`;
    });
    const list = document.createElement("div"); list.className = "m-list";
    list.innerHTML = nodes.map(([n, y, c]) => `<div class="it" style="--c:${c}"><span class="y">${y.split(" ")[0]}</span><span class="t">${n}</span></div>`).join("");
    host.appendChild(list);
  }

  function buildSources() {
    const ol = document.getElementById("sources"); if (!ol) return;
    ol.innerHTML = D.sources.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}</a></li>`).join("");
  }

  function buildTicker() {
    const t = document.getElementById("ticker"); if (!t) return;
    const items = [
      ["MARKOWITZ", "1952", "up"], ["FICO", "300–850", ""], ["CBOE", "×13 800", "up"], ["MEDALLION", "+66,1%", "up"],
      ["FRAUD", "6,58¢/$100", "dn"], ["LTCM", "−$4,6 млрд", "dn"], ["HFT", "~50%", "up"], ["CDO 2006", "$488,6 млрд", ""],
      ["DOW 06.05.10", "−998,5", "dn"], ["KNIGHT", "−$440 млн", "dn"], ["ALT DATA", "×7", "up"], ["ROBO AUM", "≈$2 трлн", "up"],
      ["VISA AI", "$40 млрд", "up"], ["COiN", "360 000 год → сек", "up"], ["BloombergGPT", "50 млрд пар.", ""], ["GOLDMAN", "600 → 2", "dn"],
    ];
    const html = items.map(([k, v, c]) => `<span class="it"><b>${k}</b><span class="${c}">${c === "up" ? "▲ " : c === "dn" ? "▼ " : ""}${v}</span></span>`).join("");
    t.innerHTML = html + html;
  }

  /* ---------- Анімації при вході на слайд ---------- */
  function countUp(root) {
    root.querySelectorAll("[data-count]").forEach((n) => {
      const target = parseFloat(n.dataset.count), dec = +(n.dataset.dec || 0), suf = n.dataset.suffix || "";
      const t0 = performance.now(), dur = 1400;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        n.textContent = fmt(target * e, dec) + suf;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  let ringRaf = 0, streamTimer = 0;
  function ring() {
    const arc = document.getElementById("ring-arc"), tt = document.getElementById("ring-t"), mm = document.getElementById("ring-m");
    if (!arc) return;
    cancelAnimationFrame(ringRaf);
    const t0 = performance.now(), dur = 4500;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      arc.setAttribute("stroke-dashoffset", 553 * (1 - k));
      const sec = Math.round(k * 45 * 60);
      tt.textContent = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
      mm.textContent = "−$" + fmt(Math.round(k * 440)) + " млн";
      if (k < 1) ringRaf = requestAnimationFrame(step);
    };
    ringRaf = requestAnimationFrame(step);
  }

  function stream(on) {
    const host = document.getElementById("stream"); if (!host) return;
    clearInterval(streamTimer);
    host.querySelectorAll(".tx").forEach((n) => n.remove());
    if (!on) return;
    const spawn = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w) return;
      const bad = Math.random() < 0.16;
      const tx = document.createElement("div");
      tx.className = "tx" + (bad ? " bad" : "");
      tx.style.top = Math.round(10 + Math.random() * (h - 34)) + "px";
      const dist = bad ? w * 0.62 + 6 : w + 120;
      tx.style.setProperty("--dist", dist + "px");
      const dur = (bad ? 1.6 : 2.4) + Math.random() * 1.2;
      tx.style.animationDuration = dur + "s";
      host.appendChild(tx);
      setTimeout(() => {
        if (bad) { tx.style.transition = "opacity .5s, transform .5s"; tx.style.opacity = 0; }
        setTimeout(() => tx.remove(), 600);
      }, dur * 1000);
    };
    for (let i = 0; i < 6; i++) setTimeout(spawn, i * 120);
    streamTimer = setInterval(spawn, 140);
  }

  function people(root, on) {
    const ppl = root.querySelectorAll("#people i");
    if (!ppl.length) return;
    ppl.forEach((p) => (p.className = ""));
    if (!on) return;
    setTimeout(() => {
      ppl.forEach((p, i) => { if (i < 2) p.className = "on"; else setTimeout(() => (p.className = "off"), Math.random() * 1600); });
    }, 900);
  }

  const charts = {};
  window.SlideFX = {
    init(goTo) { buildTimeline(goTo); buildGauge(); buildGrids(); buildOrbit(); buildSources(); buildTicker(); },
    enter(slide) {
      slide.querySelectorAll("canvas[id]").forEach((cv) => {
        if (!window.Chart || !builders[cv.id]) return;
        if (charts[cv.id]) charts[cv.id].destroy();
        charts[cv.id] = builders[cv.id](cv.getContext("2d"));
      });
      countUp(slide);
      slide.querySelectorAll("#timeline .dot, #orbit .node").forEach((g) => { if (g._fit) g._fit(); g.style.opacity = 1; });
      const gauge = slide.querySelector("#gauge");
      if (gauge && gauge._needle) setTimeout(() => (gauge._needle.style.transform = `rotate(${-90 + ((670 - 300) / 550) * 180}deg)`), 300);
      if (slide.querySelector("#ring")) ring();
      if (slide.querySelector("#stream")) stream(true);
      people(slide, true);
    },
    leave(slide) {
      slide.querySelectorAll("#timeline .dot, #orbit .node").forEach((g) => (g.style.opacity = 0));
      const gauge = slide.querySelector("#gauge");
      if (gauge && gauge._needle) gauge._needle.style.transform = "rotate(-90deg)";
      if (slide.querySelector("#stream")) stream(false);
      people(slide, false);
    },
  };
})();
