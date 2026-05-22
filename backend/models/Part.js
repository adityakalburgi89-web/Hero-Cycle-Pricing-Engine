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

module.exports = mongoose.model('Part', partSchema);
