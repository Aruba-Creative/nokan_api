import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';
import { IRole } from './role.model';

export interface IUser extends Document {
  name: string;
  username: string;
  role: Types.ObjectId | IRole; // Changed from enum to reference
  blocked: boolean;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;

  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(timestamp: number): boolean;
  hasPermission(permissionName: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  // Add any static methods here
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      validate: {
        validator: function (value: string): boolean {
          return /^[A-Za-z\s]+$/.test(value);
        },
        message: 'Name should contain only alphabet characters!',
      },
    },
    username: {
      type: String,
      required: [true, 'Please provide your username!'],
      unique: true,
      lowercase: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Please assign a role!'],
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password!'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password!'],
      validate: {
        validator: function (this: IUser, value: string): boolean {
          return value === this.password;
        },
        message: 'Password confirmation does not match the password!',
      },
    },
    passwordChangedAt: { type: Date },
    createdAt: {
      type: Date,
      default: () => moment().tz('Asia/Baghdad').toDate(),
    },
    updatedAt: {
      type: Date,
      default: () => moment().tz('Asia/Baghdad').toDate(),
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware to hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Automatically populate the role field with permissions
userSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
  this.populate({
    path: 'role',
    populate: {
      path: 'permissions',
      model: 'Permission'
    }
  });
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimeStamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

// Method to check if user has a specific permission
userSchema.methods.hasPermission = async function (
  permissionName: string
): Promise<boolean> {
  // Make sure the role is populated with permissions
  if (!this.populated('role')) {
    await this.populate({
      path: 'role',
      populate: {
        path: 'permissions',
        model: 'Permission'
      }
    });
  }

  const userRole = this.role as IRole;
  
  if (!userRole || !userRole.permissions) {
    return false;
  }

  return userRole.permissions.some((permission: any) => 
    permission.name === permissionName
  );
};

// Middleware to filter out inactive users
userSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;