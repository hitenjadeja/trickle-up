(function () {
  'use strict';

  const root = document.getElementById('fix-body');
  if (!root) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  const RATE = 0.08;
  const YEARS = 20;

  const PRESETS = [
    { id: 'low', label: '£50k', value: 50000 },
    { id: 'mid', label: '£500k', value: 500000 },
    { id: 'high', label: '£5m', value: 5000000 },
    { id: 'rich', label: '£50m', value: 50000000 },
  ];

  function project(start) {
    const out = [];
    for (let y = 0; y <= YEARS; y++) out.push(start * Math.pow(1 + RATE, y));
    return out;
  }

  function fmt(n) {
    if (n >= 1e9) return '£' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return '£' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '£' + Math.round(n / 1e3) + 'k';
    return '£' + Math.round(n);
  }

  // Build static structure
  const stage = document.createElement('div');
  stage.className = 'sim-stage';

  const buttons = document.createElement('div');
  buttons.className = 'sim-buttons';
  PRESETS.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sim-button';
    btn.dataset.presetId = p.id;
    btn.dataset.startValue = String(p.value);
    btn.textContent = p.label;
    btn.addEventListener('click', () => setActive(p.id));
    buttons.appendChild(btn);
  });

  const svg = svgEl('svg', { class: 'sim-chart', role: 'img', 'aria-label': 'Asset value over 20 years' });

  const result = document.createElement('div');
  result.className = 'sim-result';
  const resFrom = document.createElement('div');
  resFrom.className = 'sim-result__from';
  const resMult = document.createElement('div');
  resMult.className = 'sim-result__multiple';
  const resTo = document.createElement('div');
  resTo.className = 'sim-result__to';
  result.appendChild(resFrom);
  result.appendChild(resMult);
  result.appendChild(resTo);

  const conclusion = document.createElement('div');
  conclusion.className = 'fix-conclusion';
  const conclusionP = document.createElement('p');
  conclusionP.textContent = 'A 2% wealth tax on assets above £10m would raise around £24bn a year without touching working incomes. That is roughly the cost of restoring per-pupil school funding to 2010 levels.';
  conclusion.appendChild(conclusionP);

  const note = document.createElement('p');
  note.className = 'footnote';
  note.textContent = 'At an 8% return, £50,000 grows to a comfortable retirement. £50,000,000 grows to roughly the GDP of a small island nation. Same percentage. Different universes.';

  stage.appendChild(buttons);
  stage.appendChild(svg);
  stage.appendChild(result);
  stage.appendChild(conclusion);
  stage.appendChild(note);
  root.appendChild(stage);

  // Share + further reading
  const share = document.createElement('div');
  share.className = 'share-block';
  const shareTitle = document.createElement('h3');
  shareTitle.textContent = 'Share this story';
  const shareButtons = document.createElement('div');
  shareButtons.className = 'share-buttons';

  const shareText = 'Trickle Up: a 10-minute story about wealth, work, and where the money really goes.';
  function getShareUrl() {
    if (window.location.protocol === 'file:') return 'https://example.com/trickle-up';
    return window.location.href.split('#')[0];
  }

  function makeShareBtn(label, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn';
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  shareButtons.appendChild(makeShareBtn('Copy link', async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied');
    } catch (err) {
      showToast('Copy failed - select address bar instead');
    }
  }));

  function openShareUrl(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const xBtn = document.createElement('a');
  xBtn.className = 'btn btn--ghost';
  xBtn.textContent = 'Share on X';
  xBtn.target = '_blank';
  xBtn.rel = 'noopener noreferrer';
  shareButtons.appendChild(xBtn);

  const waBtn = document.createElement('a');
  waBtn.className = 'btn btn--ghost';
  waBtn.textContent = 'Share on WhatsApp';
  waBtn.target = '_blank';
  waBtn.rel = 'noopener noreferrer';
  shareButtons.appendChild(waBtn);

  function refreshShareLinks() {
    const url = getShareUrl();
    xBtn.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(url);
    waBtn.href = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + url);
  }
  refreshShareLinks();

  const reading = document.createElement('div');
  reading.className = 'further-reading';
  const readingTitle = document.createElement('h3');
  readingTitle.textContent = 'Go deeper';
  reading.appendChild(readingTitle);
  const links = [
    { href: 'https://www.youtube.com/@garyseconomics', text: 'Gary Stevenson on YouTube (Gary’s Economics)' },
    { href: 'https://www.penguin.co.uk/books/451471/the-trading-game-by-stevenson-gary/9781847927248', text: 'The Trading Game (book) by Gary Stevenson' },
    { href: 'https://www.resolutionfoundation.org/publications/?type=publications&topic=wealth', text: 'Resolution Foundation on wealth and inequality' },
  ];
  links.forEach((l) => {
    const a = document.createElement('a');
    a.href = l.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = l.text;
    reading.appendChild(a);
  });

  const restart = document.createElement('button');
  restart.type = 'button';
  restart.className = 'btn btn--ghost';
  restart.textContent = 'Start over';
  restart.style.marginTop = '24px';
  restart.addEventListener('click', () => {
    const top = document.getElementById('chapter-1');
    if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  share.appendChild(shareTitle);
  share.appendChild(shareButtons);
  share.appendChild(reading);
  share.appendChild(restart);
  root.appendChild(share);

  // Toast
  const toast = document.getElementById('share-toast');
  let toastTimer;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  // Chart
  const margin = { top: 12, right: 16, bottom: 28, left: 60 };
  let width = 0;
  const height = 280;

  const gridG = svgEl('g');
  const yAxisG = svgEl('g');
  const xAxisG = svgEl('g');
  const linePath = svgEl('path', { fill: 'none', stroke: '#3fb950', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  const areaPath = svgEl('path', { fill: 'rgba(63, 185, 80, 0.15)' });
  const endDot = svgEl('circle', { r: 6, fill: '#3fb950', stroke: '#0f1419', 'stroke-width': 2 });

  svg.appendChild(gridG);
  svg.appendChild(yAxisG);
  svg.appendChild(xAxisG);
  svg.appendChild(areaPath);
  svg.appendChild(linePath);
  svg.appendChild(endDot);

  let activeId = 'low';
  let currentValues = project(PRESETS[0].value);
  let currentMax = currentValues[YEARS] * 1.1;

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
  function y(value) {
    return height - margin.bottom - (value / currentMax) * (height - margin.top - margin.bottom);
  }

  function buildAxes() {
    while (gridG.firstChild) gridG.removeChild(gridG.firstChild);
    while (yAxisG.firstChild) yAxisG.removeChild(yAxisG.firstChild);
    while (xAxisG.firstChild) xAxisG.removeChild(xAxisG.firstChild);

    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const value = (currentMax / ticks) * i;
      const yy = y(value);
      const line = svgEl('line', { x1: margin.left, x2: width - margin.right, y1: yy, y2: yy, stroke: '#1c2128', 'stroke-width': 1 });
      gridG.appendChild(line);
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

  function buildLine(values) {
    const segs = [];
    for (let i = 0; i <= YEARS; i++) {
      segs.push((i === 0 ? 'M' : 'L') + x(i) + ' ' + y(values[i]));
    }
    return segs.join(' ');
  }

  function buildArea(values) {
    const top = buildLine(values);
    const bottomRight = 'L' + x(YEARS) + ' ' + (height - margin.bottom);
    const bottomLeft = 'L' + x(0) + ' ' + (height - margin.bottom) + ' Z';
    return top + ' ' + bottomRight + ' ' + bottomLeft;
  }

  function animateTo(values) {
    currentValues = values;
    currentMax = values[YEARS] * 1.1;
    size();
    buildAxes();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || typeof gsap === 'undefined') {
      linePath.setAttribute('d', buildLine(values));
      areaPath.setAttribute('d', buildArea(values));
      endDot.setAttribute('cx', x(YEARS));
      endDot.setAttribute('cy', y(values[YEARS]));
      return;
    }

    // Animate by progressively building the path
    const counter = { y: 0 };
    gsap.to(counter, {
      y: YEARS,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate() {
        const upTo = Math.max(1, Math.round(counter.y));
        const partial = values.slice(0, upTo + 1);
        // pad partial to YEARS for axes consistency? we draw to upTo only
        const segs = [];
        for (let i = 0; i <= upTo; i++) segs.push((i === 0 ? 'M' : 'L') + x(i) + ' ' + y(values[i]));
        const path = segs.join(' ');
        linePath.setAttribute('d', path);
        const areaSegs = path + ' L' + x(upTo) + ' ' + (height - margin.bottom) + ' L' + x(0) + ' ' + (height - margin.bottom) + ' Z';
        areaPath.setAttribute('d', areaSegs);
        endDot.setAttribute('cx', x(upTo));
        endDot.setAttribute('cy', y(values[upTo]));
      },
    });
  }

  function updateResult(start, end) {
    resFrom.textContent = 'Start: ';
    const fromB = document.createElement('b');
    fromB.textContent = fmt(start);
    while (resFrom.children.length) resFrom.removeChild(resFrom.lastChild);
    resFrom.textContent = 'Start: ';
    resFrom.appendChild(fromB);

    resTo.textContent = 'After 20 years: ';
    const toB = document.createElement('b');
    toB.textContent = fmt(end);
    while (resTo.children.length) resTo.removeChild(resTo.lastChild);
    resTo.textContent = 'After 20 years: ';
    resTo.appendChild(toB);

    const mult = end / start;
    resMult.textContent = '×' + mult.toFixed(1) + ' growth';
  }

  function setActive(id) {
    activeId = id;
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    Array.from(buttons.children).forEach((b) => b.classList.toggle('is-active', b.dataset.presetId === id));
    const values = project(preset.value);
    animateTo(values);
    updateResult(preset.value, values[YEARS]);
  }

  function safeRender() {
    if (!stage.clientWidth) {
      requestAnimationFrame(safeRender);
      return;
    }
    setActive(activeId);
  }

  const chapter = document.getElementById('chapter-8');
  if (chapter) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !chapter.dataset.fixRendered) {
          chapter.dataset.fixRendered = '1';
          safeRender();
        }
      });
    }, { threshold: 0.1 });
    obs.observe(chapter);
  } else {
    safeRender();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (chapter && chapter.dataset.fixRendered) {
        size();
        buildAxes();
        linePath.setAttribute('d', buildLine(currentValues));
        areaPath.setAttribute('d', buildArea(currentValues));
        endDot.setAttribute('cx', x(YEARS));
        endDot.setAttribute('cy', y(currentValues[YEARS]));
      }
      refreshShareLinks();
    }, 150);
  });

  function init() {}
  function update() {}
  window.TrickleChapterFix = { init, update };
})();
