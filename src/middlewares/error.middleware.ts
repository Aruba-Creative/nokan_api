import { Request, Response, NextFunction } from 'express';
import AppError from '@/utils/app-error';

/**
 * Catches errors that might occur when a route doesn't have a corresponding
 * controller method. This helps maintain consistent error responses.
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
};

/**
 * A global error logger that logs errors before they're handled
 * Useful for tracking errors in production environments
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(`Error: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  next(err);
};