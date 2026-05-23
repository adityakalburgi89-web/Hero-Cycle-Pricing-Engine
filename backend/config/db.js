const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hero_cycle_pricing';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000 // 2 seconds timeout
    });
    console.log('MongoDB connected successfully');
    global.useMockDb = false;
  } catch (err) {
    console.warn(`\n  Local MongoDB connection failed: ${err.message}`);
    console.warn(' Falling back to local in-memory Mock Database for seamless offline demo execution!\n');
    global.useMockDb = true;
  }
}

module.exports = connectDB;
