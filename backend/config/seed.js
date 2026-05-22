const mongoose = require('mongoose');
const connectDB = require('./db');
const Part = require('../models/Part');

const parts = [
  // ── Frames ──
  {
    name: 'Standard Frame',
    component: 'frame',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: new Date('2024-12-31'), price: 200 },
      { validFrom: new Date('2025-01-01'), validUntil: null, price: 220 },
    ],
  },
  {
    name: 'Premium Frame',
    component: 'frame',
    priceHistory: [
      { validFrom: new Date('2023-06-01'), validUntil: null, price: 350 },
    ],
  },
  {
    name: 'Compact Frame',
    component: 'frame',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: new Date('2024-05-31'), price: 180 },
      { validFrom: new Date('2024-06-01'), validUntil: null, price: 195 },
    ],
  },

  // ── Handlebars ──
  {
    name: 'Flat Handlebar',
    component: 'handlebar',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: null, price: 25 },
    ],
  },
  {
    name: 'Drop Handlebar',
    component: 'handlebar',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: new Date('2025-02-28'), price: 45 },
      { validFrom: new Date('2025-03-01'), validUntil: null, price: 50 },
    ],
  },
  {
    name: 'Riser Handlebar',
    component: 'handlebar',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: null, price: 35 },
    ],
  },

  // ── Brakes ──
  {
    name: 'Rim Brake Set',
    component: 'brakes',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: null, price: 30 },
    ],
  },
  {
    name: 'Disc Brake Set',
    component: 'brakes',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: new Date('2024-12-31'), price: 60 },
      { validFrom: new Date('2025-01-01'), validUntil: null, price: 55 },
    ],
  },
  {
    name: 'Hydraulic Brake Set',
    component: 'brakes',
    priceHistory: [
      { validFrom: new Date('2024-01-01'), validUntil: null, price: 120 },
    ],
  },

  // ── Wheels ──
  {
    name: 'Standard Wheel Set',
    component: 'wheels',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: null, price: 150 },
    ],
  },
  {
    name: 'Performance Wheel Set',
    component: 'wheels',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: new Date('2025-05-31'), price: 250 },
      { validFrom: new Date('2025-06-01'), validUntil: null, price: 280 },
    ],
  },
  {
    name: 'Carbon Wheel Set',
    component: 'wheels',
    priceHistory: [
      { validFrom: new Date('2024-01-01'), validUntil: null, price: 450 },
    ],
  },

  // ── Chain Assemblies ──
  {
    name: 'Standard Chain',
    component: 'chain',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: null, price: 20 },
    ],
  },
  {
    name: 'Performance Chain',
    component: 'chain',
    priceHistory: [
      { validFrom: new Date('2023-06-01'), validUntil: null, price: 40 },
    ],
  },
  {
    name: 'Chainring Set',
    component: 'chain',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: null, price: 55 },
    ],
  },

  // ── Seating ──
  {
    name: 'Basic Saddle',
    component: 'seating',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: null, price: 25 },
    ],
  },
  {
    name: 'Comfort Saddle',
    component: 'seating',
    priceHistory: [
      { validFrom: new Date('2023-01-01'), validUntil: new Date('2024-08-31'), price: 45 },
      { validFrom: new Date('2024-09-01'), validUntil: null, price: 50 },
    ],
  },
  {
    name: 'Racing Saddle',
    component: 'seating',
    priceHistory: [
      { validFrom: new Date('2024-01-01'), validUntil: null, price: 80 },
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
