const mongoose = require('mongoose');

const pricingHistorySchema = new mongoose.Schema({
  partId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true,
  },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String },
});

pricingHistorySchema.index({ partId: 1, date: -1 });

module.exports = mongoose.model('PricingHistory', pricingHistorySchema);
