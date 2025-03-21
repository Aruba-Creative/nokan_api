import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User, { IUser } from '@/models/user.model';
import catchAsync from '@/utils/catch-async';
import AppError from '@/utils/app-error';

interface JwtPayload {
  id: string;
  iat: number;
}

class AuthController {
  private signToken(id: string): string {
    return jwt.sign(
      { id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  private createSendToken(
    user: IUser,
    statusCode: number,
    req: Request,
    res: Response
  ): void {
    const token = this.signToken(user._id.toString());

    const cookieOptions = {
      expires: new Date(
        Date.now() + 
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    };

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    const userObj = user.toObject();
    delete userObj.password;

    res.status(statusCode).json({
      status: 'success',
      token,
      user: userObj
    });
  }

  public signup = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Check if any users already exist
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount > 0) {
      return next(new AppError('Sorry, this route is no longer available.', 403));
    }

    const newUser = await User.create({
      name: req.body.name,
      username: req.body.username,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    this.createSendToken(newUser, 201, req, res);
  });

  public login = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { username, password } = req.body;
    
    // 1) Check if username and password exist
    if (!username || !password) {
      return next(new AppError('Please provide username and password!', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect username or password!', 400));
    }

    if (user.blocked) {
      return next(new AppError('This user is blocked and cannot log in!', 403));
    }

    // 3) If everything ok, send token to client
    this.createSendToken(user, 200, req, res);
  });

  public protect = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // 1) Getting token and check if it's there
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

    // 2) Verification token
    const decoded = await promisify<string, string, JwtPayload>(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

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

    if (currentUser.blocked) {
      return next(
        new AppError('This user is blocked and cannot access this route!', 403)
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please login again.', 401)
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  });

  public restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
      next();
    };
  };

  public updatePassword = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // 1) Get user from collection
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }
    
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong!', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    // 4) Log user in, send JWT
    this.createSendToken(user, 200, req, res);
    next();
  });
}

export default new AuthController();