import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // Transform non-ApiError instances
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    // Handle Zod Validation Errors
    if (error instanceof z.ZodError) {
      statusCode = 400;
      message = 'Validation Error';
      const formattedErrors = error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      error = new ApiError(statusCode, message, formattedErrors, err.stack);
    } else {
      error = new ApiError(
        statusCode,
        message,
        [],
        err.stack
      );
    }
  }

  // Extract variables
  const { statusCode, message, errors, stack } = error;

  // Log error
  logger.error(`${req.method} ${req.originalUrl} - Status: ${statusCode} - Message: ${message}`);
  if (statusCode === 500 && env.NODE_ENV !== 'test') {
    logger.error(stack || '');
  }

  // Construct final payload
  const response = {
    success: false,
    statusCode,
    message,
    errors,
    ...(env.NODE_ENV === 'development' && { stack }),
  };

  res.status(statusCode).json(response);
};
