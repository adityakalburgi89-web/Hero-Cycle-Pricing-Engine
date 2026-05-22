const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const Part = require('../backend/models/Part');
const { calculatePrice } = require('../backend/services/pricingService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hero_cycle_pricing_test';

before(async () => {
  await mongoose.connect(MONGO_URI);
  await Part.deleteMany({});
});

describe('pricingService', () => {
  it('should use price from matching history entry', async () => {
    const [part] = await Part.insertMany([
      {
        name: 'Frame',
        component: 'frame',
        priceHistory: [
          { validFrom: new Date('2023-01-01'), validUntil: null, price: 200 },
        ],
      },
    ]);

    const result = await calculatePrice([part._id], '2024-06-01');
    assert.strictEqual(result.total, 200);
  });

  it('should use updated price after validFrom date', async () => {
    const [part] = await Part.insertMany([
      {
        name: 'Frame',
        component: 'frame',
        priceHistory: [
          { validFrom: new Date('2023-01-01'), validUntil: new Date('2024-12-31'), price: 200 },
          { validFrom: new Date('2025-01-01'), validUntil: null, price: 220 },
        ],
      },
    ]);

    const result = await calculatePrice([part._id], '2025-06-01');
    assert.strictEqual(result.total, 220);
  });

  it('should sum prices for multiple parts', async () => {
    const parts = await Part.insertMany([
      {
        name: 'Frame',
        component: 'frame',
        priceHistory: [{ validFrom: new Date('2023-01-01'), validUntil: null, price: 200 }],
      },
      {
        name: 'Wheel Set',
        component: 'wheels',
        priceHistory: [{ validFrom: new Date('2023-01-01'), validUntil: null, price: 150 }],
      },
    ]);

    const result = await calculatePrice(parts.map((p) => p._id));
    assert.strictEqual(result.total, 350);
    assert.strictEqual(result.parts.length, 2);
  });
});
