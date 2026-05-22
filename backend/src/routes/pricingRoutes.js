const express = require('express');
const router = express.Router();
const { calculatePrice } = require('../services/pricingService');
const { parts } = require('../data/seedData');

router.get('/parts', (req, res) => {
  res.json(parts);
});

router.post('/calculate', (req, res) => {
  const { partIds, region, material } = req.body;
  if (!partIds || !region || !material) {
    return res.status(400).json({ error: 'Missing required fields: partIds, region, material' });
  }
  const result = calculatePrice(partIds, region, material);
  res.json(result);
});

module.exports = router;
