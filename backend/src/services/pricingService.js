const { parts } = require('../data/seedData');

const REGION_MULTIPLIERS = { us: 1.0, eu: 1.15, asia: 0.9 };
const MATERIAL_MULTIPLIERS = { aluminum: 1.0, steel: 0.85, carbon: 1.5, leather: 1.2 };

function calculatePrice(partIds, region, material) {
  const regionMultiplier = REGION_MULTIPLIERS[region] || 1.0;
  const materialMultiplier = MATERIAL_MULTIPLIERS[material] || 1.0;

  let total = 0;
  const selectedParts = [];

  for (const id of partIds) {
    const part = parts.find((p) => p.id === id);
    if (!part) continue;
    const price = part.basePrice * materialMultiplier * regionMultiplier;
    total += price;
    selectedParts.push({ ...part, calculatedPrice: Math.round(price * 100) / 100 });
  }

  return {
    total: Math.round(total * 100) / 100,
    parts: selectedParts,
    appliedMultipliers: { region: regionMultiplier, material: materialMultiplier },
  };
}

module.exports = { calculatePrice };
