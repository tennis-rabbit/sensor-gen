document.addEventListener('DOMContentLoaded', function () {

  var navLinksWrap = document.querySelector('.nav-links');
  var toggle = document.querySelector('.nav-toggle');
  var sectionLinks = document.querySelectorAll('.nav-links a[data-section]');

  /* ---- Mobile menu ---- */
  if (toggle && navLinksWrap) {
    toggle.addEventListener('click', function () {
      navLinksWrap.classList.toggle('open');
    });
  }

  /* ---- Close mobile menu after navigating ---- */
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (navLinksWrap) navLinksWrap.classList.remove('open');
    });
  });
  document.querySelector('.nav-brand').addEventListener('click', function () {
    if (navLinksWrap) navLinksWrap.classList.remove('open');
  });

  /* ---- Dropdown (click to toggle, outside-click to close) ---- */
  document.querySelectorAll('.dropdown-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var parent = this.closest('.nav-dropdown');
      var wasOpen = parent.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); });
      if (!wasOpen) parent.classList.add('open');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); });
  });

  /* ---- Scrollspy: highlight the nav link of the section in view ---- */
  var sections = [];
  sectionLinks.forEach(function (link) {
    var sec = document.getElementById(link.getAttribute('data-section'));
    if (sec) sections.push({ link: link, sec: sec });
  });

  function setActive(id) {
    sectionLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-section') === id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s.sec); });
  }

});

