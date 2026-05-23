class Part {
  /**
   * @param {Object} data
   * @param {string} data.name
   * @param {string} data.component
   * @param {Array<Object>} data.priceHistory
   */
  constructor({ name, component, priceHistory }) {
    this.name = name;
    this.component = component;
    this.priceHistory = priceHistory.map(entry => ({
      validFrom: new Date(entry.validFrom),
      validUntil: entry.validUntil ? new Date(entry.validUntil) : null,
      price: Number(entry.price)
    }));
  }

  /**
   * Resolves the price of the part at a given date.
   * @param {Date} date
   * @returns {Object|null} The matched price entry, or null if no active price exists.
   */
  getPriceEntryAtDate(date) {
    const targetDate = date instanceof Date ? date : new Date(date);

    // Filter price entries valid on or before the target date
    const validEntries = this.priceHistory.filter(entry => {
      const isAfterStart = entry.validFrom <= targetDate;
      const isBeforeEnd = !entry.validUntil || entry.validUntil >= targetDate;
      return isAfterStart && isBeforeEnd;
    });

    if (validEntries.length === 0) {
      return null;
    }

    // Sort descending by validFrom to get the most recent active price
    validEntries.sort((a, b) => b.validFrom - a.validFrom);
    return validEntries[0];
  }

  /**
   * Gets the numeric price of the part at a given date.
   * @param {Date} date
   * @returns {number} The price of the part, or 0 if not found.
   */
  getPriceAtDate(date) {
    const entry = this.getPriceEntryAtDate(date);
    return entry ? entry.price : 0;
  }
}

module.exports = Part;
