(function () {
  'use strict';

  const root = document.getElementById('pullaway-body');
  if (!root) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  const START = 10000;
  const WAGE_RATE = 0.01;
  const ASSET_RATE = 0.08;
  const MAX_YEARS = 30;

  function projection(rate, years) {
    const out = [];
    for (let y = 0; y <= years; y++) out.push(START * Math.pow(1 + rate, y));
    return out;
  }

  const wageFull = projection(WAGE_RATE, MAX_YEARS);
  const assetFull = projection(ASSET_RATE, MAX_YEARS);

  // Build DOM
  const stage = document.createElement('div');
  stage.className = 'compound-stage';

  const stats = document.createElement('div');
  stats.className = 'compound-stats';

  function makeStat(labelText, valueText, modifier) {
    const box = document.createElement('div');
    box.className = 'stat';
    const lbl = document.createElement('div');
    lbl.className = 'stat__label';
    lbl.textContent = labelText;
    const val = document.createElement('div');
    val.className = 'stat__value' + (modifier ? ' stat__value--' + modifier : '');
    val.textContent = valueText;
    box.appendChild(lbl);
    box.appendChild(val);
    return { box, val };
  }

  const wageStat = makeStat('Your savings (1%/yr)', '£10,000', 'warn');
  const assetStat = makeStat('Asset wealth (8%/yr)', '£10,000', 'grow');
  stats.appendChild(wageStat.box);
  stats.appendChild(assetStat.box);

  const svg = svgEl('svg', { class: 'compound-chart', role: 'img', 'aria-label': 'Two compound growth lines from year 0 to year 30' });
  const controls = document.createElement('div');
  controls.className = 'compound-controls';

  const sliderWrap = document.createElement('div');
  sliderWrap.className = 'slider-wrap';
  const sliderLabel = document.createElement('div');
  sliderLabel.className = 'slider-wrap__label';
  sliderLabel.textContent = 'Year';
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'slider';
  slider.min = '0';
  slider.max = String(MAX_YEARS);
  slider.value = '15';
  slider.setAttribute('aria-label', 'Years from now');
  const sliderValue = document.createElement('div');
  sliderValue.className = 'slider-wrap__value';
  sliderValue.textContent = '15';
  sliderWrap.appendChild(sliderLabel);
  sliderWrap.appendChild(slider);
  sliderWrap.appendChild(sliderValue);

  const note = document.createElement('p');
  note.className = 'footnote';
  note.textContent = '7 percentage points may not look like much. Compounded over a working life, it is the entire reason your landlord owns more houses every year while you struggle to put down a deposit.';

  controls.appendChild(sliderWrap);

  stage.appendChild(stats);
  stage.appendChild(svg);
  stage.appendChild(controls);
  stage.appendChild(note);
  root.appendChild(stage);

  // Chart layout
  const margin = { top: 16, right: 12, bottom: 28, left: 56 };
  let width = 0;
  let height = 320;
  const maxValue = assetFull[MAX_YEARS] * 1.05;

  function fmt(n) {
    if (n >= 1000000) return '£' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '£' + Math.round(n / 1000) + 'k';
    return '£' + Math.round(n);
  }

  // Persistent layers
  const gridG = svgEl('g', { class: 'compound__grid' });
  const yAxisG = svgEl('g', { class: 'compound__yaxis' });
  const xAxisG = svgEl('g', { class: 'compound__xaxis' });
  const wagePathBase = svgEl('path', { fill: 'none', stroke: '#3b3a2a', 'stroke-width': 2, 'stroke-dasharray': '4 4' });
  const assetPathBase = svgEl('path', { fill: 'none', stroke: '#1f3b29', 'stroke-width': 2, 'stroke-dasharray': '4 4' });
  const wagePath = svgEl('path', { fill: 'none', stroke: '#f85149', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const assetPath = svgEl('path', { fill: 'none', stroke: '#3fb950', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const wageDot = svgEl('circle', { r: 5, fill: '#f85149', stroke: '#0f1419', 'stroke-width': 2 });
  const assetDot = svgEl('circle', { r: 5, fill: '#3fb950', stroke: '#0f1419', 'stroke-width': 2 });

  svg.appendChild(gridG);
  svg.appendChild(yAxisG);
  svg.appendChild(xAxisG);
  svg.appendChild(wagePathBase);
  svg.appendChild(assetPathBase);
  svg.appendChild(wagePath);
  svg.appendChild(assetPath);
  svg.appendChild(wageDot);
  svg.appendChild(assetDot);

  function x(yr) {
    return margin.left + (yr / MAX_YEARS) * (width - margin.left - margin.right);
  }
  function y(value) {
    return height - margin.bottom - (value / maxValue) * (height - margin.top - margin.bottom);
  }

  function buildPath(values, upToYear) {
    const segs = [];
    for (let i = 0; i <= upToYear; i++) {
      segs.push((i === 0 ? 'M' : 'L') + x(i) + ' ' + y(values[i]));
    }
    return segs.join(' ');
  }

  function buildAxes() {
    while (gridG.firstChild) gridG.removeChild(gridG.firstChild);
    while (yAxisG.firstChild) yAxisG.removeChild(yAxisG.firstChild);
    while (xAxisG.firstChild) xAxisG.removeChild(xAxisG.firstChild);

    // Y axis - 4 ticks
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const value = (maxValue / ticks) * i;
      const yy = y(value);
      const line = svgEl('line', { x1: margin.left, x2: width - margin.right, y1: yy, y2: yy, stroke: '#1c2128', 'stroke-width': 1 });
      gridG.appendChild(line);
      const t = svgEl('text', { x: margin.left - 8, y: yy + 4, 'text-anchor': 'end', fill: '#6e7681', 'font-size': 10 });
      t.textContent = fmt(value);
      yAxisG.appendChild(t);
    }
    // X axis - tick every 5 years
    for (let yr = 0; yr <= MAX_YEARS; yr += 5) {
      const xx = x(yr);
      const t = svgEl('text', { x: xx, y: height - 8, 'text-anchor': 'middle', fill: '#6e7681', 'font-size': 10 });
      t.textContent = 'Y' + yr;
      xAxisG.appendChild(t);
    }
  }

  function draw(year) {
    wagePathBase.setAttribute('d', buildPath(wageFull, MAX_YEARS));
    assetPathBase.setAttribute('d', buildPath(assetFull, MAX_YEARS));
    wagePath.setAttribute('d', buildPath(wageFull, year));
    assetPath.setAttribute('d', buildPath(assetFull, year));
    wageDot.setAttribute('cx', x(year));
    wageDot.setAttribute('cy', y(wageFull[year]));
    assetDot.setAttribute('cx', x(year));
    assetDot.setAttribute('cy', y(assetFull[year]));

    wageStat.val.textContent = fmt(wageFull[year]);
    assetStat.val.textContent = fmt(assetFull[year]);
    sliderValue.textContent = String(year);
  }

  function size() {
    width = stage.clientWidth - 32;
    if (width < 280) width = 280;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
  }

  function redraw() {
    size();
    buildAxes();
    draw(Number(slider.value));
  }

  slider.addEventListener('input', () => draw(Number(slider.value)));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(redraw, 150);
  });

  function safeRender() {
    if (!stage.clientWidth) {
      requestAnimationFrame(safeRender);
      return;
    }
    redraw();
  }

  const chapter = document.getElementById('chapter-5');
  if (chapter) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !chapter.dataset.pullawayRendered) {
          chapter.dataset.pullawayRendered = '1';
          safeRender();
        }
      });
    }, { threshold: 0.1 });
    obs.observe(chapter);
  } else {
    safeRender();
  }

  function init() {}
  function update() {}
  window.TrickleChapterPullaway = { init, update };
})();
