import { Document, Types } from 'mongoose';

// Slider Interface
export interface ISlider extends Document {
  _id: Types.ObjectId;
  name: string;
  imageUrl: string;
  status: boolean;
  link?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}