import { Document, Types } from 'mongoose';

/**
 * Represents the User document in MongoDB
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  refreshToken: string[]; // Added to support multi-device sessions
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data required to create a new User (Admin)
 */
export interface INewUser extends Pick<IUser, 'name' | 'email' | 'password'> {
  // You can add optional fields here if needed for the registration process
}