/* ============ Overview: range chart + modality grid + count-up ============ */
document.addEventListener('DOMContentLoaded', function () {

  var DOMAINS = {
    'Emergency Department': { color: 'var(--dom-emergency)', icon: 'fa-ambulance' },
    'Daily Life':           { color: 'var(--dom-daily)',     icon: 'fa-walking' },
    'Lab Study':            { color: 'var(--dom-lab)',       icon: 'fa-flask' },
    'Operation Room':       { color: 'var(--dom-operation)', icon: 'fa-heartbeat' }
  };
  var DS = [
    { n: 'MIMIC-IV ECG', d: 'Emergency Department', freq: 100,     span: 10,     seq: 1000 },
    { n: 'PPG-DaLiA',    d: 'Daily Life',           freq: 100,     span: 60,     seq: 6000 },
    { n: 'SHHS',         d: 'Lab Study',            freq: 64,      span: 30,     seq: 1920 },
    { n: 'PhyMER',       d: 'Lab Study',            freq: 256,     span: 5,      seq: 1280 },
    { n: 'CAPTURE-24',   d: 'Daily Life',           freq: 30,      span: 30,     seq: 900  },
    { n: 'VitalDB',      d: 'Operation Room',       freq: 100,     span: 30,     seq: 3000 },
    { n: 'Metabonet',    d: 'Daily Life',           freq: 0.00333, span: 604800, seq: 2016 }
  ];
  var AXES = { freq: { min: 0.0033, max: 256 }, seq: { min: 100, max: 10000 }, span: { min: 5, max: 604800 } };
  function pct(v, ax) { var lo = Math.log(ax.min), hi = Math.log(ax.max); return (Math.log(v) - lo) / (hi - lo) * 100; }
  function fmtFreq(v) { return v < 1 ? (v * 1000).toFixed(2).replace(/\.?0+$/, '') + ' mHz' : v + ' Hz'; }
  function fmtSpan(s) { if (s >= 86400) return (s / 86400) + ' day' + (s / 86400 > 1 ? 's' : ''); if (s >= 60) return (s / 60) + ' min'; return s + ' s'; }
  function fmtSeq(s) { return s.toLocaleString() + ' steps'; }
  var FMT = { freq: fmtFreq, seq: fmtSeq, span: fmtSpan };

  var chart = document.getElementById('rangeChart');
  if (chart) {
    var allDots = [];
    ['freq', 'seq', 'span'].forEach(function (key) {
      var track = chart.querySelector('.range-row[data-axis="' + key + '"] .range-track');
      if (!track) return;
      var items = DS.map(function (x) { return { x: x, p: pct(x[key], AXES[key]) }; }).sort(function (a, b) { return a.p - b.p; });
      var laneLast = []; // last pct placed per lane
      items.forEach(function (it, i) {
        var lane = 0;
        for (; lane < laneLast.length; lane++) { if (it.p - laneLast[lane] > 6) break; }
        laneLast[lane] = it.p;
        var off = lane === 0 ? 0 : (lane % 2 ? -1 : 1) * Math.ceil(lane / 2) * 15;
        var dot = document.createElement('span');
        dot.className = 'range-dot';
        dot.style.left = (3 + Math.max(0, Math.min(100, it.p)) * 0.94) + '%';
        dot.style.top = 'calc(50% + ' + off + 'px)';
        dot.style.background = DOMAINS[it.x.d].color;
        dot.setAttribute('title', it.x.n + ' · ' + FMT[key](it.x[key]));
        track.appendChild(dot);
        allDots.push(dot);
      });
    });
    var lg = document.getElementById('rangeLegend');
    if (lg) {
      Object.keys(DOMAINS).forEach(function (d) {
        var s = document.createElement('span'); s.className = 'lg';
        s.innerHTML = '<span class="sw" style="background:' + DOMAINS[d].color + '"></span>' + d;
        lg.appendChild(s);
      });
    }
    var popped = false;
    function popDots() {
      if (popped) return; popped = true;
      chart.classList.add('in'); // grows the baselines
      allDots.forEach(function (d, idx) { setTimeout(function () { d.classList.add('pop'); }, 120 + idx * 22); });
    }
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { popDots(); cio.disconnect(); } }); }, { threshold: 0.2 });
      cio.observe(chart);
      setTimeout(popDots, 2600); // safety net — dots always appear
    } else { popDots(); }
  }

  /* ---- modality grid ---- */
  var MODS = [
    { k: 'ECG',     i: 'fa-heartbeat',        ds: ['MIMIC-IV ECG', 'PPG-DaLiA', 'SHHS', 'VitalDB'] },
    { k: 'EEG',     i: 'fa-brain',            ds: ['SHHS', 'PhyMER', 'VitalDB'] },
    { k: 'PPG',     i: 'fa-tint',             ds: ['PPG-DaLiA', 'PhyMER', 'VitalDB'] },
    { k: 'IMU',     i: 'fa-running',          ds: ['CAPTURE-24'] },
    { k: 'EMG',     i: 'fa-dumbbell',         ds: ['SHHS'] },
    { k: 'EOG',     i: 'fa-eye',              ds: ['SHHS'] },
    { k: 'HR',      i: 'fa-heart',            ds: ['PPG-DaLiA'] },
    { k: 'EDA',     i: 'fa-hand-paper',       ds: ['PhyMER'] },
    { k: 'TEMP',    i: 'fa-thermometer-half', ds: ['PhyMER'] },
    { k: 'BP',      i: 'fa-tachometer-alt',   ds: ['VitalDB'] },
    { k: 'AirFlow', i: 'fa-wind',             ds: ['VitalDB'] },
    { k: 'CGM',     i: 'fa-vial',             ds: ['Metabonet'] }
  ];
  var DOM_MODS = [
    { d: 'Emergency Department', mk: ['ECG'] },
    { d: 'Daily Life',           mk: ['ECG', 'PPG', 'HR', 'IMU', 'CGM'] },
    { d: 'Lab Study',            mk: ['ECG', 'EEG', 'EMG', 'EOG', 'PPG', 'EDA', 'TEMP'] },
    { d: 'Operation Room',       mk: ['ECG', 'PPG', 'EEG', 'BP', 'AirFlow'] }
  ];
  var modBody = document.getElementById('modBody');
  var modDetail = document.getElementById('modDetail');
  var modPanel = modBody ? modBody.closest('.mod-panel') : null;

  function modByKey(k) { for (var i = 0; i < MODS.length; i++) if (MODS[i].k === k) return MODS[i]; return null; }
  function itemEl(m) {
    var el = document.createElement('button');
    el.type = 'button'; el.className = 'mod-item'; el.setAttribute('data-mod', m.k);
    el.innerHTML = '<span class="mod-ico"><i class="fas ' + m.i + '"></i></span><span class="mod-name">' + m.k + '</span>';
    return el;
  }
  function renderModality() {
    modBody.innerHTML = '';
    var grid = document.createElement('div'); grid.className = 'mod-body-inner'; grid.style.display = 'contents';
    MODS.forEach(function (m) { modBody.appendChild(itemEl(m)); });
  }
  function renderDomain() {
    modBody.innerHTML = '';
    modBody.style.display = 'block';
    DOM_MODS.forEach(function (g) {
      var wrap = document.createElement('div'); wrap.className = 'mod-group';
      wrap.innerHTML = '<div class="mod-group-title"><i class="fas ' + DOMAINS[g.d].icon + '" style="color:' + DOMAINS[g.d].color + '"></i>' + g.d + '</div>';
      var row = document.createElement('div'); row.className = 'mod-group-row';
      g.mk.forEach(function (k) { var m = modByKey(k); if (m) row.appendChild(itemEl(m)); });
      wrap.appendChild(row); modBody.appendChild(wrap);
    });
  }
  function setView(view) {
    if (view === 'domain') { modBody.className = 'mod-body domain'; renderDomain(); }
    else { modBody.className = 'mod-body'; modBody.style.display = ''; renderModality(); }
    if (modDetail) { modDetail.hidden = true; }
    if (modPanel) modPanel.classList.remove('picked');
  }
  function showDetail(m) {
    if (!modDetail) return;
    var doms = Object.keys(DOMAINS).filter(function (d) { return DOM_MODS.some(function (g) { return g.d === d && g.mk.indexOf(m.k) !== -1; }); });
    modDetail.innerHTML =
      '<div class="md-head"><i class="fas ' + m.i + '"></i>' + m.k + '</div>' +
      '<div><strong>Datasets:</strong> ' + m.ds.map(function (n) { return '<span class="chip">' + n + '</span>'; }).join('') + '</div>' +
      '<div style="margin-top:.5rem"><strong>Domains:</strong> ' + doms.map(function (n) { return '<span class="chip">' + n + '</span>'; }).join('') + '</div>';
    modDetail.hidden = false;
    if (modPanel) modPanel.classList.add('picked');
  }
  if (modBody) {
    renderModality();
    modBody.addEventListener('click', function (e) {
      var item = e.target.closest('.mod-item'); if (!item) return;
      var k = item.getAttribute('data-mod'); var m = modByKey(k); if (!m) return;
      modBody.querySelectorAll('.mod-item.active').forEach(function (x) { x.classList.remove('active'); });
      modBody.querySelectorAll('.mod-item[data-mod="' + k + '"]').forEach(function (x) { x.classList.add('active'); });
      showDetail(m);
    });
    document.querySelectorAll('.mod-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.mod-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        setView(tab.getAttribute('data-view'));
      });
    });
  }

  /* ---- stat-strip count-up ---- */
  var strip = document.querySelector('.stat-strip');
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCounts(root) {
    root.querySelectorAll('.stat-num').forEach(function (el) {
      var target = parseInt(el.textContent, 10); if (isNaN(target)) return;
      var t0 = null, dur = 1100;
      function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); el.textContent = Math.round(easeOut(p) * target); if (p < 1) requestAnimationFrame(step); else el.textContent = target; }
      requestAnimationFrame(step);
    });
  }
  if (strip && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en, o) { en.forEach(function (e) { if (e.isIntersecting) { animateCounts(strip); o.disconnect(); } }); }, { threshold: 0.4 }).observe(strip);
  }

});

