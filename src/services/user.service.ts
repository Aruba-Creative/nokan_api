import User, { IUser, UserRole } from '@/models/user.model';
import AppError from '@/utils/app-error';

/**
 * Service layer for handling user-related business logic
 */
class UserService {
  /**
   * Find user by id
   */
  public async findById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * Find all users with optional filters
   */
  public async findAll(filter: any = {}): Promise<IUser[]> {
    return User.find(filter);
  }

  /**
   * Create a new user
   */
  public async create(userData: {
    name: string;
    username: string;
    role: UserRole;
    password: string;
    passwordConfirm: string;
  }): Promise<IUser> {
    // Check if username exists
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
      throw new AppError('Username already exists', 400);
    }

    return User.create(userData);
  }

  /**
   * Update user data
   */
  public async update(
    userId: string,
    updateData: {
      name?: string;
      username?: string;
      role?: UserRole;
      blocked?: boolean;
    }
  ): Promise<IUser> {
    // Check if user exists
    const user = await this.findById(userId);

    // If updating username, check if new username is available
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await User.findOne({ username: updateData.username });
      if (existingUser) {
        throw new AppError('Username already exists', 400);
      }
    }

    // Update user
    Object.assign(user, updateData);
    await user.save({ validateBeforeSave: false });
    
    return user;
  }

  /**
   * Delete a user
   */
  public async delete(userId: string): Promise<void> {
    const user = await this.findById(userId);
    await user.deleteOne();
  }

  /**
   * Update user password
   */
  public async updatePassword(
    userId: string,
    passwordData: {
      currentPassword: string;
      newPassword: string;
      passwordConfirm: string;
    }
  ): Promise<IUser> {
    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if current password is correct
    if (
      !(await user.correctPassword(
        passwordData.currentPassword,
        user.password
      ))
    ) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = passwordData.newPassword;
    user.passwordConfirm = passwordData.passwordConfirm;
    await user.save();

    return user;
  }
}

export default new UserService();