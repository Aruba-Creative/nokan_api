import jwt from 'jsonwebtoken';
import User, { IUser } from '@/models/user.model';
import AppError from '@/utils/app-error';
import config from '@/config';
import { SignOptions } from 'jsonwebtoken';

/**
 * Service layer for handling authentication-related business logic
 */
class AuthService {
  /**
   * Sign JWT token
   */
  private signToken(userId: string): string {
    // Fix the typing issues by properly casting the secret and options
    return jwt.sign(
      { id: userId },
      config.jwtSecret as jwt.Secret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
    );
  }

  /**
   * Register a new user (only for first admin)
   */
  public async signup(userData: {
    name: string;
    username: string;
    role: string;
    password: string;
    passwordConfirm: string;
  }): Promise<{ token: string; user: IUser }> {
    // Check if any users already exist
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount > 0) {
      throw new AppError('Registration is no longer available', 403);
    }

    // Create user
    const newUser = await User.create(userData);

    // Generate token
    const token = this.signToken(newUser._id.toString());

    return { token, user: newUser };
  }

  /**
   * Login user
   */
  public async login(credentials: {
    username: string;
    password: string;
  }): Promise<{ token: string; user: IUser }> {
    const { username, password } = credentials;

    // Check if username and password exist
    if (!username || !password) {
      throw new AppError('Please provide username and password', 400);
    }

    // Find user
    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect username or password', 401);
    }

    // Check if user is blocked
    if (user.blocked) {
      throw new AppError('Your account has been blocked', 403);
    }

    // Generate token
    const token = this.signToken(user._id.toString());

    return { token, user };
  }
}

export default new AuthService();