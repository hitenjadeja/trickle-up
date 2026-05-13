(function () {
  'use strict';

  const root = document.getElementById('two-kinds-body');
  if (!root) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const k in attrs) el.setAttribute(k, attrs[k]);
    }
    return el;
  }

  function buildWagesIcon() {
    const svg = svgEl('svg', { viewBox: '0 0 28 28', fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('circle', { cx: 14, cy: 14, r: 10, stroke: 'currentColor', 'stroke-width': 1.8 }));
    svg.appendChild(svgEl('path', { d: 'M11 11 H17 M11 14 H17 M14 8 V20', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
    return svg;
  }

  function buildAssetsIcon() {
    const svg = svgEl('svg', { viewBox: '0 0 28 28', fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('rect', { x: 4, y: 10, width: 20, height: 14, stroke: 'currentColor', 'stroke-width': 1.8 }));
    svg.appendChild(svgEl('path', { d: 'M4 14 H24', stroke: 'currentColor', 'stroke-width': 1.4 }));
    svg.appendChild(svgEl('path', { d: 'M9 17 V21 M14 17 V21 M19 17 V21', stroke: 'currentColor', 'stroke-width': 1.4, 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M8 10 L14 4 L20 10', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
    return svg;
  }

  function buildArrow() {
    const svg = svgEl('svg', { viewBox: '0 0 80 80', width: 80, height: 80, fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M10 40 H62', stroke: '#58a6ff', 'stroke-width': 3, 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M52 28 L66 40 L52 52', stroke: '#58a6ff', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    return svg;
  }

  function makeColumn(modifier, iconNode, title, desc, items) {
    const col = document.createElement('div');
    col.className = 'two-kinds__col two-kinds__col--' + modifier;

    const icon = document.createElement('div');
    icon.className = 'two-kinds__icon';
    icon.appendChild(iconNode);

    const h = document.createElement('h3');
    h.className = 'two-kinds__title';
    h.textContent = title;

    const p = document.createElement('p');
    p.className = 'two-kinds__desc';
    p.textContent = desc;

    const list = document.createElement('ul');
    list.className = 'two-kinds__list';
    items.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });

    col.appendChild(icon);
    col.appendChild(h);
    col.appendChild(p);
    col.appendChild(list);
    return col;
  }

  const wagesCol = makeColumn(
    'wages',
    buildWagesIcon(),
    'Wages',
    'You trade your time for it. The moment you stop trading, the income stops.',
    [
      'Comes from your job',
      'Heavily taxed (income tax + NI)',
      'Spent on rent, bills, food, tax',
      'Stops the day you stop working',
    ]
  );

  const assetsCol = makeColumn(
    'assets',
    buildAssetsIcon(),
    'Assets',
    'You own a thing that pays you. Property, shares, businesses, bonds. They keep paying.',
    [
      'Property, shares, businesses',
      'Lightly taxed (capital gains)',
      'Earn rent, dividends, interest',
      'Compound while you sleep',
    ]
  );

  const arrowWrap = document.createElement('div');
  arrowWrap.className = 'two-kinds__arrow';
  arrowWrap.appendChild(buildArrow());

  const grid = document.createElement('div');
  grid.className = 'two-kinds';
  grid.appendChild(wagesCol);
  grid.appendChild(arrowWrap);
  grid.appendChild(assetsCol);

  const note = document.createElement('p');
  note.className = 'footnote';
  note.textContent = 'The trickle-up dynamic begins here: every pound you spend on rent, mortgage interest, or financed goods crosses that arrow.';

  root.appendChild(grid);
  root.appendChild(note);

  function init() {}
  function update() {}

  window.TrickleChapterTwoKinds = { init, update };
})();
