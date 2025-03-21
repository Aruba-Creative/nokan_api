import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

/**
 * Custom request logger middleware that adds more context than standard morgan
 */
export const customLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userId: req.user ? req.user.id : 'unauthenticated'
    };
    
    console.log(JSON.stringify(logEntry));
  });
  
  next();
};

/**
 * Development logger with colored output
 */
export const developmentLogger = morgan('dev');

/**
 * Production logger with minimal but important information
 */
export const productionLogger = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms'
);

/**
 * Get the appropriate logger based on environment
 */
export const getLogger = () => {
  if (process.env.NODE_ENV === 'development') {
    return developmentLogger;
  }
  
  return productionLogger;
};