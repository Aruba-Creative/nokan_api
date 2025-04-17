import moment from 'moment-timezone';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;         // e.g., 'user:read', 'user:write', etc.
  description: string;  // Description of what this permission allows
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: () => moment().tz('Asia/Baghdad').toDate(),
    },
    updatedAt: {
      type: Date,
      default: () => moment().tz('Asia/Baghdad').toDate(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Update timestamp when document is updated
permissionSchema.pre<IPermission>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Permission = mongoose.model<IPermission>('Permission', permissionSchema);

export default Permission;