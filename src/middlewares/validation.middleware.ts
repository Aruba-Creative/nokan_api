import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import AppError from '@/utils/app-error';

/**
 * Generic validation middleware that uses class-validator to validate request body
 * @param type - The class type to validate against
 * @param skipMissingProperties - Whether to skip properties that are missing in the request body
 */
export const validateBody = <T extends object>(type: new () => T, skipMissingProperties = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transform plain object to class instance
      const input = plainToClass(type, req.body);
      
      // Validate
      const errors = await validate(input, { 
        skipMissingProperties,
        whitelist: true, 
        forbidNonWhitelisted: true 
      });
      
      if (errors.length > 0) {
        const message = formatValidationErrors(errors);
        return next(new AppError(message, 400));
      }
      
      // Replace request body with validated object
      req.body = input;
      next();
    } catch (error) {
      next(new AppError('Validation failed', 400));
    }
  };
};

/**
 * Format validation errors into a readable string
 */
const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors
    .map(error => {
      if (error.constraints) {
        return Object.values(error.constraints).join(', ');
      }
      return undefined;
    })
    .filter(message => message !== undefined)
    .join('; ');
};

/**
 * Middleware to validate MongoDB ObjectId parameter
 * @param paramName - The name of the route parameter to validate (default: 'id')
 */
export const validateObjectId = (paramName = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    // Check if the ID matches MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError(`Invalid ${paramName}: ${id}`, 400));
    }
    
    next();
  };
};