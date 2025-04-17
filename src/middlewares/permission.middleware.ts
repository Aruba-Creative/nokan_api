import { Request, Response, NextFunction } from 'express';
import AppError from '@/utils/app-error';

/**
 * Middleware to check if a user has the required permission(s)
 * This replaces the restrictTo middleware with a more flexible permission-based approach
 * 
 * @param permissions - Single permission string or array of permission strings
 * @returns Middleware function
 */
export const hasPermission = (permissions: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return next(new AppError('You must be logged in to access this route', 401));
      }

      // Convert permissions to array if a single string was provided
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

      // Check if the user has all required permissions
      for (const permission of requiredPermissions) {
        const hasPermission = await req.user.hasPermission(permission);
        if (!hasPermission) {
          return next(
            new AppError('You do not have permission to perform this action', 403)
          );
        }
      }

      // If all permissions are present, continue
      next();
    } catch (error) {
      next(new AppError('Error checking permissions', 500));
    }
  };
};