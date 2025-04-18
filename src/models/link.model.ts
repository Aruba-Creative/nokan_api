import mongoose, { Document, Schema, Types } from 'mongoose';
import moment from 'moment-timezone';
import { IProject } from './project.model';

// Define the Visitor subdocument interface
interface IVisitor {
  ip: string;
  userAgent: string;
  timestamp: Date;
}

// Define the Link document interface
export interface ILink extends Document {
  project: Types.ObjectId | IProject;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  openCount: number;
  visitors: IVisitor[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
  isAccessible(): boolean;
}

// Create Visitor Schema
const visitorSchema = new Schema<IVisitor>({
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: () => moment().tz('Asia/Baghdad').toDate()
  }
});

// Create Link Schema
const linkSchema = new Schema<ILink>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Link must be associated with a project']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: () => moment().tz('Asia/Baghdad').toDate()
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    openCount: {
      type: Number,
      default: 0
    },
    visitors: {
      type: [visitorSchema],
      default: []
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Link must have a creator']
    },
    createdAt: {
      type: Date,
      default: () => moment().tz('Asia/Baghdad').toDate()
    },
    updatedAt: {
      type: Date,
      default: () => moment().tz('Asia/Baghdad').toDate()
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Update timestamp when document is updated
linkSchema.pre<ILink>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Automatically populate project reference
linkSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
  this.populate({
    path: 'project',
    select: 'title description stages'
  });
});

// Method to check if link is expired
linkSchema.methods.isExpired = function (): boolean {
  const now = new Date();
  return now > this.endDate;
};

// Method to check if link is accessible (not expired and active)
linkSchema.methods.isAccessible = function (): boolean {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

const Link = mongoose.model<ILink>('Link', linkSchema);

export default Link;