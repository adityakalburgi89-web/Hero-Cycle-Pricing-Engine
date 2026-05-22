import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { ApiError } from './utils/ApiError.js';
import { errorHandler } from './middlewares/error.middleware.js';
import apiRoutes from './routes/api.routes.js';

const app: Express = express();

// Set security HTTP headers
app.use(helmet());

// Implement CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// HTTP request logger using Winston
const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};
app.use(
  morgan(
    ':remote-addr - :method :url :status :res[content-length] - :response-time ms',
    { stream: morganStream }
  )
);

// Body parsing middlewares
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting to prevent brute force / DDOS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req: Request, res: Response, next: NextFunction) => {
    next(new ApiError(429, 'Too many requests, please try again later'));
  },
});

// Apply rate limiting to all /api routes
app.use('/api', limiter);

// API Router
app.use('/api/v1', apiRoutes);

// Fallback 404 handler
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server`));
});

// Global Error Handler Middleware
app.use(errorHandler);

export { app };
