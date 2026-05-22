const express = require('express');
const router = express.Router();
const Part = require('../models/Part');
const PricingHistory = require('../models/PricingHistory');
const { calculatePrice, getPricingHistory } = require('../services/pricingService');

router.get('/parts', async (req, res) => {
  try {
    const parts = await Part.find();
    res.json(parts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/calculate', async (req, res) => {
  try {
    const { partIds, date } = req.body;
    if (!partIds || partIds.length === 0) {
      return res.status(400).json({ error: 'partIds required' });
    }
    const result = await calculatePrice(partIds, date);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/:partId', async (req, res) => {
  try {
    const history = await getPricingHistory(req.params.partId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/history', async (req, res) => {
  try {
    const { partId, price, date, note } = req.body;
    if (!partId || price == null) {
      return res.status(400).json({ error: 'partId and price required' });
    }
    const entry = await PricingHistory.create({ partId, price, date, note });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
