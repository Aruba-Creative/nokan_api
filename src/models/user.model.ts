import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';

export enum UserRole {
  SUPER_ADMIN = 'superAdmin',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  name: string;
  username: string;
  role: UserRole;
  blocked: boolean;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;

  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(timestamp: number): boolean;
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
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'Please choose the role!'],
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

// Middleware to filter out inactive users
userSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;