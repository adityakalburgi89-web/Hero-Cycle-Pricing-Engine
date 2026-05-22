const Part = require('../models/Part');
const PricingHistory = require('../models/PricingHistory');

async function calculatePrice(partIds, date) {
  const queryDate = date ? new Date(date) : new Date();

  const parts = await Part.find({ _id: { $in: partIds } });

  let total = 0;
  const breakdown = [];

  for (const part of parts) {
    const history = await PricingHistory.findOne({
      partId: part._id,
      date: { $lte: queryDate },
    }).sort({ date: -1 });

    const effectivePrice = history ? history.price : part.basePrice;
    total += effectivePrice;

    breakdown.push({
      partId: part._id,
      name: part.name,
      category: part.category,
      basePrice: part.basePrice,
      effectivePrice,
      priceAtDate: history ? history.price : null,
    });
  }

  return { total: Math.round(total * 100) / 100, parts: breakdown, queriedDate: queryDate };
}

async function getPricingHistory(partId) {
  return PricingHistory.find({ partId }).sort({ date: -1 });
}

module.exports = { calculatePrice, getPricingHistory };