/* ============ Scroll reveal (progressive enhancement) ============ */
document.addEventListener('DOMContentLoaded', function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sel = '.eyebrow, .section-title, .section-lead, .section-note, .grid-label, .theme-head, ' +
            '.card, .table-figure, .range-chart, .mod-panel, .coverage, .feature-row, .feature-figure, ' +
            '.gallery > figure, .resource-card, .content-card, .bibtex-block';
  var els = [].slice.call(document.querySelectorAll(sel));
  if (!els.length) return;
  document.documentElement.classList.add('js-anim');
  els.forEach(function (el) { el.setAttribute('data-reveal', ''); });

  function reveal(el) {
    var p = el.parentElement;
    if (p) {
      var sibs = [].filter.call(p.children, function (c) { return c.nodeType === 1 && c.hasAttribute('data-reveal'); });
      var i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i, 4) * 0.06 + 's';
    }
    el.classList.add('in');
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
    // safety net — never leave content hidden if the observer misses
    setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 3000);
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }
});

/* ============ Findings: whole claim is a click-to-reveal button ============ */
document.addEventListener('DOMContentLoaded', function () {
  var rows = document.querySelectorAll('#findings .feature-row');
  rows.forEach(function (row) {
    var body = row.querySelector('.feature-body');
    var media = row.querySelector('.feature-media');
    if (!body || !media) return;
    row.classList.add('collapsible');
    body.classList.add('clickable');
    body.setAttribute('role', 'button');
    body.setAttribute('tabindex', '0');
    body.setAttribute('aria-expanded', 'false');
    var cue = document.createElement('span');
    cue.className = 'evidence-toggle';
    cue.innerHTML = 'See the evidence <i class="fas fa-chevron-down chev"></i>';
    body.appendChild(cue);
    function toggle() {
      var open = row.classList.toggle('open');
      body.setAttribute('aria-expanded', open ? 'true' : 'false');
      cue.firstChild.textContent = (open ? 'Hide the evidence ' : 'See the evidence ');
    }
    body.addEventListener('click', toggle);
    body.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
});

/* ============ Coverage panel (task categories + domains) ============ */
document.addEventListener('DOMContentLoaded', function () {
  var covBody = document.getElementById('covBody');
  if (!covBody) return;
  var CATS = [
    { k: 'interp', name: 'Interpolation & Extrapolation', pct: 72.6, color: 'var(--cat-interp)', icon: 'fa-chart-line',
      settings: [['Sleep-Signal Imputation', 7141233], ['Medication-Aware Forecasting', 1031103], ['Cardiac-Signal Forecasting', 2149]] },
    { k: 's2s', name: 'Semantic-to-Signal', pct: 9.6, color: 'var(--cat-s2s)', icon: 'fa-font',
      settings: [['Text-to-ECG Generation', 760618], ['Activity-to-IMU Generation', 307246], ['Emotion-to-EEG Generation', 15338]] },
    { k: 'trans', name: 'Translation', pct: 9.5, color: 'var(--cat-trans)', icon: 'fa-exchange-alt',
      settings: [['Invasive Blood Pressure Reconstruction', 625441], ['Glucose Signal Translation', 424085], ['Peripheral-to-EEG Translation', 15290], ['PPG-to-ECG Translation', 2150]] },
    { k: 'edit', name: 'Editing', pct: 8.4, color: 'var(--cat-edit)', icon: 'fa-pen-nib',
      settings: [['Glucose Signal Super-Resolution', 424085], ['ECG Editing', 227265], ['ECG Denoising', 227265], ['IMU Editing', 62108]] }
  ];
  var DOMS = [
    { name: 'Lab Study', count: 7157000, color: 'var(--dom-lab)', icon: 'fa-flask' },
    { name: 'Operation Room', count: 1031000, color: 'var(--dom-operation)', icon: 'fa-heartbeat' },
    { name: 'Emergency Department', count: 761000, color: 'var(--dom-emergency)', icon: 'fa-ambulance' },
    { name: 'Daily Life', count: 733000, color: 'var(--dom-daily)', icon: 'fa-walking' }
  ];
  var LOGMIN = Math.log(1000), LOGMAX = Math.log(8000000);
  function barPct(c) { return Math.max(4, Math.min(100, (Math.log(c) - LOGMIN) / (LOGMAX - LOGMIN) * 100)); }
  function fmt(n) { if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M'; if (n >= 1e3) return Math.round(n / 1e3) + 'K'; return '' + n; }
  function total(c) { return c.settings.reduce(function (s, x) { return s + x[1]; }, 0); }

  function renderCats() {
    covBody.innerHTML = '';
    CATS.forEach(function (c) {
      var row = document.createElement('div'); row.className = 'cov-row'; row.setAttribute('data-cat', c.k);
      var body = c.settings.map(function (s) {
        return '<div class="cov-set"><div class="sn">' + s[0] + '</div>' +
          '<div class="cov-sbar"><span data-w="' + barPct(s[1]) + '%" style="background:' + c.color + '"></span></div>' +
          '<div class="cov-sc">' + s[1].toLocaleString() + '</div></div>';
      }).join('');
      row.innerHTML =
        '<div class="cov-head"><div class="cov-cat"><span class="ci" style="background:' + c.color + '"><i class="fas ' + c.icon + '"></i></span>' + c.name + '</div>' +
        '<div class="cov-track"><span data-w="' + c.pct + '%" style="background:' + c.color + '"></span></div>' +
        '<div class="cov-metawrap"><div class="cov-meta">' + c.pct + '%<small>' + fmt(total(c)) + ' samples</small></div><i class="cov-chev fas fa-chevron-down"></i></div></div>' +
        '<div class="cov-body">' + body + '</div>';
      row.querySelector('.cov-head').addEventListener('click', function () {
        var open = row.classList.contains('open');
        covBody.querySelectorAll('.cov-row.open').forEach(function (r) { r.classList.remove('open'); });
        if (!open) { row.classList.add('open'); growRow(row); }
      });
      covBody.appendChild(row);
    });
  }
  function renderDoms() {
    covBody.innerHTML = '';
    var max = Math.max.apply(null, DOMS.map(function (d) { return d.count; }));
    DOMS.forEach(function (d) {
      var row = document.createElement('div'); row.className = 'cov-row';
      row.innerHTML =
        '<div class="cov-head plain"><div class="cov-cat"><span class="ci" style="background:' + d.color + '"><i class="fas ' + d.icon + '"></i></span>' + d.name + '</div>' +
        '<div class="cov-track"><span data-w="' + Math.max(6, d.count / max * 100) + '%" style="background:' + d.color + '"></span></div>' +
        '<div class="cov-metawrap"><div class="cov-meta">' + fmt(d.count) + '<small>windows</small></div></div></div>';
      covBody.appendChild(row);
    });
  }
  var hint = document.querySelector('.cov-hint');
  function growSpans(spans) {
    function apply() { spans.forEach(function (s) { var w = s.getAttribute('data-w'); if (w) s.style.width = w; }); }
    requestAnimationFrame(function () { requestAnimationFrame(apply); }); // smooth grow in real browsers
    setTimeout(apply, 450); // reliable end-state fallback
  }
  function growTop() { growSpans([].slice.call(covBody.querySelectorAll('.cov-head .cov-track > span'))); }
  function growRow(row) { growSpans([].slice.call(row.querySelectorAll('.cov-sbar > span'))); }

  renderCats();
  document.querySelectorAll('.cov-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.cov-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      if (tab.getAttribute('data-view') === 'dom') {
        renderDoms(); if (hint) hint.textContent = 'Bars are sized by the number of windows per domain.';
      } else {
        renderCats(); if (hint) hint.textContent = 'Bars are sized by the number of available samples. Click a category to see its settings.';
      }
      growTop();
    });
  });

  // grow the top-level bars when the panel first scrolls into view (with safety net)
  var covPanel = document.getElementById('coverage');
  var grown = false;
  function firstGrow() { if (grown) return; grown = true; growTop(); }
  if ('IntersectionObserver' in window && covPanel) {
    var pio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { firstGrow(); pio.disconnect(); } }); }, { threshold: 0.15 });
    pio.observe(covPanel);
    setTimeout(firstGrow, 2600);
  } else { firstGrow(); }

  /* task cards: expand/collapse; the "Explore coverage" cue drives the panel */
  document.querySelectorAll('.task-card[data-cat]').forEach(function (card) {
    card.classList.add('collapsible');
    card.setAttribute('aria-expanded', 'false');
    card.insertAdjacentHTML('beforeend', '<i class="task-chev fas fa-chevron-down" aria-hidden="true"></i>');
    card.insertAdjacentHTML('beforeend', '<span class="task-explore">Explore coverage <i class="fas fa-arrow-right"></i></span>');
    function toggle() {
      var open = card.classList.toggle('open');
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    card.querySelector('.task-explore').addEventListener('click', function (e) {
      e.stopPropagation();
      var catTab = document.querySelector('.cov-tab[data-view="cat"]');
      if (catTab && !catTab.classList.contains('active')) { catTab.click(); }
      var row = covBody.querySelector('.cov-row[data-cat="' + card.getAttribute('data-cat') + '"]');
      if (row) {
        covBody.querySelectorAll('.cov-row.open').forEach(function (r) { r.classList.remove('open'); });
        row.classList.add('open');
        growRow(row);
        document.getElementById('coverage').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
});
