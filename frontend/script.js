const API = 'http://localhost:5000/api';

const partSelect = document.getElementById('partSelect');
const dateInput = document.getElementById('dateInput');
const calculateBtn = document.getElementById('calculateBtn');
const resultSection = document.getElementById('result');
const breakdownDiv = document.getElementById('breakdown');
const totalP = document.getElementById('total');
const dateInfoP = document.getElementById('dateInfo');
const historySection = document.getElementById('history');
const historyList = document.getElementById('historyList');

function latestPrice(part) {
  const sorted = [...part.priceHistory].sort(
    (a, b) => new Date(b.validFrom) - new Date(a.validFrom)
  );
  return sorted.length > 0 ? sorted[0].price : 0;
}

async function loadParts() {
  const res = await fetch(`${API}/pricing/parts`);
  const parts = await res.json();
  partSelect.innerHTML = parts
    .map(
      (p) =>
        `<option value="${p.name}">${p.name} - $${latestPrice(p)}</option>`
    )
    .join('');
}

calculateBtn.addEventListener('click', async () => {
  const selected = Array.from(partSelect.selectedOptions).map((o) => o.value);
  if (!selected.length) return alert('Select at least one part.');

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
        `<div class="breakdown-item"><span>${p.name} (${p.component})</span><span>$${p.effectivePrice}</span></div>`
    )
    .join('');
  totalP.textContent = `Total: $${data.total}`;
  dateInfoP.textContent = `Pricing as of: ${new Date(data.queriedDate).toLocaleDateString()}`;
  resultSection.classList.remove('hidden');
});

partSelect.addEventListener('change', async () => {
  const selected = Array.from(partSelect.selectedOptions);
  if (selected.length === 1) {
    const partName = selected[0].value;
    const res = await fetch(`${API}/pricing/history/${partName}`);
    const history = await res.json();
    if (history.length) {
      historyList.innerHTML = history
        .map(
          (h) =>
            `<div class="history-entry">
              <span>${new Date(h.validFrom).toLocaleDateString()} ${h.validUntil ? '→ ' + new Date(h.validUntil).toLocaleDateString() : '→ present'}</span>
              <span>$${h.price}</span>
            </div>`
        )
        .join('');
      historySection.classList.remove('hidden');
      return;
    }
  }
  historySection.classList.add('hidden');
});

loadParts();
