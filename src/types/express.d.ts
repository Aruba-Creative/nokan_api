import { IUser } from '../models/user.model';

// Use module augmentation to add user property to Express Request
declare global {
  namespace Express {
    // Extend the Request interface
    interface Request {
      user?: IUser;
    }
  }
}