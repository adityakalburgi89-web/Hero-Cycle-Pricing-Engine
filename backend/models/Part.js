const mongoose = require('mongoose');

const priceEntrySchema = new mongoose.Schema({
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, default: null },
  price: { type: Number, required: true },
});

const partSchema = new mongoose.Schema({
  name: { type: String, required: true },
  component: { type: String, required: true },
  priceHistory: [priceEntrySchema],
});

const RealPart = mongoose.model('Part', partSchema);

// In-memory fallback database matching the seed catalog
const initialParts = [
  // ── Frames ──
  {
    name: 'steel_frame',
    component: 'frame',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: new Date('2020-12-31'), price: 180 },
      { validFrom: new Date('2021-01-01'), validUntil: null, price: 200 },
    ],
  },
  {
    name: 'aluminum_frame',
    component: 'frame',
    priceHistory: [
      { validFrom: new Date('2016-01-01'), validUntil: null, price: 250 },
    ],
  },
  {
    name: 'carbon_frame',
    component: 'frame',
    priceHistory: [
      { validFrom: new Date('2018-06-01'), validUntil: null, price: 400 },
    ],
  },

  // ── Handlebars ──
  {
    name: 'flat_handlebar',
    component: 'handlebar',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: null, price: 25 },
    ],
  },
  {
    name: 'drop_handlebar',
    component: 'handlebar',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: new Date('2024-12-31'), price: 45 },
      { validFrom: new Date('2025-01-01'), validUntil: null, price: 50 },
    ],
  },
  {
    name: 'riser_handlebar',
    component: 'handlebar',
    priceHistory: [
      { validFrom: new Date('2016-01-01'), validUntil: null, price: 35 },
    ],
  },

  // ── Brakes ──
  {
    name: 'rim_brake_set',
    component: 'brakes',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: null, price: 30 },
    ],
  },
  {
    name: 'disc_brake_set',
    component: 'brakes',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: new Date('2024-12-31'), price: 60 },
      { validFrom: new Date('2025-01-01'), validUntil: null, price: 55 },
    ],
  },
  {
    name: 'hydraulic_brake_set',
    component: 'brakes',
    priceHistory: [
      { validFrom: new Date('2018-01-01'), validUntil: null, price: 120 },
    ],
  },

  // ── Wheels / Tyres ──
  {
    name: 'tubeless_tyre',
    component: 'wheels',
    priceHistory: [
      { validFrom: new Date('2015-06-01'), validUntil: null, price: 120 },
    ],
  },
  {
    name: 'standard_tyre',
    component: 'wheels',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: null, price: 80 },
    ],
  },
  {
    name: 'performance_tyre',
    component: 'wheels',
    priceHistory: [
      { validFrom: new Date('2017-01-01'), validUntil: new Date('2024-05-31'), price: 160 },
      { validFrom: new Date('2024-06-01'), validUntil: null, price: 175 },
    ],
  },

  // ── Chain Assemblies ──
  {
    name: 'standard_chain',
    component: 'chain',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: null, price: 20 },
    ],
  },
  {
    name: 'performance_chain',
    component: 'chain',
    priceHistory: [
      { validFrom: new Date('2016-06-01'), validUntil: null, price: 40 },
    ],
  },
  {
    name: 'chainring_set',
    component: 'chain',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: null, price: 55 },
    ],
  },

  // ── Seating ──
  {
    name: 'basic_saddle',
    component: 'seating',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: null, price: 25 },
    ],
  },
  {
    name: 'comfort_saddle',
    component: 'seating',
    priceHistory: [
      { validFrom: new Date('2015-01-01'), validUntil: new Date('2024-08-31'), price: 45 },
      { validFrom: new Date('2024-09-01'), validUntil: null, price: 50 },
    ],
  },
  {
    name: 'racing_saddle',
    component: 'seating',
    priceHistory: [
      { validFrom: new Date('2017-01-01'), validUntil: null, price: 80 },
    ],
  },
];

let mockDb = [...initialParts];

const MockPart = {
  find: async function (query) {
    if (!query) return mockDb;
    if (query.name && query.name.$in) {
      const allowedNames = query.name.$in;
      return mockDb.filter(part => allowedNames.includes(part.name));
    }
    return mockDb;
  },
  findOne: async function (query) {
    if (query && query.name) {
      return mockDb.find(part => part.name === query.name) || null;
    }
    return null;
  },
  deleteMany: async function () {
    mockDb = [];
    return { acknowledged: true, deletedCount: 0 };
  },
  insertMany: async function (parts) {
    const prepared = parts.map(part => ({
      ...part,
      priceHistory: part.priceHistory.map(entry => ({
        ...entry,
        validFrom: new Date(entry.validFrom),
        validUntil: entry.validUntil ? new Date(entry.validUntil) : null,
      }))
    }));
    mockDb.push(...prepared);
    return prepared;
  }
};

module.exports = new Proxy(RealPart, {
  get(target, prop) {
    if (global.useMockDb) {
      if (prop in MockPart) {
        return MockPart[prop];
      }
    }
    return target[prop];
  }
});
