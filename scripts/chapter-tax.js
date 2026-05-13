(function () {
  'use strict';

  const root = document.getElementById('tax-body');
  if (!root) return;

  // Illustrative UK PAYE 2025-ish bands. Round figures.
  function calcWorkerTax(salary) {
    const personalAllowance = 12570;
    const basicTop = 50270;
    const higherTop = 125140;

    let income = 0;
    if (salary > personalAllowance) {
      const basic = Math.min(salary, basicTop) - personalAllowance;
      income += Math.max(0, basic) * 0.20;
      if (salary > basicTop) {
        const higher = Math.min(salary, higherTop) - basicTop;
        income += Math.max(0, higher) * 0.40;
      }
      if (salary > higherTop) {
        income += (salary - higherTop) * 0.45;
      }
    }

    // Employee NI (illustrative ~8% above primary threshold up to upper limit, 2% beyond)
    const niPrimary = 12570;
    const niUpper = 50270;
    let ni = 0;
    if (salary > niPrimary) {
      const band = Math.min(salary, niUpper) - niPrimary;
      ni += Math.max(0, band) * 0.08;
      if (salary > niUpper) ni += (salary - niUpper) * 0.02;
    }

    // Employer NI (illustrative ~13.8% above secondary threshold). This is paid by employer
    // but represents an additional cost on your work that comes out of total compensation.
    const employer = Math.max(0, salary - 9100) * 0.138;

    return { income, ni, employer };
  }

  function makeRow(name, label) {
    const row = document.createElement('div');
    row.className = 'tax-row';
    const title = document.createElement('div');
    title.className = 'tax-row__title';
    const titleName = document.createElement('span');
    titleName.className = 'tax-row__title-name';
    titleName.textContent = label;
    const total = document.createElement('span');
    total.className = 'tax-row__total';
    total.textContent = '0%';
    title.appendChild(titleName);
    title.appendChild(total);
    const bar = document.createElement('div');
    bar.className = 'tax-bar';
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', label + ' breakdown');
    row.appendChild(title);
    row.appendChild(bar);
    row.dataset.row = name;
    return { row, bar, total };
  }

  function makeSeg(modifier, labelText) {
    const seg = document.createElement('div');
    seg.className = 'tax-bar__seg tax-bar__seg--' + modifier;
    seg.textContent = labelText;
    return seg;
  }

  // Build static structure
  const stage = document.createElement('div');
  stage.className = 'tax-stage';

  const inputRow = document.createElement('div');
  inputRow.className = 'tax-input-row';
  const inputLabel = document.createElement('label');
  inputLabel.htmlFor = 'tax-salary';
  inputLabel.textContent = 'Your salary £';
  const input = document.createElement('input');
  input.type = 'number';
  input.id = 'tax-salary';
  input.className = 'input';
  input.min = '0';
  input.step = '1000';
  input.value = '35000';
  input.setAttribute('inputmode', 'numeric');
  inputRow.appendChild(inputLabel);
  inputRow.appendChild(input);

  const presets = document.createElement('div');
  presets.className = 'tax-presets';
  [25000, 35000, 60000, 120000].forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn--ghost btn--small';
    b.textContent = '£' + p.toLocaleString('en-GB');
    b.addEventListener('click', () => {
      input.value = String(p);
      update();
    });
    presets.appendChild(b);
  });
  inputRow.appendChild(presets);

  const workerRow = makeRow('worker', 'Your effective tax on work');
  const billionaireRow = makeRow('billionaire', 'Effective tax on a billionaire');

  // Pre-build worker bar segments
  const wIncome = makeSeg('income', '');
  const wNI = makeSeg('ni', '');
  const wEmp = makeSeg('employer', '');
  const wHome = makeSeg('takehome', 'Take-home');
  workerRow.bar.appendChild(wIncome);
  workerRow.bar.appendChild(wNI);
  workerRow.bar.appendChild(wEmp);
  workerRow.bar.appendChild(wHome);

  // Billionaire bar segments
  const bCgt = makeSeg('cgt', '');
  const bHome = makeSeg('takehome', 'Kept');
  billionaireRow.bar.appendChild(bCgt);
  billionaireRow.bar.appendChild(bHome);

  // Divider
  const divider = document.createElement('div');
  divider.className = 'tax-divider';
  divider.textContent = '?';
  divider.setAttribute('aria-hidden', 'true');

  const note = document.createElement('p');
  note.className = 'footnote';
  note.textContent = 'Wages are taxed at source: income tax, employee NI, and employer NI come straight out of what your employer spends on you. Wealth is mostly taxed only when sold (capital gains, ~24% top rate) and rarely sold. Many billionaires pay an effective rate in single digits.';

  stage.appendChild(inputRow);
  stage.appendChild(workerRow.row);
  stage.appendChild(divider);
  stage.appendChild(billionaireRow.row);
  stage.appendChild(note);
  root.appendChild(stage);

  function pct(n) { return Math.round(n * 100) + '%'; }

  function update() {
    const salary = Math.max(0, Number(input.value) || 0);
    const t = calcWorkerTax(salary);
    const totalCost = salary + t.employer;
    const totalTax = t.income + t.ni + t.employer;
    const takeHome = salary - t.income - t.ni;

    const incomePct = totalCost ? (t.income / totalCost) : 0;
    const niPct = totalCost ? (t.ni / totalCost) : 0;
    const empPct = totalCost ? (t.employer / totalCost) : 0;
    const homePct = totalCost ? (takeHome / totalCost) : 0;

    wIncome.style.width = (incomePct * 100) + '%';
    wIncome.textContent = incomePct > 0.04 ? 'Income ' + pct(incomePct) : '';
    wNI.style.width = (niPct * 100) + '%';
    wNI.textContent = niPct > 0.03 ? 'NI ' + pct(niPct) : '';
    wEmp.style.width = (empPct * 100) + '%';
    wEmp.textContent = empPct > 0.05 ? 'Employer NI ' + pct(empPct) : '';
    wHome.style.width = (homePct * 100) + '%';

    const effective = totalCost ? (totalTax / totalCost) : 0;
    workerRow.total.textContent = pct(effective) + ' goes to tax';

    // Billionaire effective rate stays roughly constant - illustrative single-digit
    const billPct = 0.10;
    bCgt.style.width = (billPct * 100) + '%';
    bCgt.textContent = 'CGT ' + pct(billPct);
    bHome.style.width = ((1 - billPct) * 100) + '%';
    billionaireRow.total.textContent = pct(billPct) + ' goes to tax';
  }

  input.addEventListener('input', update);
  update();

  function init() {}
  window.TrickleChapterTax = { init, update };
})();
