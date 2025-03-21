import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
import compression from 'compression';
import cors from 'cors';
import path from 'path';

import AppError from '@/utils/app-error';
import errorController from '@/controllers/error.controller';
import config from '@/config';
import apiRoutes from '@/routes';
import { 
  getLogger, 
  globalRateLimiter, 
  authRateLimiter,
  notFoundHandler,
  errorLogger
} from '@/middlewares';

const app: Application = express();

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors({
  origin: config.env === 'development' 
    ? config.clientUrls.development 
    : config.clientUrls.production,
  credentials: true,
}));

// Security HTTP headers
app.use(helmet());

// Logging middleware based on environment
app.use(getLogger());

// Rate limiting middleware
app.use('/api', globalRateLimiter);
app.use('/api/v1/auth', authRateLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration'] // Accept multiple duration fields at the same time
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Compress responses
app.use(compression());

// 2) ROUTES
app.use('/api/v1', apiRoutes);

// 3) HANDLE UNDEFINED ROUTES
app.all('*', notFoundHandler);

// 4) ERROR HANDLING MIDDLEWARE
app.use(errorLogger);
app.use(errorController);

export default app;