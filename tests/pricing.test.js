const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const Part = require('../backend/models/Part');
const { calculatePrice } = require('../backend/services/pricingService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hero_cycle_pricing_test';

beforeEach(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 2000
      });
      global.useMockDb = false;
    } catch (err) {
      console.warn(`\n⚠️  Test MongoDB connection failed: ${err.message}`);
      console.warn('⚡ Falling back to in-memory Mock Database for tests!\n');
      global.useMockDb = true;
    }
  }
  await Part.deleteMany({});
});

describe('pricingService', () => {
  it('should return price for a part valid on the given date', async () => {
    await Part.insertMany([
      {
        name: 'steel_frame',
        component: 'frame',
        priceHistory: [
          { validFrom: new Date('2015-01-01'), validUntil: null, price: 200 },
        ],
      },
    ]);

    const result = await calculatePrice({
      date: '2016-12-15',
      partNames: ['steel_frame'],
    });

    assert.strictEqual(result.total, 200);
    assert.strictEqual(result.parts[0].component, 'frame');
  });

  it('should use the correct price entry for a date range', async () => {
    await Part.insertMany([
      {
        name: 'steel_frame',
        component: 'frame',
        priceHistory: [
          { validFrom: new Date('2015-01-01'), validUntil: new Date('2020-12-31'), price: 180 },
          { validFrom: new Date('2021-01-01'), validUntil: null, price: 200 },
        ],
      },
    ]);

    const oldPrice = await calculatePrice({
      date: '2016-12-15',
      partNames: ['steel_frame'],
    });
    assert.strictEqual(oldPrice.total, 180);

    const newPrice = await calculatePrice({
      date: '2022-06-01',
      partNames: ['steel_frame'],
    });
    assert.strictEqual(newPrice.total, 200);
  });

  it('should calculate total across multiple parts', async () => {
    await Part.insertMany([
      {
        name: 'steel_frame',
        component: 'frame',
        priceHistory: [{ validFrom: new Date('2015-01-01'), validUntil: null, price: 200 }],
      },
      {
        name: 'tubeless_tyre',
        component: 'wheels',
        priceHistory: [{ validFrom: new Date('2015-06-01'), validUntil: null, price: 120 }],
      },
    ]);

    const result = await calculatePrice({
      date: '2016-12-15',
      partNames: ['steel_frame', 'tubeless_tyre'],
    });

    assert.strictEqual(result.total, 320);
    assert.strictEqual(result.parts.length, 2);
  });

  it('should handle parts that are not found gracefully', async () => {
    await Part.insertMany([
      {
        name: 'steel_frame',
        component: 'frame',
        priceHistory: [{ validFrom: new Date('2015-01-01'), validUntil: null, price: 200 }],
      },
    ]);

    const result = await calculatePrice({
      date: '2016-12-15',
      partNames: ['steel_frame', 'nonexistent_part'],
    });

    assert.strictEqual(result.parts.length, 1);
    assert.strictEqual(result.total, 200);
  });
});
