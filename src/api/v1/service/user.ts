import { Model } from 'mongoose';
import type { IUser, INewUser } from './../../v1/interface/user.js';
import { hashPassword } from './../utils/password.js';

export class UserService {
  private UserModel: Model<IUser>;

  constructor(UserModel: Model<IUser>) {
    this.UserModel = UserModel;
  }

  /**
   * Find an admin user by email, ID, or other criteria
   */
  findOne = async (filter: Record<string, any>): Promise<IUser | null> => {
    try {
      // Returns IUser object or null
      return await this.UserModel.findOne(filter);
    } catch (error) {
      console.error(`[UserService] Error finding user: ${error}`);
      throw error;
    }
  };

  /**
   * Create a new Admin user
   */
  addOne = async (user: INewUser): Promise<IUser> => {
    try {
      const hashPwd = await hashPassword(user.password);

      const newUser = new this.UserModel({
        name: user.name,
        email: user.email,
        password: hashPwd,
        refreshToken: [] // Initialized as an empty array for JWT rotation
      });

      return await newUser.save();
    } catch (error) {
      console.error(`[UserService] Error adding user: ${error}`);
      throw error;
    }
  };

  /**
   * Update admin details or manage refresh tokens
   */
  findOneAndUpdate = async (
    filter: Record<string, any>, 
    updates: Record<string, any>
  ): Promise<IUser | null> => {
    try {
      return await this.UserModel.findOneAndUpdate(filter, updates, {
        new: true,
        runValidators: true 
      });
    } catch (error) {
      console.error(`[UserService] Error updating user: ${error}`);
      throw error;
    }
  };

  /**
   * Remove an admin account
   */
  findOneAndDelete = async (filter: Record<string, any>): Promise<IUser | null> => {
    try {
      return await this.UserModel.findOneAndDelete(filter);
    } catch (error) {
      console.error(`[UserService] Error deleting user: ${error}`);
      throw error;
    }
  };
}