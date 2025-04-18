import { Request, Response, NextFunction } from 'express';
import User from '@/models/user.model';
import AppError from '@/utils/app-error';
import catchAsync from '@/utils/catch-async';
import { verifyToken } from '@/utils/jwt.utils';

/**
 * Middleware to protect routes that require authentication
 * Validates the JWT token and attaches the user to the request
 */
export const protect = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Get token from request
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access.', 401)
    );
  }

  try {
    // 2) Verify token
    const decoded = await verifyToken(token);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist!',
          401
        )
      );
    }

    // 4) Check if user is blocked
    if (currentUser.blocked) {
      return next(
        new AppError('This user is blocked and cannot access this route!', 403)
      );
    }

    // 5) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please login again.', 401)
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    return next(
      new AppError('Invalid token or session expired. Please log in again.', 401)
    );
  }
});

/**
 * Middleware to restrict access to certain routes based on user roles
 * Must be used after the protect middleware
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role.toString())) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};