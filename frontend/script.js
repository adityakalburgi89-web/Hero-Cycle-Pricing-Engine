const API = 'http://localhost:5000/api';

const dropdownsEl = document.getElementById('dropdowns');
const dateInput = document.getElementById('dateInput');
const calculateBtn = document.getElementById('calculateBtn');
const resultSection = document.getElementById('result');
const breakdownDiv = document.getElementById('breakdown');
const totalP = document.getElementById('total');
const dateInfoP = document.getElementById('dateInfo');

const componentLabels = {
  frame: 'Frame',
  handlebar: 'Handlebar',
  brakes: 'Brakes',
  wheels: 'Wheels',
  chain: 'Chain Assembly',
  seating: 'Seating',
};

const componentOrder = ['frame', 'handlebar', 'brakes', 'wheels', 'chain', 'seating'];

function latestPrice(part) {
  const sorted = [...part.priceHistory].sort(
    (a, b) => new Date(b.validFrom) - new Date(a.validFrom)
  );
  return sorted.length > 0 ? sorted[0].price : 0;
}

function formatPartName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildDropdowns(parts) {
  const grouped = {};
  for (const part of parts) {
    if (!grouped[part.component]) grouped[part.component] = [];
    grouped[part.component].push(part);
  }

  dropdownsEl.innerHTML = componentOrder
    .map((comp) => {
      const compParts = grouped[comp] || [];
      const label = componentLabels[comp] || comp;

      const options = compParts
        .map(
          (p) =>
            `<option value="${p.name}">${formatPartName(p.name)} — $${latestPrice(p)}</option>`
        )
        .join('');

      return `
        <div class="field">
          <label for="comp-${comp}">${label}</label>
          <select id="comp-${comp}" class="part-select">
            <option value="">— Select —</option>
            ${options}
          </select>
        </div>
      `;
    })
    .join('');
}

calculateBtn.addEventListener('click', async () => {
  const selects = document.querySelectorAll('.part-select');
  const selected = [];

  for (const sel of selects) {
    if (sel.value) selected.push(sel.value);
  }

  if (selected.length === 0) return alert('Select at least one component.');

  const date = dateInput.value || undefined;

  const res = await fetch(`${API}/pricing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, parts: selected }),
  });

  const data = await res.json();

  breakdownDiv.innerHTML = data.parts
    .map(
      (p) =>
        `<div class="breakdown-row">
          <div>
            <span class="part-name">${formatPartName(p.name)}</span>
            <span class="part-component">${p.component}</span>
          </div>
          <span class="part-price">$${p.effectivePrice}</span>
        </div>`
    )
    .join('');

  totalP.textContent = `Total: $${data.total}`;
  dateInfoP.textContent = `Pricing as of ${new Date(data.queriedDate).toLocaleDateString()}`;
  resultSection.classList.remove('hidden');
});

async function init() {
  const res = await fetch(`${API}/pricing/parts`);
  const parts = await res.json();
  buildDropdowns(parts);
}

init();
