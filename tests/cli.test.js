const { describe, it } = require('node:test');
const assert = require('node:assert');
const Part = require('../cli/src/Part');
const Catalog = require('../cli/src/Catalog');
const PricingEngine = require('../cli/src/PricingEngine');

describe('CLI - Part Model', () => {
  it('should construct a Part instance with parsed dates and numeric prices', () => {
    const part = new Part({
      name: 'steel_frame',
      component: 'Frame',
      priceHistory: [
        { validFrom: '2015-01-01', validUntil: '2016-05-31', price: '1000' },
        { validFrom: '2016-06-01', validUntil: null, price: '1200' }
      ]
    });

    assert.strictEqual(part.name, 'steel_frame');
    assert.strictEqual(part.component, 'Frame');
    assert.ok(part.priceHistory[0].validFrom instanceof Date);
    assert.strictEqual(part.priceHistory[0].price, 1000);
    assert.strictEqual(part.priceHistory[1].price, 1200);
  });

  it('should resolve correct price for dates within matching ranges', () => {
    const part = new Part({
      name: 'steel_frame',
      component: 'Frame',
      priceHistory: [
        { validFrom: '2015-01-01', validUntil: '2016-05-31', price: 1000 },
        { validFrom: '2016-06-01', validUntil: null, price: 1200 }
      ]
    });

    // Test a date during the first price tier
    assert.strictEqual(part.getPriceAtDate('2015-06-15'), 1000);

    // Test the exact boundary date of first tier
    assert.strictEqual(part.getPriceAtDate('2016-05-31'), 1000);

    // Test the exact start date of second tier
    assert.strictEqual(part.getPriceAtDate('2016-06-01'), 1200);

    // Test a date during the second price tier
    assert.strictEqual(part.getPriceAtDate('2026-05-23'), 1200);
  });

  it('should return 0 price if target date is before validFrom date', () => {
    const part = new Part({
      name: 'steel_frame',
      component: 'Frame',
      priceHistory: [
        { validFrom: '2015-01-01', validUntil: null, price: 1000 }
      ]
    });

    assert.strictEqual(part.getPriceAtDate('2014-12-31'), 0);
  });
});

describe('CLI - Catalog & PricingEngine', () => {
  it('should correctly sum prices and group by component category', () => {
    const catalog = new Catalog();
    // Load local cli/catalog.json
    catalog.load();

    const engine = new PricingEngine(catalog);

    // Query for 2016-12-15
    const report = engine.calculate({
      date: '2016-12-15',
      partNames: [
        'steel_frame',
        'standard_handlebar',
        'v_brakes',
        'basic_saddle',
        'tubeless_tyre',
        'standard_rim',
        'tube',
        'spokes',
        '4_gear_assembly'
      ]
    });

    // Verify correct totals
    assert.strictEqual(report.total, 4980);

    // Verify component mappings and totals
    assert.strictEqual(report.breakdown['Frame'].total, 1200);
    assert.strictEqual(report.breakdown['Handle Bar/Brakes'].total, 850); // standard_handlebar (500) + v_brakes (350)
    assert.strictEqual(report.breakdown['Seating'].total, 400); // basic_saddle
    assert.strictEqual(report.breakdown['Wheels'].total, 1580); // tubeless_tyre (1000) + standard_rim (300) + tube (100) + spokes (180)
    assert.strictEqual(report.breakdown['Chain Assembly'].total, 950); // 4_gear_assembly

    // Verify date is set correctly
    assert.strictEqual(report.date.getFullYear(), 2016);
    assert.strictEqual(report.date.getMonth(), 11); // 11 represents December (0-indexed)
    assert.strictEqual(report.date.getDate(), 15);
  });

  it('should retrieve different prices for date-sensitive items based on queried date', () => {
    const catalog = new Catalog();
    catalog.load();
    const engine = new PricingEngine(catalog);

    // Date before price increase of tubeless_tyre (Dec 2016)
    const reportNov = engine.calculate({
      date: '2016-11-29',
      partNames: ['tubeless_tyre']
    });
    assert.strictEqual(reportNov.total, 800);

    // Date after price increase
    const reportDec = engine.calculate({
      date: '2016-12-05',
      partNames: ['tubeless_tyre']
    });
    assert.strictEqual(reportDec.total, 1000);
  });

  it('should handle nonexistent parts gracefully by skipping and pricing them at 0', () => {
    const catalog = new Catalog();
    catalog.load();
    const engine = new PricingEngine(catalog);

    const report = engine.calculate({
      date: '2016-12-15',
      partNames: ['steel_frame', 'magical_wings_for_flying']
    });

    assert.strictEqual(report.total, 1200);
    assert.strictEqual(report.parts.length, 2);
    assert.strictEqual(report.parts[1].found, false);
    assert.strictEqual(report.parts[1].price, 0);
  });
});
