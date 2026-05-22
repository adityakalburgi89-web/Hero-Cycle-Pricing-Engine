const express = require('express');
const router = express.Router();
const controller = require('../controllers/pricingController');

router.get('/parts', controller.getAllParts);
router.post('/calculate', controller.calculatePrice);
router.get('/history/:partName', controller.getPartHistory);

module.exports = router;
