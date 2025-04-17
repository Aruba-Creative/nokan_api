import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IPermission } from './permission.model';
import moment from 'moment-timezone';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: Types.ObjectId[] | IPermission[];
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Role description is required'],
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      }
    ],
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
roleSchema.pre<IRole>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;