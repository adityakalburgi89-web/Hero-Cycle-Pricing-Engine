const mongoose = require('mongoose');
const connectDB = require('./db');
const Part = require('../models/Part');

const parts = [
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

async function seed() {
  await connectDB();
  console.log('Seeding database...');

  await Part.deleteMany({});

  const created = await Part.insertMany(parts);

  console.log(`Seeded ${created.length} parts with pricing history`);
  for (const part of created) {
    console.log(`  ${part.name} (${part.component}) — ${part.priceHistory.length} price entries`);
  }

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
