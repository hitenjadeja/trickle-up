(function () {
  'use strict';

  const root = document.getElementById('debt-body');
  if (!root) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function iconHouse() {
    const svg = svgEl('svg', { viewBox: '0 0 32 32', width: 32, height: 32, fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M5 14 L16 5 L27 14 V27 H5 Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M12 27 V19 H20 V27', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    return svg;
  }
  function iconCard() {
    const svg = svgEl('svg', { viewBox: '0 0 32 32', width: 32, height: 32, fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('rect', { x: 4, y: 8, width: 24, height: 16, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }));
    svg.appendChild(svgEl('path', { d: 'M4 13 H28', stroke: 'currentColor', 'stroke-width': 2 }));
    svg.appendChild(svgEl('rect', { x: 8, y: 17, width: 6, height: 4, fill: 'currentColor' }));
    return svg;
  }
  function iconCar() {
    const svg = svgEl('svg', { viewBox: '0 0 32 32', width: 32, height: 32, fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M5 18 L8 11 H24 L27 18 V23 H5 Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('circle', { cx: 10, cy: 23, r: 2.5, fill: 'currentColor' }));
    svg.appendChild(svgEl('circle', { cx: 22, cy: 23, r: 2.5, fill: 'currentColor' }));
    return svg;
  }
  function iconBook() {
    const svg = svgEl('svg', { viewBox: '0 0 32 32', width: 32, height: 32, fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M6 6 H18 A4 4 0 0 1 22 10 V26 H10 A4 4 0 0 1 6 22 Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M10 11 H18 M10 15 H18 M10 19 H16', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
    return svg;
  }
  function iconBank() {
    const svg = svgEl('svg', { viewBox: '0 0 32 32', width: 32, height: 32, fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M4 12 L16 5 L28 12', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M6 12 V24 M11 12 V24 M16 12 V24 M21 12 V24 M26 12 V24', stroke: 'currentColor', 'stroke-width': 1.8 }));
    svg.appendChild(svgEl('path', { d: 'M3 27 H29', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }));
    return svg;
  }
  function iconFund() {
    const svg = svgEl('svg', { viewBox: '0 0 32 32', width: 32, height: 32, fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('circle', { cx: 16, cy: 16, r: 11, stroke: 'currentColor', 'stroke-width': 2 }));
    svg.appendChild(svgEl('path', { d: 'M16 9 V16 L21 19', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }));
    return svg;
  }
  function iconGov() {
    const svg = svgEl('svg', { viewBox: '0 0 32 32', width: 32, height: 32, fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M5 12 L16 5 L27 12', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M5 27 H27 M9 12 V25 M16 12 V25 M23 12 V25', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }));
    return svg;
  }

  const DEBT_TYPES = [
    {
      id: 'mortgage',
      label: 'Mortgage',
      youIcon: iconHouse,
      ownerIcon: iconBank,
      youDetail: 'Monthly mortgage interest',
      ownerName: 'A bank',
      ownerDetail: 'Earns interest, owns the deed until you finish',
      flow: '£800/mo interest →',
    },
    {
      id: 'card',
      label: 'Credit card',
      youIcon: iconCard,
      ownerIcon: iconBank,
      youDetail: 'Revolving balance at 25% APR',
      ownerName: 'A card issuer',
      ownerDetail: 'High-margin lending, owned by shareholders',
      flow: '~£250/mo interest →',
    },
    {
      id: 'car',
      label: 'Car loan',
      youIcon: iconCar,
      ownerIcon: iconFund,
      youDetail: 'Monthly payment + depreciation',
      ownerName: 'A finance house',
      ownerDetail: 'Often packaged into bonds and resold',
      flow: '£300/mo →',
    },
    {
      id: 'student',
      label: 'Student loan',
      youIcon: iconBook,
      ownerIcon: iconGov,
      youDetail: '9% of income above the threshold',
      ownerName: 'The state',
      ownerDetail: 'Increasingly sold to private investors',
      flow: '9% of income →',
    },
  ];

  let activeId = DEBT_TYPES[0].id;

  // Build static structure
  const stage = document.createElement('div');
  stage.className = 'debt-stage';

  const toggleWrap = document.createElement('div');
  toggleWrap.className = 'debt-toggle';
  const toggleGroup = document.createElement('div');
  toggleGroup.className = 'toggle-group';
  toggleGroup.setAttribute('role', 'tablist');
  toggleGroup.setAttribute('aria-label', 'Debt type');
  toggleWrap.appendChild(toggleGroup);

  DEBT_TYPES.forEach((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toggle-group__btn';
    btn.dataset.debtId = t.id;
    btn.setAttribute('role', 'tab');
    btn.textContent = t.label;
    btn.addEventListener('click', () => setActive(t.id));
    toggleGroup.appendChild(btn);
  });

  const diagram = document.createElement('div');
  diagram.className = 'debt-diagram';

  function makeSide(modifier, labelText) {
    const wrap = document.createElement('div');
    wrap.className = 'debt-side debt-side--' + modifier;
    const label = document.createElement('div');
    label.className = 'debt-side__label';
    label.textContent = labelText;
    const icon = document.createElement('div');
    icon.className = 'debt-side__icon';
    const name = document.createElement('p');
    name.className = 'debt-side__name';
    const detail = document.createElement('p');
    detail.className = 'debt-side__detail';
    wrap.appendChild(label);
    wrap.appendChild(icon);
    wrap.appendChild(name);
    wrap.appendChild(detail);
    return { wrap, icon, name, detail };
  }

  const youSide = makeSide('you', 'You');
  const flow = document.createElement('div');
  flow.className = 'debt-flow';
  const flowLine = document.createElement('div');
  flowLine.className = 'debt-flow__line';
  const flowPulse = document.createElement('div');
  flowPulse.className = 'debt-flow__pulse';
  flowLine.appendChild(flowPulse);
  const flowAmount = document.createElement('div');
  flowAmount.className = 'debt-flow__amount';
  flow.appendChild(flowAmount);
  flow.appendChild(flowLine);
  const ownerSide = makeSide('owner', 'Asset owner');

  diagram.appendChild(youSide.wrap);
  diagram.appendChild(flow);
  diagram.appendChild(ownerSide.wrap);

  const note = document.createElement('p');
  note.className = 'footnote';
  note.textContent = 'On the other side of every debt is an income. The asset owners on the right are the people receiving your monthly payment, every month, for years.';

  stage.appendChild(toggleWrap);
  stage.appendChild(diagram);
  stage.appendChild(note);
  root.appendChild(stage);

  function setActive(id) {
    activeId = id;
    const t = DEBT_TYPES.find((d) => d.id === id);
    if (!t) return;

    Array.from(toggleGroup.children).forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.debtId === id);
      btn.setAttribute('aria-selected', btn.dataset.debtId === id ? 'true' : 'false');
    });

    while (youSide.icon.firstChild) youSide.icon.removeChild(youSide.icon.firstChild);
    youSide.icon.appendChild(t.youIcon());
    youSide.name.textContent = t.label;
    youSide.detail.textContent = t.youDetail;

    while (ownerSide.icon.firstChild) ownerSide.icon.removeChild(ownerSide.icon.firstChild);
    ownerSide.icon.appendChild(t.ownerIcon());
    ownerSide.name.textContent = t.ownerName;
    ownerSide.detail.textContent = t.ownerDetail;

    flowAmount.textContent = t.flow;
  }

  setActive(activeId);

  function init() {}
  function update() {}
  window.TrickleChapterDebt = { init, update };
})();
