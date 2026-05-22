const Part = require('../models/Part');

function findPriceAtDate(priceHistory, queryDate) {
  const valid = priceHistory
    .filter((entry) => entry.validFrom <= queryDate)
    .sort((a, b) => b.validFrom - a.validFrom);

  return valid.length > 0 ? valid[0] : null;
}

async function calculatePrice({ date, partNames }) {
  const queryDate = date ? new Date(date) : new Date();

  const parts = await Part.find({ name: { $in: partNames } });

  let total = 0;
  const breakdown = [];

  for (const part of parts) {
    const matched = findPriceAtDate(part.priceHistory, queryDate);
    const effectivePrice = matched ? matched.price : 0;

    total += effectivePrice;

    breakdown.push({
      name: part.name,
      component: part.component,
      effectivePrice,
      matchedFrom: matched ? matched.validFrom : null,
      matchedUntil: matched ? matched.validUntil : null,
    });
  }

  return {
    total: Math.round(total * 100) / 100,
    parts: breakdown,
    queriedDate: queryDate,
  };
}

async function getPricingHistory(partName) {
  const part = await Part.findOne({ name: partName });
  return part ? part.priceHistory.sort((a, b) => b.validFrom - a.validFrom) : [];
}

module.exports = { calculatePrice, getPricingHistory };
