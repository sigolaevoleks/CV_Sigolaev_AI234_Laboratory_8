/*
 * Єдине джерело даних для веб-презентації та PPTX.
 * Кожне число має посилання на джерело (див. SOURCES).
 * Числа, позначені як «≈» або «оцінка», — оцінки з різних джерел.
 */
(function (root) {
  const DATA = {
    meta: {
      title: "Гроші, що думають",
      subtitle: "Роль Data Science та Data Mining у фінансах",
      lab: "Лабораторна робота №8 · Варіант 20",
      span: "1952 → 2025",
    },

    chapters: [
      { id: "I", name: "Поява", years: "1950–1980", color: "violet" },
      { id: "II", name: "Розвиток", years: "1980–2000", color: "cyan" },
      { id: "III", name: "Становлення", years: "2000–2015", color: "amber" },
      { id: "IV", name: "Сучасність", years: "2015–2025", color: "green" },
      { id: "V", name: "Що зникає", years: "далі", color: "red" },
    ],

    // Інтерактивна стрічка часу (slide = номер слайда, на який веде крапка)
    timeline: [
      { year: 1952, label: "Теорія портфеля Марковіца", ch: 0, slide: 3 },
      { year: 1956, label: "Заснування Fair Isaac", ch: 0, slide: 4 },
      { year: 1973, label: "Блек–Шоулз і біржа CBOE", ch: 0, slide: 5 },
      { year: 1988, label: "Фонд Medallion", ch: 1, slide: 6 },
      { year: 1989, label: "Універсальний бал FICO", ch: 1, slide: 4 },
      { year: 1992, label: "Нейромережа Falcon проти шахраїв", ch: 1, slide: 7 },
      { year: 1998, label: "Крах LTCM", ch: 1, slide: 8 },
      { year: 2000, label: "Гаусова копула Лі", ch: 2, slide: 10 },
      { year: 2009, label: "Пік HFT на біржах США", ch: 2, slide: 9 },
      { year: 2010, label: "Flash Crash · Betterment", ch: 2, slide: 11 },
      { year: 2012, label: "Knight Capital", ch: 2, slide: 12 },
      { year: 2017, label: "JPMorgan COiN · Goldman 600→2", ch: 3, slide: 16 },
      { year: 2018, label: "Банківський асистент Erica", ch: 3, slide: 14 },
      { year: 2023, label: "BloombergGPT · Visa $40 млрд", ch: 3, slide: 17 },
      { year: 2024, label: "EU AI Act", ch: 4, slide: 20 },
    ],

    // Слайд 4 — склад балу FICO (myFICO)
    ficoFactors: [
      { label: "Історія платежів", value: 35 },
      { label: "Сума боргу", value: 30 },
      { label: "Тривалість кредитної історії", value: 15 },
      { label: "Нові кредити", value: 10 },
      { label: "Різновиди кредитів", value: 10 },
    ],
    ficoBands: [
      { from: 300, to: 579, label: "Поганий" },
      { from: 580, to: 669, label: "Задовільний" },
      { from: 670, to: 739, label: "Добрий" },
      { from: 740, to: 799, label: "Дуже добрий" },
      { from: 800, to: 850, label: "Винятковий" },
    ],

    // Слайд 5 — опціонні контракти (OCC / CBOE), млрд контрактів на рік
    options: {
      firstDay: 911, // контрактів 26.04.1973
      firstDayStocks: 16,
      series: [
        { year: "1973", value: 0.0011, note: "≈1,1 млн" },
        { year: "2018", value: 5.14 },
        { year: "2020", value: 7.47 },
        { year: "2021", value: 9.87 },
        { year: "2022", value: 10.32 },
        { year: "2023", value: 11.1 },
        { year: "2024", value: 12.22 },
        { year: "2025", value: 15.21 },
      ],
    },

    // Слайд 6 — середня річна дохідність 1988–2018, %
    medallion: [
      { label: "Medallion (до комісій)", value: 66.1 },
      { label: "Medallion (після комісій)", value: 39.1 },
      { label: "S&P 500 (≈)", value: 10 },
    ],

    // Слайд 7 — шахрайство з картками у світі, центів на кожні $100 обороту (Nilson Report)
    fraudCents: [
      { year: 2010, value: 4.46 },
      { year: 2011, value: 5.07 },
      { year: 2012, value: 5.22 },
      { year: 2013, value: null },
      { year: 2014, value: 6.21 },
      { year: 2015, value: 6.97 },
      { year: 2016, value: 7.2 },
      { year: 2017, value: null },
      { year: 2018, value: null },
      { year: 2019, value: 6.8 },
      { year: 2020, value: 6.8 },
      { year: 2021, value: 6.61 },
      { year: 2022, value: 6.81 },
      { year: 2023, value: 6.58 },
    ],
    fraudLosses2023: 33.83, // млрд $

    // Слайд 8 — LTCM 1998
    ltcm: { equity: 4.7, assets: 125, leverage: 25, loss: 4.6, bailout: 3.6, banks: 14, months: 4 },

    // Слайд 9 — частка HFT в обсязі торгів акціями США, % (оцінки)
    hft: [
      { year: "2005", value: 20 },
      { year: "2009", value: 66, low: 40, high: 78 },
      { year: "2012", value: 50 },
      { year: "2013", value: 50 },
    ],

    // Слайд 10 — глобальна емісія CDO, млрд $ (SIFMA)
    cdo: [
      { year: "2005", value: 249.3 },
      { year: "2006", value: 488.6 },
      { year: "2007 (I–III кв.)", value: 412.3 },
    ],

    // Слайд 11 — Flash Crash 6.05.2010, індекс Dow Jones (схематично; ключові точки фактичні)
    flash: {
      prevClose: 10868.12,
      low: 9869.62,
      close: 10520.32,
      drop: 998.5,
      series: [
        { t: "09:30", v: 10868 }, { t: "10:30", v: 10790 }, { t: "11:30", v: 10760 },
        { t: "12:30", v: 10700 }, { t: "13:30", v: 10620 }, { t: "14:00", v: 10560 },
        { t: "14:15", v: 10470 }, { t: "14:30", v: 10380 }, { t: "14:40", v: 10150 },
        { t: "14:47", v: 9870 }, { t: "14:55", v: 10250 }, { t: "15:05", v: 10420 },
        { t: "15:30", v: 10480 }, { t: "16:00", v: 10520 },
      ],
    },

    // Слайд 12 — Knight Capital 01.08.2012
    knight: { loss: 440, minutes: 45, rescue: 400 },

    // Слайд 13 — витрати buy-side на альтернативні дані, млн $ (alternativedata.org)
    altData: [
      { year: "2016", value: 232 },
      { year: "2019", value: 1100 },
      { year: "2020 (прогноз)", value: 1700 },
    ],

    // Слайд 14 — Erica (Bank of America): накопичені взаємодії, млрд
    erica: [
      { t: "06.2018", v: 0 },
      { t: "10.2022", v: 1 },
      { t: "04.2024", v: 2 },
      { t: "12.2024", v: 2.5 },
    ],
    robo: { aum2024: 1.8, aum2025: 2.06 }, // трлн $ (Statista)

    // Слайд 15 — Visa
    visa: { prevented: 40, blocked: 80 },

    // Слайд 16 — JPMorgan COiN
    coin: { hours: 360000 },

    // Слайд 17 — BloombergGPT, млрд токенів
    bloombergGPT: { params: 50, finTokens: 363, genTokens: 345 },
    genaiUse: [
      { year: "2024", value: 40 },
      { year: "2025", value: 50, note: ">50%" }, // «понад половину»
    ],
    mckinsey: { low: 200, high: 340 },

    // Слайд 19 — Goldman Sachs
    goldman: { traders2000: 600, traders2017: 2, engineers: 200 },

    // Слайд 20 — збитки від збоїв моделей, млрд $
    failures: [
      { year: 1998, name: "LTCM", value: 4.6 },
      { year: 2010, name: "Flash Crash (тимчасово)", value: 1000 },
      { year: 2012, name: "Knight Capital", value: 0.44 },
    ],
  };

  /* Ілюстрація до слайда 3: випадкові портфелі з 4 активів (детермінований генератор). */
  DATA.portfolios = function (n) {
    let s = 20; // сід = номер варіанта
    const rnd = () => {
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const mu = [0.05, 0.08, 0.11, 0.15];
    const sd = [0.06, 0.12, 0.18, 0.27];
    const rho = [
      [1, 0.2, 0.1, 0.0],
      [0.2, 1, 0.35, 0.25],
      [0.1, 0.35, 1, 0.45],
      [0.0, 0.25, 0.45, 1],
    ];
    const pts = [];
    for (let k = 0; k < n; k++) {
      const w = mu.map(() => Math.pow(rnd(), 1.6));
      const sum = w.reduce((a, b) => a + b, 0);
      for (let i = 0; i < w.length; i++) w[i] /= sum;
      let r = 0, v = 0;
      for (let i = 0; i < 4; i++) {
        r += w[i] * mu[i];
        for (let j = 0; j < 4; j++) v += w[i] * w[j] * sd[i] * sd[j] * rho[i][j];
      }
      pts.push({ x: +(Math.sqrt(v) * 100).toFixed(2), y: +(r * 100).toFixed(2) });
    }
    // ефективний фронт: точки, для яких немає портфеля з більшою дохідністю та меншим ризиком
    const sorted = pts.slice().sort((a, b) => a.x - b.x);
    const frontier = [];
    let best = -Infinity;
    for (const p of sorted) if (p.y > best) { frontier.push(p); best = p.y; }
    return { pts, frontier };
  };

  DATA.sources = [
    ["Markowitz H. «Portfolio Selection», Journal of Finance, 1952; Нобелівська премія 1990", "https://www.nobelprize.org/prizes/economic-sciences/1990/summary/"],
    ["myFICO — The History of the FICO® Score; What's in my FICO Scores", "https://blog.myfico.com/history-of-the-fico-score/"],
    ["OCC — 50 років лістингових опціонів (911 контрактів у перший день CBOE)", "https://annualreport.theocc.com/2023/celebrating-50-years"],
    ["OCC — річні обсяги 2020–2025", "https://www.theocc.com/newsroom/views/2026/01-05-occ-annual-2025-and-december-2025-volume"],
    ["Zuckerman G. «The Man Who Solved the Market», 2019 (дохідність Medallion)", "https://www.institutionalinvestor.com/article/2bswymr8cih3jeaslxc00/portfolio/famed-medallion-fund-stretches-explanation-to-the-limit-professor-claims"],
    ["The Nilson Report — Card Fraud Losses Worldwide 2023", "https://nilsonreport.com/articles/card-fraud-losses-worldwide-in-2023/"],
    ["Payments Dive — Nilson: fraud-fighting efforts pay off", "https://www.paymentsdive.com/news/card-industry-fraud-fighting-efforts-pay-off-nilson-report-credit-debit/639675/"],
    ["Long-Term Capital Management (огляд справи, ФРБ Нью-Йорка, 1998)", "https://en.wikipedia.org/wiki/Long-Term_Capital_Management"],
    ["High-frequency trading — оцінки Rosenblatt Securities, TABB Group", "https://en.wikipedia.org/wiki/High-frequency_trading"],
    ["SIFMA Research Quarterly 2006 Q4, 2007 Q3 — емісія CDO", "https://www.sifma.org/wp-content/uploads/2017/05/us-research-quarterly-2007-q3.pdf"],
    ["SEC / CFTC — Findings Regarding the Market Events of May 6, 2010", "https://www.sec.gov/news/studies/2010/marketevents-report.pdf"],
    ["Fortune — Why Knight lost $440 million in 45 minutes (2012)", "https://fortune.com/2012/08/02/why-knight-lost-440-million-in-45-minutes/"],
    ["GARP — COVID-19 and the new surge in alternative data (дані AlternativeData.org)", "https://www.garp.org/risk-intelligence/technology/covid-19-and-the-new-surge-in-alternative-data"],
    ["Statista — Robo-Advisors Worldwide", "https://www.statista.com/outlook/fmo/wealth-management/digital-investment/robo-advisors/worldwide"],
    ["Bank of America — Erica surpasses 2 billion interactions (2024)", "https://newsroom.bankofamerica.com/content/newsroom/press-releases/2024/04/bofa-s-erica-surpasses-2-billion-interactions--helping-42-millio.html"],
    ["CNBC / NBC — Visa used AI to check $40 billion in fraud (2024)", "https://nbclosangeles.com/news/business/money-report/visa-employed-artificial-intelligence-to-check-40-billion-in-fraud-as-scammers-also-take-to-ai/3469402"],
    ["Bloomberg — JPMorgan software does in seconds what took lawyers 360,000 hours (2017)", "https://www.bloomberg.com/news/articles/2017-02-28/jpmorgan-marshals-an-army-of-developers-to-automate-high-finance"],
    ["Wu S. et al. «BloombergGPT: A Large Language Model for Finance», 2023", "https://arxiv.org/abs/2303.17564"],
    ["NVIDIA — State of AI in Financial Services 2024 / 2025", "https://blogs.nvidia.com/blog/ai-in-financial-services-survey-2024/"],
    ["McKinsey — Capturing the full value of generative AI in banking (2023)", "https://www.mckinsey.com/industries/financial-services/our-insights/capturing-the-full-value-of-generative-ai-in-banking"],
    ["MIT Technology Review — As Goldman embraces automation… (2017)", "https://www.technologyreview.com/2017/02/07/154141/as-goldman-embraces-automation-even-the-masters-of-the-universe-are-threatened/"],
    ["Federal Reserve — SR 11-7: Guidance on Model Risk Management (2011)", "https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm"],
    ["Регламент (ЄС) 2024/1689 — Artificial Intelligence Act, Додаток III", "https://eur-lex.europa.eu/eli/reg/2024/1689/oj"],
    ["Kitces — Robo-advisor history (Betterment 2010, Wealthfront 2011)", "https://www.kitces.com/blog/robo-advisor-growth-rates-and-valuations-crashing-from-high-client-acquisition-costs/"],
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = DATA;
  else root.DATA = DATA;
})(typeof window !== "undefined" ? window : globalThis);
