const Part = require('../models/Part');
const pricingService = require('../services/pricingService');

async function getAllParts(req, res) {
  try {
    const parts = await Part.find();
    res.json(parts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function calculatePrice(req, res) {
  try {
    const { date, parts } = req.body;

    if (!parts || parts.length === 0) {
      return res.status(400).json({ error: 'parts array is required' });
    }

    const result = await pricingService.calculatePrice({ date, partNames: parts });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPartHistory(req, res) {
  try {
    const history = await pricingService.getPricingHistory(req.params.partName);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllParts, calculatePrice, getPartHistory };
