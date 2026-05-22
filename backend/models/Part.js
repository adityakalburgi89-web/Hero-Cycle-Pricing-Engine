const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  basePrice: { type: Number, required: true },
});

module.exports = mongoose.model('Part', partSchema);
