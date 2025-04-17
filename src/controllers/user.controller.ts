import { Request, Response, NextFunction } from 'express';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import catchAsync from '@/utils/catch-async';
import BaseController from './base.controller';
import AppError from '@/utils/app-error';

class UserController extends BaseController {
  public getMe = (req: Request, res: Response, next: NextFunction): void => {
    if (req.user) {
      req.params.id = req.user.id;
    }
    next();
  };

  public getAllUsers = this.getAll(User);

  public getUserByID = this.getOne(User, { path: 'role', populate: { path: 'permissions' } });

  public conditionForCreatingUser = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Validate the role exists
    if (!req.body.role) {
      return next(new AppError('Role is required', 400));
    }

    const role = await Role.findById(req.body.role);
    if (!role) {
      return next(new AppError('Invalid role ID', 400));
    }

    next();
  });

  public createNewUser = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const newUser = await User.create({
      name: req.body.name,
      username: req.body.username,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    // Populate the role with permissions for the response
    await newUser.populate({
      path: 'role',
      populate: { path: 'permissions' }
    });

    // Remove password from response
    const userObj = newUser.toObject();
    // Fix for TS2790: Create a new object without the password property
    const { password, ...userWithoutPassword } = userObj;

    res.status(201).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
      },
    });
  });

  public conditionsForUpdatngUserData = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Add validation logic here
    // Prevent password updates through this route
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updatePassword.',
          400
        )
      );
    }

    // If role is being updated, validate it exists
    if (req.body.role) {
      const role = await Role.findById(req.body.role);
      if (!role) {
        return next(new AppError('Invalid role ID', 400));
      }
    }

    next();
  });

  public updateCurrentUserData = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Find document and update it
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        username: req.body.username,
        role: req.body.role,
        blocked: req.body.blocked,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: 'role',
      populate: { path: 'permissions' }
    });

    if (!updatedUser) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  });

  public deleteCurrentUser = this.deleteOne(User);
}

export default new UserController();