import { Request, Response, NextFunction } from 'express';
import User from '@/models/user.model';
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

  public getUserByID = this.getOne(User);

  public conditionForCreatingUser = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Implement your conditions here
    // For example, validating role assignments or checking permissions
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

    // Remove password from response
    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      status: 'success',
      data: {
        user: userObj,
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
    );

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