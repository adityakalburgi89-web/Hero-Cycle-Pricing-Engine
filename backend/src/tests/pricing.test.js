const { describe, it } = require('node:test');
const assert = require('node:assert');
const { calculatePrice } = require('../services/pricingService');

describe('pricingService', () => {
  it('should calculate total with US region and aluminum material', () => {
    const result = calculatePrice([1], 'us', 'aluminum');
    assert.strictEqual(result.total, 200);
    assert.strictEqual(result.parts.length, 1);
  });

  it('should apply region multiplier for EU', () => {
    const result = calculatePrice([1], 'eu', 'aluminum');
    assert.strictEqual(result.total, 230);
  });

  it('should apply material multiplier for carbon', () => {
    const result = calculatePrice([3], 'us', 'carbon');
    assert.strictEqual(result.total, 225);
  });

  it('should combine region and material multipliers', () => {
    const result = calculatePrice([3], 'eu', 'carbon');
    assert.strictEqual(result.total, 258.75);
  });

  it('should calculate total for multiple parts', () => {
    const result = calculatePrice([1, 2, 3], 'us', 'aluminum');
    assert.strictEqual(result.total, 400);
    assert.strictEqual(result.parts.length, 3);
  });
});
