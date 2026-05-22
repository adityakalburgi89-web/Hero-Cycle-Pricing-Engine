const mongoose = require('mongoose');
const connectDB = require('./db');
const Part = require('../models/Part');
const PricingHistory = require('../models/PricingHistory');

const parts = [
  { name: 'Frame', category: 'frame', basePrice: 200 },
  { name: 'Handlebar', category: 'handlebar', basePrice: 50 },
  { name: 'Wheel Set', category: 'wheels', basePrice: 150 },
  { name: 'Saddle', category: 'saddle', basePrice: 30 },
  { name: 'Brake Set', category: 'brakes', basePrice: 40 },
];

async function seed() {
  await connectDB();
  console.log('Seeding database...');

  await Part.deleteMany({});
  await PricingHistory.deleteMany({});

  const created = await Part.insertMany(parts);

  const historyEntries = created.map((part) => ({
    partId: part._id,
    price: part.basePrice + 10,
    date: new Date('2024-01-01'),
    note: 'Initial pricing at launch',
  }));

  await PricingHistory.insertMany(historyEntries);

  console.log(`Seeded ${created.length} parts with pricing history`);
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
