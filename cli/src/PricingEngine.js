const Catalog = require('./Catalog');

class PricingEngine {
  /**
   * @param {Catalog} catalog
   */
  constructor(catalog) {
    this.catalog = catalog;
  }

  /**
   * Calculates the total price of a cycle and returns a component breakdown.
   * @param {Object} options
   * @param {string|Date} options.date The target pricing date.
   * @param {Array<string>} options.partNames List of part names in the cycle.
   * @returns {Object} Pricing report.
   */
  calculate({ date, partNames }) {
    const pricingDate = date ? new Date(date) : new Date();

    const result = {
      date: pricingDate,
      parts: [],
      breakdown: {},
      total: 0
    };

    // Initialize all components to 0 to ensure they appear in the breakdown even if empty or just list the existing ones
    // Expected categories: Frame, Handle Bar/Brakes, Seating, Wheels, Chain Assembly
    const categories = ['Frame', 'Handle Bar/Brakes', 'Seating', 'Wheels', 'Chain Assembly'];
    categories.forEach(cat => {
      result.breakdown[cat] = {
        total: 0,
        parts: []
      };
    });

    for (const partName of partNames) {
      const part = this.catalog.getPart(partName);
      if (!part) {
        // Log warning or store missing part
        result.parts.push({
          name: partName,
          found: false,
          price: 0
        });
        continue;
      }

      const priceEntry = part.getPriceEntryAtDate(pricingDate);
      const price = priceEntry ? priceEntry.price : 0;

      const partReport = {
        name: part.name,
        component: part.component,
        found: true,
        price,
        priceEntry
      };

      result.parts.push(partReport);

      // Ensure the component category is represented in the breakdown
      if (!result.breakdown[part.component]) {
        result.breakdown[part.component] = {
          total: 0,
          parts: []
        };
      }

      result.breakdown[part.component].total += price;
      result.breakdown[part.component].parts.push(partReport);
      result.total += price;
    }

    return result;
  }
}

module.exports = PricingEngine;
