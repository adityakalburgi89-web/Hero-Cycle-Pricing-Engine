import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

// Zod Validation Schemas
export const createPricingRuleSchema = {
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    description: z.string().optional(),
    ruleType: z.enum(['DISCOUNT', 'MARKUP', 'TAX', 'SURCHARGE']),
    valueType: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().positive('Value must be a positive number'),
    conditions: z.record(z.any()).optional(),
    priority: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
  }),
};

export const updatePricingRuleSchema = {
  params: z.object({
    id: z.string().uuid('Invalid rule ID format'),
  }),
  body: createPricingRuleSchema.body.partial(),
};

export const deletePricingRuleSchema = {
  params: z.object({
    id: z.string().uuid('Invalid rule ID format'),
  }),
};

export const getPricingRuleSchema = {
  params: z.object({
    id: z.string().uuid('Invalid rule ID format'),
  }),
};

// Controllers
export const getPricingRules = asyncHandler(async (req: Request, res: Response) => {
  try {
    const rules = await prisma.pricingRule.findMany({
      orderBy: { priority: 'desc' },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, rules, 'Pricing rules retrieved successfully'));
  } catch (error: any) {
    // If the table or database is not yet migrated, fall back gracefully rather than crashing completely,
    // which makes running the boilerplate for the first time extremely friendly!
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            [],
            'Database table not migrated yet. Please run database migrations to enable active storage.'
          )
        );
    }
    throw error;
  }
});

export const getPricingRuleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const rule = await prisma.pricingRule.findUnique({
    where: { id },
  });

  if (!rule) {
    throw new ApiError(404, `Pricing rule with ID ${id} not found`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, rule, 'Pricing rule retrieved successfully'));
});

export const createPricingRule = asyncHandler(async (req: Request, res: Response) => {
  const ruleData = req.body;
  
  const newRule = await prisma.pricingRule.create({
    data: {
      name: ruleData.name,
      description: ruleData.description,
      ruleType: ruleData.ruleType,
      valueType: ruleData.valueType,
      value: ruleData.value,
      conditions: ruleData.conditions || {},
      priority: ruleData.priority ?? 0,
      isActive: ruleData.isActive ?? true,
      startDate: ruleData.startDate ? new Date(ruleData.startDate) : null,
      endDate: ruleData.endDate ? new Date(ruleData.endDate) : null,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newRule, 'Pricing rule created successfully'));
});

export const updatePricingRule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const rule = await prisma.pricingRule.findUnique({
    where: { id },
  });

  if (!rule) {
    throw new ApiError(404, `Pricing rule with ID ${id} not found`);
  }

  const updatedRule = await prisma.pricingRule.update({
    where: { id },
    data: {
      ...updateData,
      startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
      endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRule, 'Pricing rule updated successfully'));
});

export const deletePricingRule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const rule = await prisma.pricingRule.findUnique({
    where: { id },
  });

  if (!rule) {
    throw new ApiError(404, `Pricing rule with ID ${id} not found`);
  }

  await prisma.pricingRule.delete({
    where: { id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Pricing rule deleted successfully'));
});
