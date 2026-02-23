import { Document, Types } from 'mongoose';

// Job Interface
export interface IJob extends Document {
  _id: Types.ObjectId;
  title: string;
  designation: string;
  salary?: string;
  category?: string;
  jobType?: string;
  location?: string;
  deadline?: string;
  image?: string;
  skills?: string;
  details?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
