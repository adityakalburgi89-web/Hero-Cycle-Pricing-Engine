const API_BASE = 'http://localhost:5000/api';

const partSelect = document.getElementById('partSelect');
const regionSelect = document.getElementById('regionSelect');
const materialSelect = document.getElementById('materialSelect');
const calculateBtn = document.getElementById('calculateBtn');
const resultSection = document.getElementById('result');
const breakdownDiv = document.getElementById('breakdown');
const totalP = document.getElementById('total');

async function loadParts() {
  try {
    const res = await fetch(`${API_BASE}/pricing/parts`);
    const parts = await res.json();
    partSelect.innerHTML = parts.map((p) =>
      `<option value="${p.id}">${p.name} - $${p.basePrice}</option>`
    ).join('');
  } catch (err) {
    console.error('Failed to load parts:', err);
  }
}

calculateBtn.addEventListener('click', async () => {
  const selectedIds = Array.from(partSelect.selectedOptions).map((o) => Number(o.value));
  if (selectedIds.length === 0) return alert('Select at least one part.');

  try {
    const res = await fetch(`${API_BASE}/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partIds: selectedIds,
        region: regionSelect.value,
        material: materialSelect.value,
      }),
    });
    const data = await res.json();

    breakdownDiv.innerHTML = data.parts
      .map((p) => `<div class="breakdown-item"><span>${p.name}</span><span>$${p.calculatedPrice}</span></div>`)
      .join('');
    totalP.textContent = `Total: $${data.total}`;
    resultSection.classList.remove('hidden');
  } catch (err) {
    console.error('Calculation failed:', err);
  }
});

loadParts();
