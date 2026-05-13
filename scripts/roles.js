(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function iconWorker() {
    const svg = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', stroke: 'currentColor', 'stroke-width': 1.8 }));
    svg.appendChild(svgEl('path', { d: 'M4 21c0-4 3.6-7 8-7s8 3 8 7', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
    return svg;
  }

  function iconHome() {
    const svg = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M4 11 L12 4 L20 11 V20 H4 Z', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M9 20 V14 H15 V20', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
    return svg;
  }

  function iconAsset() {
    const svg = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('rect', { x: 3, y: 9, width: 6, height: 12, stroke: 'currentColor', 'stroke-width': 1.8 }));
    svg.appendChild(svgEl('rect', { x: 9, y: 5, width: 6, height: 16, stroke: 'currentColor', 'stroke-width': 1.8 }));
    svg.appendChild(svgEl('rect', { x: 15, y: 13, width: 6, height: 8, stroke: 'currentColor', 'stroke-width': 1.8 }));
    return svg;
  }

  function iconCrown() {
    const svg = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M3 8 L7 14 L12 6 L17 14 L21 8 V18 H3 Z', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('circle', { cx: 3, cy: 8, r: 1.5, fill: 'currentColor' }));
    svg.appendChild(svgEl('circle', { cx: 12, cy: 6, r: 1.5, fill: 'currentColor' }));
    svg.appendChild(svgEl('circle', { cx: 21, cy: 8, r: 1.5, fill: 'currentColor' }));
    return svg;
  }

  function iconMagnify() {
    const svg = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('circle', { cx: 11, cy: 11, r: 6, stroke: 'currentColor', 'stroke-width': 1.8 }));
    svg.appendChild(svgEl('path', { d: 'M16 16 L20 20', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M8 11 H14 M11 8 V14', stroke: 'currentColor', 'stroke-width': 1.4, 'stroke-linecap': 'round' }));
    return svg;
  }

  function iconCheck() {
    const svg = svgEl('svg', { viewBox: '0 0 22 22', fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M5 11 L9.5 15.5 L17 7', stroke: '#0f1419', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    return svg;
  }

  function iconBuilding() {
    const svg = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' });
    svg.appendChild(svgEl('path', { d: 'M3 9 L12 4 L21 9', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M3 21 H21', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M5 21 V11 M9 21 V11 M12 21 V11 M15 21 V11 M19 21 V11', stroke: 'currentColor', 'stroke-width': 1.6 }));
    return svg;
  }

  const ICON_BUILDERS = {
    worker: iconWorker,
    home: iconHome,
    asset: iconAsset,
    crown: iconCrown,
    magnify: iconMagnify,
    building: iconBuilding,
    check: iconCheck,
  };

  function iconNode(name) {
    const fn = ICON_BUILDERS[name];
    return fn ? fn() : svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
  }

  const ROLES = [
    {
      id: 'worker',
      name: 'The Worker',
      lede: 'You earn a wage. Rent or mortgage takes most of it. Saving feels harder every year.',
      icon: 'worker',
      defaults: { salary: 35000, wealthStart: 5000, homeValue: 0, rent: 1200 },
    },
    {
      id: 'homeowner',
      name: 'The Homeowner',
      lede: 'You own your home. You feel comfortable, but your wealth sits there. It is not earning.',
      icon: 'home',
      defaults: { salary: 55000, wealthStart: 30000, homeValue: 320000, rent: 0 },
    },
    {
      id: 'asset',
      name: 'The Asset Owner',
      lede: 'You own a buy-to-let or a portfolio. Money quietly works for you while you sleep.',
      icon: 'asset',
      defaults: { salary: 80000, wealthStart: 250000, homeValue: 500000, rent: 0 },
    },
    {
      id: 'rich',
      name: 'The Super Rich',
      lede: 'Top 1%. A team of advisers runs your wealth. Your assets earn more in a day than a worker earns in a year.',
      icon: 'crown',
      defaults: { salary: 200000, wealthStart: 25000000, homeValue: 5000000, rent: 0 },
    },
    {
      id: 'sceptic',
      name: 'The Sceptic',
      lede: 'You think this might be exaggerated. Show me the numbers, then I will decide.',
      icon: 'magnify',
      defaults: { salary: 50000, wealthStart: 20000, homeValue: 250000, rent: 0 },
    },
    {
      id: 'state',
      name: 'The State',
      lede: 'You set tax policy and decide what gets funded. Most of your revenue is from working people. A chunk of your spending leaves the state as interest on borrowing.',
      icon: 'building',
      defaults: { salary: 0, wealthStart: 0, homeValue: 0, rent: 0 },
    },
  ];

  const ROLE_INDEX = Object.fromEntries(ROLES.map((r) => [r.id, r]));

  window.TrickleRoles = {
    ROLES,
    ROLE_INDEX,
    iconNode,
  };
})();
