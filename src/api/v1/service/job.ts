import { Model } from 'mongoose';
import type { IJob } from './../../v1/interface/job.js';

export class JobService {
  private JobModel: Model<IJob>;

  constructor(JobModel: Model<IJob>) {
    this.JobModel = JobModel;
  }

  // Fetch jobs with pagination logic (for the 1/20 pages UI)
  findAll = async (filter: Record<string, any>, page: number = 1, limit: number = 10) => {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.JobModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        this.JobModel.countDocuments(filter)
      ]);
      return { data, total, pages: Math.ceil(total / limit) };
    } catch (error) {
      console.error(`[JobService] Error fetching jobs: ${error}`);
      throw error;
    }
  };

  addOne = async (jobData: Partial<IJob>): Promise<IJob> => {
    try {
      const newJob = new this.JobModel(jobData);
      return await newJob.save();
    } catch (error) {
      console.error(`[JobService] Error adding job: ${error}`);
      throw error;
    }
  };

  // Used for the Edit and the isActive toggle switch
  updateById = async (id: string, updates: Partial<IJob>): Promise<IJob | null> => {
    try {
      return await this.JobModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    } catch (error) {
      console.error(`[JobService] Error updating job: ${error}`);
      throw error;
    }
  };

  /**
   * Fetch a single job by its MongoDB ID
   */
  findById = async (id: string): Promise<IJob | null> => {
    try {
      return await this.JobModel.findById(id);
    } catch (error) {
      console.error(`[JobService] Error fetching job by ID: ${error}`);
      throw error;
    }
  };

  deleteById = async (id: string): Promise<IJob | null> => {
    try {
      return await this.JobModel.findByIdAndDelete(id);
    } catch (error) {
      console.error(`[JobService] Error deleting job: ${error}`);
      throw error;
    }
  };
}