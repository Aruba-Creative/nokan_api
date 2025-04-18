import mongoose, { Document, Schema, Types } from 'mongoose';
import moment from 'moment-timezone';

// Define the Stage subdocument schema
interface IStage {
  _id?: mongoose.Types.ObjectId; 
  name: string;
  description: string;
  images: string[];
}

// Define the Project document interface extending the Mongoose Document
export interface IProject extends Document {
  title: string;
  description: string;
  stages: IStage[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Create Stage Schema
const stageSchema = new Schema<IStage>({
  name: {
    type: String,
    required: [true, 'Stage name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  images: {
    type: [String],
    default: []
  }
});

// Create Project Schema
const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    stages: {
      type: [stageSchema],
      default: []
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project must have a creator']
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
projectSchema.pre<IProject>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Add virtual for links
projectSchema.virtual('links', {
  ref: 'Link',
  foreignField: 'project',
  localField: '_id'
});

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;