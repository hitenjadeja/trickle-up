(function () {
  'use strict';

  const root = document.getElementById('squeeze-body');
  if (!root) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  const YEARS = 30;

  // Each role gets a tailored projection of two competing series.
  // The "squeeze" is the gap between them, role-personalised.
  const ROLE_SCENARIOS = {
    worker: {
      headline: 'Your wages flatline. Your rent does not.',
      summary: 'A typical worker sees pay rise about 1% above inflation. Rent rises about 4% above inflation. Every year you fall a little further behind.',
      lineA: { name: 'Your wages (real)', rate: 0.005, start: 35000, colour: '#58a6ff' },
      lineB: { name: 'Your rent (real)', rate: 0.04, start: 14400, colour: '#f85149' },
      stats: [
        { label: 'Year 0 ratio', mode: 'ratio0' },
        { label: 'Year 30 ratio', mode: 'ratio30' },
      ],
    },
    homeowner: {
      headline: 'Your house feels valuable. The FTSE has quietly eaten it.',
      summary: 'House prices grow about 3% above inflation. A diversified asset portfolio grows about 6-8%. You feel rich. You are slowly being left behind by the people who hold real assets.',
      lineA: { name: 'Your home value', rate: 0.03, start: 320000, colour: '#58a6ff' },
      lineB: { name: 'Diversified assets', rate: 0.07, start: 320000, colour: '#3fb950' },
      stats: [
        { label: 'Home after 30y', mode: 'aEnd' },
        { label: 'Assets after 30y', mode: 'bEnd' },
      ],
    },
    asset: {
      headline: 'Your rental income compounds. Your tenants’ rent eats their wages.',
      summary: 'A buy-to-let portfolio at ~6% net yield doubles in real terms in 12 years. Your tenants’ wages barely cover the rising rent that funds your return.',
      lineA: { name: 'Your portfolio', rate: 0.06, start: 250000, colour: '#3fb950' },
      lineB: { name: 'Tenant disposable income', rate: 0.005, start: 18000, colour: '#f85149' },
      stats: [
        { label: 'Portfolio after 30y', mode: 'aEnd' },
        { label: 'Tenant income after 30y', mode: 'bEnd' },
      ],
    },
    rich: {
      headline: 'Your wealth doubles every nine years. The economy grows at 1%.',
      summary: 'At a family-office return of around 8%, £25m becomes £250m in a single working life. The country around you grows at 1%. The gap is taken from everyone else.',
      lineA: { name: 'Your wealth', rate: 0.08, start: 25000000, colour: '#3fb950' },
      lineB: { name: 'UK GDP per head', rate: 0.01, start: 35000, colour: '#8b949e' },
      stats: [
        { label: 'Wealth after 30y', mode: 'aEnd' },
        { label: 'Multiple of GDP per head', mode: 'wealthRatio' },
      ],
    },
    sceptic: {
      headline: 'Try it both ways. The shape does not change.',
      summary: 'Even with conservative assumptions, 7-8% asset returns beat 1% wage growth on every reasonable run. Adjust the assumptions in your head if you like. The lines still diverge.',
      lineA: { name: 'Wages at 1%/yr', rate: 0.01, start: 35000, colour: '#58a6ff' },
      lineB: { name: 'Assets at 7%/yr', rate: 0.07, start: 35000, colour: '#3fb950' },
      stats: [
        { label: 'Wages × 30y', mode: 'aMult' },
        { label: 'Assets × 30y', mode: 'bMult' },
      ],
    },
    state: {
      headline: "The money you can tax is shrinking. The money you can't is running away.",
      summary: 'You tax work, which grows about 1% a year above inflation. The wealth pool, which you do not tax at all, grows about 7%. Every year the share of national wealth you can actually reach gets smaller. Eventually you have to choose: cut services, or borrow from the very people you refuse to tax.',
      lineA: { name: 'Tax revenue from work', rate: 0.01, start: 100, colour: '#58a6ff' },
      lineB: { name: 'Untaxed wealth pool', rate: 0.07, start: 350, colour: '#ffe744' },
      stats: [
        { label: 'Tax from work after 30y', mode: 'aEnd' },
        { label: 'Untaxed wealth after 30y', mode: 'bEnd' },
      ],
    },
  };

  // DOM scaffold
  const stage = document.createElement('div');
  stage.className = 'squeeze-stage';

  const header = document.createElement('div');
  header.className = 'squeeze-header';
  const headerRole = document.createElement('div');
  headerRole.className = 'squeeze-header__role';
  const headerRoleBefore = document.createElement('span');
  headerRoleBefore.textContent = 'You are ';
  const headerRoleName = document.createElement('b');
  headerRoleName.textContent = '...';
  headerRole.appendChild(headerRoleBefore);
  headerRole.appendChild(headerRoleName);
  header.appendChild(headerRole);

  const headline = document.createElement('h3');
  headline.style.margin = '0';
  headline.textContent = '';
  stage.appendChild(header);
  stage.appendChild(headline);

  const summary = document.createElement('p');
  summary.style.marginTop = '12px';
  stage.appendChild(summary);

  const svg = svgEl('svg', { class: 'squeeze-chart', role: 'img', 'aria-label': 'Two diverging 30-year projections, role-personalised' });
  stage.appendChild(svg);

  // Legend
  const legend = document.createElement('div');
  legend.style.display = 'flex';
  legend.style.gap = '24px';
  legend.style.marginTop = '12px';
  legend.style.fontFamily = 'var(--font-mono)';
  legend.style.fontSize = '12px';
  legend.style.color = 'var(--text-muted)';
  legend.style.flexWrap = 'wrap';
  const legA = document.createElement('div');
  const legASwatch = document.createElement('span');
  legASwatch.style.display = 'inline-block';
  legASwatch.style.width = '14px';
  legASwatch.style.height = '3px';
  legASwatch.style.marginRight = '8px';
  legASwatch.style.borderRadius = '2px';
  legASwatch.style.verticalAlign = 'middle';
  const legAText = document.createElement('span');
  legA.appendChild(legASwatch);
  legA.appendChild(legAText);
  const legB = document.createElement('div');
  const legBSwatch = document.createElement('span');
  legBSwatch.style.display = 'inline-block';
  legBSwatch.style.width = '14px';
  legBSwatch.style.height = '3px';
  legBSwatch.style.marginRight = '8px';
  legBSwatch.style.borderRadius = '2px';
  legBSwatch.style.verticalAlign = 'middle';
  const legBText = document.createElement('span');
  legB.appendChild(legBSwatch);
  legB.appendChild(legBText);
  legend.appendChild(legA);
  legend.appendChild(legB);
  stage.appendChild(legend);

  const sStats = document.createElement('div');
  sStats.className = 'squeeze-summary';
  stage.appendChild(sStats);

  const note = document.createElement('p');
  note.className = 'footnote';
  note.textContent = 'Scroll back to Chapter 1 to switch your role and see how the same economy looks from a different seat.';
  stage.appendChild(note);

  // Empty state when no role picked
  const emptyState = document.createElement('div');
  emptyState.style.padding = '32px';
  emptyState.style.textAlign = 'center';
  emptyState.style.background = 'var(--surface-2)';
  emptyState.style.border = '1px dashed var(--border)';
  emptyState.style.borderRadius = '8px';
  const emptyP = document.createElement('p');
  emptyP.textContent = 'Pick a role in Chapter 1 to see your personalised squeeze.';
  emptyP.style.margin = '0';
  emptyState.appendChild(emptyP);
  const emptyBtn = document.createElement('button');
  emptyBtn.type = 'button';
  emptyBtn.className = 'btn btn--ghost btn--small';
  emptyBtn.style.marginTop = '12px';
  emptyBtn.textContent = 'Go pick a role';
  emptyBtn.addEventListener('click', () => {
    const top = document.getElementById('chapter-1');
    if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  emptyState.appendChild(emptyBtn);

  root.appendChild(stage);
  root.appendChild(emptyState);

  // Chart layers
  const margin = { top: 16, right: 16, bottom: 28, left: 64 };
  let width = 0;
  const height = 280;

  const gridG = svgEl('g');
  const yAxisG = svgEl('g');
  const xAxisG = svgEl('g');
  const aPath = svgEl('path', { fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const bPath = svgEl('path', { fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const aDot = svgEl('circle', { r: 5, stroke: '#0f1419', 'stroke-width': 2 });
  const bDot = svgEl('circle', { r: 5, stroke: '#0f1419', 'stroke-width': 2 });
  svg.appendChild(gridG);
  svg.appendChild(yAxisG);
  svg.appendChild(xAxisG);
  svg.appendChild(aPath);
  svg.appendChild(bPath);
  svg.appendChild(aDot);
  svg.appendChild(bDot);

  function fmt(n) {
    if (n >= 1e9) return '£' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return '£' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '£' + Math.round(n / 1e3) + 'k';
    return '£' + Math.round(n);
  }

  function project(start, rate) {
    const out = [];
    for (let y = 0; y <= YEARS; y++) out.push(start * Math.pow(1 + rate, y));
    return out;
  }

  function size() {
    width = stage.clientWidth - 32;
    if (width < 280) width = 280;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
  }

  function x(yr) {
    return margin.left + (yr / YEARS) * (width - margin.left - margin.right);
  }

  function makeY(maxValue) {
    return (value) => height - margin.bottom - (value / maxValue) * (height - margin.top - margin.bottom);
  }

  function buildPath(values, yFn) {
    const segs = [];
    for (let i = 0; i <= YEARS; i++) {
      segs.push((i === 0 ? 'M' : 'L') + x(i) + ' ' + yFn(values[i]));
    }
    return segs.join(' ');
  }

  function buildAxes(maxValue, yFn) {
    while (gridG.firstChild) gridG.removeChild(gridG.firstChild);
    while (yAxisG.firstChild) yAxisG.removeChild(yAxisG.firstChild);
    while (xAxisG.firstChild) xAxisG.removeChild(xAxisG.firstChild);
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const value = (maxValue / ticks) * i;
      const yy = yFn(value);
      gridG.appendChild(svgEl('line', { x1: margin.left, x2: width - margin.right, y1: yy, y2: yy, stroke: '#1c2128', 'stroke-width': 1 }));
      const t = svgEl('text', { x: margin.left - 8, y: yy + 4, 'text-anchor': 'end', fill: '#6e7681', 'font-size': 10 });
      t.textContent = fmt(value);
      yAxisG.appendChild(t);
    }
    for (let yr = 0; yr <= YEARS; yr += 5) {
      const xx = x(yr);
      const t = svgEl('text', { x: xx, y: height - 8, 'text-anchor': 'middle', fill: '#6e7681', 'font-size': 10 });
      t.textContent = 'Y' + yr;
      xAxisG.appendChild(t);
    }
  }

  function renderForRole(roleId) {
    if (!roleId || !ROLE_SCENARIOS[roleId]) {
      stage.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }
    const { ROLE_INDEX } = window.TrickleRoles;
    stage.style.display = '';
    emptyState.style.display = 'none';

    const scenario = ROLE_SCENARIOS[roleId];
    headerRoleName.textContent = ROLE_INDEX[roleId] ? ROLE_INDEX[roleId].name : roleId;
    headline.textContent = scenario.headline;
    summary.textContent = scenario.summary;
    legASwatch.style.background = scenario.lineA.colour;
    legBSwatch.style.background = scenario.lineB.colour;
    legAText.textContent = scenario.lineA.name;
    legBText.textContent = scenario.lineB.name;
    aPath.setAttribute('stroke', scenario.lineA.colour);
    bPath.setAttribute('stroke', scenario.lineB.colour);
    aDot.setAttribute('fill', scenario.lineA.colour);
    bDot.setAttribute('fill', scenario.lineB.colour);

    const aVals = project(scenario.lineA.start, scenario.lineA.rate);
    const bVals = project(scenario.lineB.start, scenario.lineB.rate);
    const maxValue = Math.max(aVals[YEARS], bVals[YEARS]) * 1.1;
    size();
    const yFn = makeY(maxValue);
    buildAxes(maxValue, yFn);
    aPath.setAttribute('d', buildPath(aVals, yFn));
    bPath.setAttribute('d', buildPath(bVals, yFn));
    aDot.setAttribute('cx', x(YEARS));
    aDot.setAttribute('cy', yFn(aVals[YEARS]));
    bDot.setAttribute('cx', x(YEARS));
    bDot.setAttribute('cy', yFn(bVals[YEARS]));

    // Stats
    while (sStats.firstChild) sStats.removeChild(sStats.firstChild);
    scenario.stats.forEach((s) => {
      const box = document.createElement('div');
      box.className = 'stat';
      const lbl = document.createElement('div');
      lbl.className = 'stat__label';
      lbl.textContent = s.label;
      const val = document.createElement('div');
      val.className = 'stat__value';
      val.textContent = computeStat(s.mode, aVals, bVals);
      box.appendChild(lbl);
      box.appendChild(val);
      sStats.appendChild(box);
    });
  }

  function computeStat(mode, aVals, bVals) {
    switch (mode) {
      case 'aEnd': return fmt(aVals[YEARS]);
      case 'bEnd': return fmt(bVals[YEARS]);
      case 'aMult': return '×' + (aVals[YEARS] / aVals[0]).toFixed(1);
      case 'bMult': return '×' + (bVals[YEARS] / bVals[0]).toFixed(1);
      case 'ratio0': return (bVals[0] / aVals[0] * 100).toFixed(0) + '% of wages';
      case 'ratio30': return (bVals[YEARS] / aVals[YEARS] * 100).toFixed(0) + '% of wages';
      case 'wealthRatio': return '×' + Math.round(aVals[YEARS] / bVals[YEARS]);
      default: return '';
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderForRole(window.TrickleState.getRole()), 150);
  });

  function safeRender() {
    if (!stage.clientWidth && stage.style.display !== 'none') {
      requestAnimationFrame(safeRender);
      return;
    }
    renderForRole(window.TrickleState.getRole());
  }

  const chapter = document.getElementById('chapter-6');
  if (chapter) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) safeRender();
      });
    }, { threshold: 0.1 });
    obs.observe(chapter);
  } else {
    safeRender();
  }

  window.TrickleState.subscribe((roleId) => {
    renderForRole(roleId);
  });

  // Initial paint
  renderForRole(window.TrickleState.getRole());

  function init() {}
  window.TrickleChapterSqueeze = { init, update: renderForRole };
})();
