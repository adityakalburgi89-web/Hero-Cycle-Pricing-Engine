import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  getPricingRules,
  getPricingRuleById,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  createPricingRuleSchema,
  updatePricingRuleSchema,
  deletePricingRuleSchema,
  getPricingRuleSchema,
} from '../controllers/pricing.controller.js';

const router = Router();

// Health Check Route
router.get('/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: 'Hero Cycle Pricing Engine API',
      },
      'Health check details retrieved successfully'
    )
  );
});

// Pricing Rules CRUD Routes
router
  .route('/pricing-rules')
  .get(getPricingRules)
  .post(validate(createPricingRuleSchema), createPricingRule);

router
  .route('/pricing-rules/:id')
  .get(validate(getPricingRuleSchema), getPricingRuleById)
  .patch(validate(updatePricingRuleSchema), updatePricingRule)
  .delete(validate(deletePricingRuleSchema), deletePricingRule);

export default router;
