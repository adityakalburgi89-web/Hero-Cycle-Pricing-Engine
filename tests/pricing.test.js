const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const Part = require('../backend/models/Part');
const PricingHistory = require('../backend/models/PricingHistory');
const { calculatePrice } = require('../backend/services/pricingService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hero_cycle_pricing_test';

before(async () => {
  await mongoose.connect(MONGO_URI);
  await Part.deleteMany({});
  await PricingHistory.deleteMany({});
});

describe('pricingService', () => {
  it('should calculate total from base prices', async () => {
    const parts = await Part.insertMany([
      { name: 'Frame', category: 'frame', basePrice: 200 },
      { name: 'Wheel Set', category: 'wheels', basePrice: 150 },
    ]);

    const result = await calculatePrice(parts.map((p) => p._id));
    assert.strictEqual(result.total, 350);
    assert.strictEqual(result.parts.length, 2);
  });

  it('should use pricing history when available', async () => {
    const [part] = await Part.insertMany([
      { name: 'Saddle', category: 'saddle', basePrice: 30 },
    ]);

    await PricingHistory.create({
      partId: part._id,
      price: 45,
      date: new Date('2025-01-01'),
      note: 'Price increase',
    });

    const result = await calculatePrice([part._id], '2025-06-01');
    assert.strictEqual(result.total, 45);
  });
});
