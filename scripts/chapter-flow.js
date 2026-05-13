(function () {
  'use strict';

  const root = document.getElementById('flow-body');
  if (!root) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // ============================================================
  // Panel 1: where YOUR £100 goes (role-aware spending Sankey)
  // ============================================================

  // Profiles: source label, middle breakdown, destination of each middle node.
  // Each profile sums to £100.
  // Destinations: ao (asset owners), gov (government services),
  //                cash (your savings), own (your own asset stack).
  const SANKEY_PROFILES = {
    worker: {
      label: "A wage earner's £100",
      sourceName: 'Your wages',
      middle: [
        { name: 'Rent / mortgage', value: 35, to: 'ao' },
        { name: 'Bills',           value: 12, to: 'ao' },
        { name: 'Food & goods',    value: 23, to: 'ao' },
        { name: 'Tax & NI',        value: 25, to: 'gov' },
        { name: 'Kept',            value: 5,  to: 'cash' },
      ],
      footnote: 'A wage earner spends almost everything they earn. £70 leaves the household every month to landlords, banks and the big companies you buy from. £25 funds the state. £5 stays as cash.',
    },
    middle: {
      label: "A homeowner's £100",
      sourceName: 'Your income',
      middle: [
        { name: 'Mortgage',     value: 18, to: 'ao' },
        { name: 'Bills',        value: 12, to: 'ao' },
        { name: 'Food & goods', value: 22, to: 'ao' },
        { name: 'Tax & NI',     value: 18, to: 'gov' },
        { name: 'Cash kept',    value: 10, to: 'cash' },
        { name: 'Reinvested',   value: 20, to: 'own' },
      ],
      footnote: 'A homeowner with savings is already a small asset owner. £20 of every £100 now grows into more wealth rather than being spent.',
    },
    asset: {
      label: "An asset owner's £100",
      sourceName: 'Your income',
      middle: [
        { name: 'Mortgage',     value: 10, to: 'ao' },
        { name: 'Bills',        value: 8,  to: 'ao' },
        { name: 'Food & goods', value: 12, to: 'ao' },
        { name: 'Tax & NI',     value: 15, to: 'gov' },
        { name: 'Reinvested',   value: 55, to: 'own' },
      ],
      footnote: 'An asset owner spends a smaller share on the basics and reinvests most of the rest. Over half of every £100 goes into more assets, which themselves keep paying.',
    },
    rich: {
      label: "The super rich's £100",
      sourceName: 'Your asset income',
      middle: [
        { name: 'Lifestyle',  value: 5,  to: 'ao' },
        { name: 'Tax',        value: 8,  to: 'gov' },
        { name: 'Reinvested', value: 87, to: 'own' },
      ],
      footnote: 'At the top, almost no income is spent. £87 of every £100 grows into more wealth. Capital gains and dividends are barely taxed compared with wages, so the state gets only a small share.',
    },
    state: {
      shape: 'state',
      label: "The government's £100",
      treasuryName: 'Government revenue',
      // Left column: where revenue comes from (sum 100).
      // No wealth tax category - the UK has no proper wealth tax.
      sources: [
        { name: 'Income tax',          value: 29, kind: 'work' },
        { name: 'National Insurance',  value: 18, kind: 'work' },
        { name: 'VAT',                 value: 15, kind: 'work' },
        { name: 'Other consumer-paid', value: 26, kind: 'work' },
        { name: 'Business taxes',      value: 12, kind: 'biz' },
      ],
      // Spending column: each item flows to one recipient (sum 100)
      spending: [
        { name: 'Pensions & welfare',   value: 25, to: 'households' },
        { name: 'NHS',                  value: 17, to: 'public' },
        { name: 'Education',            value: 10, to: 'public' },
        { name: 'Debt interest',        value: 9,  to: 'ao' },
        { name: 'Defence & policing',   value: 8,  to: 'public' },
        { name: 'Other public services',value: 31, to: 'public' },
      ],
      footnote: 'Of every £100 the state raises, £88 comes from working people and £12 from businesses. Nothing comes from wealth itself: the UK has no proper wealth tax. £9 of spending flows straight back to the wealthy as interest on government borrowing. State-owned assets have been steadily sold off to cover shortfalls.',
    },
  };

  // Map chapter-1 role id to a Sankey profile id
  const ROLE_TO_PROFILE = {
    worker: 'worker',
    homeowner: 'middle',
    asset: 'asset',
    rich: 'rich',
    state: 'state',
  };

  const DEST_LABEL = {
    ao:         'Asset owners',
    gov:        'Government services',
    cash:       'Your savings',
    own:        'Your assets',
    households: 'Households',
    public:     'Public services',
  };

  function destColour(key) {
    switch (key) {
      case 'ao':         return '#3fb950';
      case 'gov':        return '#8b949e';
      case 'cash':       return '#ffe744';
      case 'own':        return '#a371f7';
      case 'households': return '#58a6ff';
      case 'public':     return '#8b949e';
      default:           return '#f85149';
    }
  }

  function middleColour(name) {
    if (name === 'Kept' || name === 'Cash kept') return '#ffe744';
    if (name === 'Reinvested') return '#a371f7';
    return '#f85149';
  }

  function sourceColour() { return '#58a6ff'; }

  // Colour for state-Sankey source nodes by kind (left column)
  function stateSourceColour(kind) {
    switch (kind) {
      case 'work':   return '#58a6ff';
      case 'biz':    return '#8b949e';
      case 'wealth': return '#ffe744';
      default:       return '#f85149';
    }
  }

  // Build d3-sankey nodes & links from a profile.
  // Two shapes:
  //   - personal (default): source -> middle (5-6 cats) -> dest (3-4 buckets)
  //   - state: sources (6) -> treasury -> spending (6) -> recipients (3)
  function buildSankeyData(profile) {
    if (profile.shape === 'state') return buildStateSankeyData(profile);

    const nodes = [];
    const links = [];
    nodes.push({ name: profile.sourceName, kind: 'source' });
    const srcIdx = 0;

    const destOrder = [];
    profile.middle.forEach((m) => {
      if (destOrder.indexOf(m.to) < 0) destOrder.push(m.to);
    });

    const midStartIdx = nodes.length;
    profile.middle.forEach((m) => {
      nodes.push({ name: m.name, kind: 'middle' });
    });

    const destIdx = {};
    destOrder.forEach((d) => {
      destIdx[d] = nodes.length;
      nodes.push({ name: DEST_LABEL[d], kind: 'dest', destKey: d });
    });

    profile.middle.forEach((m, i) => {
      links.push({ source: srcIdx, target: midStartIdx + i, value: m.value });
    });
    profile.middle.forEach((m, i) => {
      links.push({ source: midStartIdx + i, target: destIdx[m.to], value: m.value });
    });

    return { nodes, links };
  }

  function buildStateSankeyData(profile) {
    const nodes = [];
    const links = [];

    // Column 0: revenue sources
    const sourceIdxStart = nodes.length;
    profile.sources.forEach((s) => {
      nodes.push({ name: s.name, kind: 'state-source', taxKind: s.kind });
    });

    // Column 1: treasury aggregator
    const treasuryIdx = nodes.length;
    nodes.push({ name: profile.treasuryName, kind: 'treasury' });

    // Column 2: spending categories
    const spendingIdxStart = nodes.length;
    profile.spending.forEach((s) => {
      nodes.push({ name: s.name, kind: 'state-spending' });
    });

    // Column 3: recipient buckets (only those referenced)
    const recipientOrder = [];
    profile.spending.forEach((s) => {
      if (recipientOrder.indexOf(s.to) < 0) recipientOrder.push(s.to);
    });
    const recipientIdx = {};
    recipientOrder.forEach((r) => {
      recipientIdx[r] = nodes.length;
      nodes.push({ name: DEST_LABEL[r], kind: 'dest', destKey: r });
    });

    // Links source -> treasury
    profile.sources.forEach((s, i) => {
      links.push({ source: sourceIdxStart + i, target: treasuryIdx, value: s.value });
    });
    // Links treasury -> spending
    profile.spending.forEach((s, i) => {
      links.push({ source: treasuryIdx, target: spendingIdxStart + i, value: s.value });
    });
    // Links spending -> recipient
    profile.spending.forEach((s, i) => {
      links.push({ source: spendingIdxStart + i, target: recipientIdx[s.to], value: s.value });
    });

    return { nodes, links };
  }

  function colourForNode(node) {
    if (node.kind === 'state-source') return stateSourceColour(node.taxKind);
    if (node.kind === 'treasury') return '#8b949e';
    if (node.kind === 'state-spending') return '#f85149';
    if (node.kind === 'source') return sourceColour();
    if (node.kind === 'dest') return destColour(node.destKey);
    return middleColour(node.name);
  }

  function isMobile() {
    return window.innerWidth < 760;
  }

  // ============================================================
  // Panel 1 DOM scaffolding
  // ============================================================

  const panel1 = document.createElement('div');
  panel1.className = 'flow-panel';

  const panel1Title = document.createElement('h3');
  panel1Title.className = 'flow-panel__title';
  panel1.appendChild(panel1Title);

  const sankeyHost = document.createElement('div');
  sankeyHost.className = 'sankey-host';
  panel1.appendChild(sankeyHost);

  const note1 = document.createElement('p');
  note1.className = 'footnote';
  panel1.appendChild(note1);

  root.appendChild(panel1);

  // Tooltip (shared)
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.setAttribute('role', 'tooltip');
  document.body.appendChild(tooltip);

  // ============================================================
  // Sankey rendering
  // ============================================================

  function renderSankeyInto(container, profile, opts) {
    opts = opts || {};
    const sankeyFn = (d3.sankey || (window.d3sankey && window.d3sankey.sankey));
    if (!sankeyFn) {
      console.warn('[flow] d3-sankey not loaded');
      return null;
    }

    const wrap = document.createElement('div');
    wrap.className = 'sankey-wrap' + (opts.mini ? ' sankey-wrap--mini' : '');

    if (opts.miniTitle) {
      const t = document.createElement('div');
      t.className = 'sankey-wrap__title';
      t.textContent = opts.miniTitle;
      wrap.appendChild(t);
    }

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'sankey');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', profile.label + ' Sankey diagram');
    wrap.appendChild(svg);
    container.appendChild(wrap);

    const width = wrap.clientWidth || (opts.mini ? 280 : 800);
    const mobile = isMobile();
    const height = opts.mini ? (mobile ? 220 : 260) : (mobile ? 480 : 360);

    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    const sk = sankeyFn()
      .nodeWidth(mobile || opts.mini ? 12 : 18)
      .nodePadding(mobile || opts.mini ? 10 : 22)
      .extent([[1, 1], [width - 1, height - 6]]);

    const data = buildSankeyData(profile);
    const renderData = {
      nodes: data.nodes.map((n) => Object.assign({}, n)),
      links: data.links.map((l) => Object.assign({}, l)),
    };
    sk(renderData);

    // Links
    const linkPath = d3.sankeyLinkHorizontal();
    const linksG = document.createElementNS(SVG_NS, 'g');
    linksG.setAttribute('class', 'sankey__links');
    svg.appendChild(linksG);

    renderData.links.forEach((d) => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('class', 'sankey__link');
      path.setAttribute('d', linkPath(d));
      path.setAttribute('stroke', colourForNode(d.target));
      path.setAttribute('fill', 'none');
      const finalWidth = Math.max(1, d.width);
      path.setAttribute('stroke-width', '0');
      path.setAttribute('data-target-width', finalWidth);

      path.addEventListener('mouseenter', (ev) => {
        tooltip.textContent = d.source.name + ' → ' + d.target.name + '  £' + d.value;
        tooltip.style.left = ev.pageX + 'px';
        tooltip.style.top = ev.pageY + 'px';
        tooltip.classList.add('is-visible');
      });
      path.addEventListener('mousemove', (ev) => {
        tooltip.style.left = ev.pageX + 'px';
        tooltip.style.top = ev.pageY + 'px';
      });
      path.addEventListener('mouseleave', () => tooltip.classList.remove('is-visible'));

      linksG.appendChild(path);
    });

    // Nodes
    const nodesG = document.createElementNS(SVG_NS, 'g');
    nodesG.setAttribute('class', 'sankey__nodes');
    svg.appendChild(nodesG);

    renderData.nodes.forEach((d) => {
      const g = document.createElementNS(SVG_NS, 'g');
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', d.x0);
      rect.setAttribute('y', d.y0);
      rect.setAttribute('width', d.x1 - d.x0);
      rect.setAttribute('height', Math.max(2, d.y1 - d.y0));
      rect.setAttribute('fill', colourForNode(d));
      rect.setAttribute('rx', 2);
      g.appendChild(rect);

      const total = d.value || 0;
      const isLeftHalf = d.x0 < width / 2;
      const labelX = isLeftHalf ? d.x1 + 6 : d.x0 - 6;
      const labelSize = opts.mini ? 10 : 12;
      const amountSize = opts.mini ? 9 : 11;

      const labelText = document.createElementNS(SVG_NS, 'text');
      labelText.setAttribute('class', 'sankey__node-label');
      labelText.setAttribute('x', labelX);
      labelText.setAttribute('y', (d.y0 + d.y1) / 2);
      labelText.setAttribute('dy', '0.3em');
      labelText.setAttribute('text-anchor', isLeftHalf ? 'start' : 'end');
      labelText.setAttribute('font-size', labelSize);
      labelText.textContent = d.name;
      g.appendChild(labelText);

      const amountText = document.createElementNS(SVG_NS, 'text');
      amountText.setAttribute('class', 'sankey__node-amount');
      amountText.setAttribute('x', labelX);
      amountText.setAttribute('y', (d.y0 + d.y1) / 2 + (opts.mini ? 12 : 14));
      amountText.setAttribute('dy', '0.3em');
      amountText.setAttribute('text-anchor', isLeftHalf ? 'start' : 'end');
      amountText.setAttribute('font-size', amountSize);
      amountText.textContent = '£' + total;
      g.appendChild(amountText);

      nodesG.appendChild(g);
    });

    // Animate link widths
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof gsap !== 'undefined') {
      const paths = linksG.querySelectorAll('path');
      gsap.to(paths, {
        strokeWidth: function (i, t) { return Number(t.getAttribute('data-target-width')); },
        duration: 0.9,
        delay: 0.1,
        ease: 'power2.out',
        stagger: 0.03,
      });
    } else {
      linksG.querySelectorAll('path').forEach((p) => {
        p.setAttribute('stroke-width', p.getAttribute('data-target-width'));
      });
    }

    return wrap;
  }

  // ============================================================
  // Panel 1 controller: render the right view for the active role
  // ============================================================

  function renderForRole(roleId) {
    while (sankeyHost.firstChild) sankeyHost.removeChild(sankeyHost.firstChild);

    if (roleId === 'sceptic') {
      panel1Title.textContent = 'Compare £100 across roles';
      note1.textContent = 'Same £100. Five very different stories. Hover any stream to see the amount.';

      const grid = document.createElement('div');
      grid.className = 'sankey-grid sankey-grid--five';
      sankeyHost.appendChild(grid);

      // 5 mini Sankeys: 4 personal + state
      ['worker', 'middle', 'asset', 'rich', 'state'].forEach((pid) => {
        const profile = SANKEY_PROFILES[pid];
        const tile = renderSankeyInto(grid, profile, { mini: true, miniTitle: profile.label });
        if (tile && pid === 'state') tile.classList.add('sankey-wrap--span');
      });
      return;
    }

    const profileId = ROLE_TO_PROFILE[roleId] || 'worker';
    const profile = SANKEY_PROFILES[profileId];

    panel1Title.textContent = profile.label + ' goes here';
    note1.textContent = profile.footnote;
    renderSankeyInto(sankeyHost, profile, { mini: false });
  }

  // ============================================================
  // Panel 2: where THEIR £100 comes from (income composition)
  // ============================================================

  const INCOME_PROFILES = [
    { id: 'worker', name: 'Worker', segments: [
      { src: 'wages', value: 100 },
    ]},
    { id: 'middle', name: 'Middle (homeowner)', segments: [
      { src: 'wages', value: 80 },
      { src: 'cgt', value: 15 },
      { src: 'div', value: 5 },
    ]},
    { id: 'asset', name: 'Asset owner', segments: [
      { src: 'wages', value: 40 },
      { src: 'rent', value: 30 },
      { src: 'cgt', value: 20 },
      { src: 'div', value: 10 },
    ]},
    { id: 'rich', name: 'Super rich', segments: [
      { src: 'cgt', value: 50 },
      { src: 'div', value: 30 },
      { src: 'rent', value: 15 },
      { src: 'int', value: 5 },
    ]},
    { id: 'state', name: 'The state (tax revenue)', segments: [
      { src: 'workTax', value: 88 },
      { src: 'bizTax', value: 12 },
    ]},
  ];

  const INCOME_SOURCES = {
    wages:   { label: 'Wages',          colour: '#58a6ff' },
    rent:    { label: 'Rent received',  colour: '#f85149' },
    cgt:     { label: 'Capital gains',  colour: '#ffe744' },
    div:     { label: 'Dividends',      colour: '#3fb950' },
    int:     { label: 'Interest',       colour: '#8b949e' },
    workTax: { label: 'Tax on work',    colour: '#58a6ff' },
    bizTax:  { label: 'Business taxes', colour: '#8b949e' },
  };

  const panel2 = document.createElement('div');
  panel2.className = 'flow-panel flow-panel--bars';

  const panel2Title = document.createElement('h3');
  panel2Title.className = 'flow-panel__title';
  panel2Title.textContent = 'Their £100 comes from here';
  panel2.appendChild(panel2Title);

  const panel2Lede = document.createElement('p');
  panel2Lede.className = 'flow-panel__lede';
  panel2Lede.textContent = 'Each bar is £100 of income. The lower you are on the ladder, the more of it you trade your time for. At the top, almost none of it comes from work.';
  panel2.appendChild(panel2Lede);

  const legend = document.createElement('div');
  legend.className = 'income-legend';
  // Only show the 5 unique colour swatches. The state row uses the same
  // colour family (blue for tax on work, grey for business, yellow for wealth)
  // so its inline segment labels do the disambiguation.
  ['wages', 'rent', 'cgt', 'div', 'int'].forEach((src) => {
    const item = document.createElement('span');
    item.className = 'income-legend__item';
    const swatch = document.createElement('span');
    swatch.className = 'income-legend__swatch';
    swatch.style.background = INCOME_SOURCES[src].colour;
    const label = document.createElement('span');
    label.textContent = INCOME_SOURCES[src].label;
    item.appendChild(swatch);
    item.appendChild(label);
    legend.appendChild(item);
  });
  panel2.appendChild(legend);

  const barsWrap = document.createElement('div');
  barsWrap.className = 'income-bars';

  function buildIncomeRow(profile) {
    const row = document.createElement('div');
    row.className = 'income-row';
    row.dataset.profileId = profile.id;

    const head = document.createElement('div');
    head.className = 'income-row__head';
    const nameEl = document.createElement('div');
    nameEl.className = 'income-row__name';
    nameEl.textContent = profile.name;
    const youTag = document.createElement('span');
    youTag.className = 'income-row__you';
    youTag.textContent = '← you';
    head.appendChild(nameEl);
    head.appendChild(youTag);

    const bar = document.createElement('div');
    bar.className = 'income-bar';
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', profile.name + ' income composition');

    profile.segments.forEach((seg) => {
      const src = INCOME_SOURCES[seg.src];
      const segEl = document.createElement('div');
      segEl.className = 'income-bar__seg';
      segEl.style.background = src.colour;
      segEl.style.width = '0%';
      segEl.dataset.targetWidth = seg.value;
      segEl.dataset.src = seg.src;

      const segLabel = document.createElement('span');
      segLabel.className = 'income-bar__seg-label';
      segLabel.textContent = src.label + ' £' + seg.value;
      segEl.appendChild(segLabel);

      segEl.addEventListener('mouseenter', (ev) => {
        tooltip.textContent = profile.name + ' · ' + src.label + ' £' + seg.value;
        tooltip.style.left = ev.pageX + 'px';
        tooltip.style.top = ev.pageY + 'px';
        tooltip.classList.add('is-visible');
      });
      segEl.addEventListener('mousemove', (ev) => {
        tooltip.style.left = ev.pageX + 'px';
        tooltip.style.top = ev.pageY + 'px';
      });
      segEl.addEventListener('mouseleave', () => tooltip.classList.remove('is-visible'));

      bar.appendChild(segEl);
    });

    row.appendChild(head);
    row.appendChild(bar);
    return row;
  }

  INCOME_PROFILES.forEach((p) => barsWrap.appendChild(buildIncomeRow(p)));
  panel2.appendChild(barsWrap);

  const note2 = document.createElement('p');
  note2.className = 'footnote';
  note2.textContent = 'The same £100 of income, four very different lives. This is why taxing work hits the worker hardest and the super rich barely at all - they are not taking a wage.';
  panel2.appendChild(note2);

  root.appendChild(panel2);

  function animateBars() {
    const segs = barsWrap.querySelectorAll('.income-bar__seg');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof gsap === 'undefined') {
      segs.forEach((s) => { s.style.width = s.dataset.targetWidth + '%'; });
      return;
    }
    gsap.to(segs, {
      width: function (i, t) { return t.dataset.targetWidth + '%'; },
      duration: 1.0,
      ease: 'power2.out',
      stagger: 0.05,
      delay: 0.1,
    });
  }

  function applyRoleHighlight(roleId) {
    const profileId = ROLE_TO_PROFILE[roleId];
    Array.from(barsWrap.querySelectorAll('.income-row')).forEach((row) => {
      row.classList.toggle('is-you', row.dataset.profileId === profileId);
    });
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  function safeRender() {
    if (!sankeyHost.clientWidth) {
      requestAnimationFrame(safeRender);
      return;
    }
    renderForRole(window.TrickleState.getRole());
  }

  const chapter = document.getElementById('chapter-3');
  let barsAnimated = false;
  if (chapter) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !chapter.dataset.flowRendered) {
          chapter.dataset.flowRendered = '1';
          safeRender();
        }
        if (e.isIntersecting && !barsAnimated) {
          barsAnimated = true;
          animateBars();
        }
      });
    }, { threshold: 0.1 });
    obs.observe(chapter);
  } else {
    safeRender();
    animateBars();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (chapter && chapter.dataset.flowRendered) {
        renderForRole(window.TrickleState.getRole());
      }
    }, 200);
  });

  // Subscribe to role changes - re-render Sankey AND highlight income bar
  if (window.TrickleState && typeof window.TrickleState.subscribe === 'function') {
    window.TrickleState.subscribe((roleId) => {
      if (chapter && chapter.dataset.flowRendered) {
        renderForRole(roleId);
      }
      applyRoleHighlight(roleId);
    });
    applyRoleHighlight(window.TrickleState.getRole());
  }

  function init() {}
  function update() {}
  window.TrickleChapterFlow = { init, update };
})();
