import express, { type NextFunction } from "express";
import { JobService } from "../service/job.js";
import httpResponse from "../utils/httpResponse.js";
import { httpError } from "../utils/httpError.js";
import { type CustomRequest } from "../interface/express.js";
import type { IJob } from "../interface/job.js";

export class JobController {
  private JobService: JobService;

  constructor(JobService: JobService) {
    this.JobService = JobService;
  }

  /**
   * Create a new job listing
   */
  handleCreateJob = async (
    req: CustomRequest<{
      title: string;
      designation: string;
      salary?: string;
      category?: string;
      jobType?: string;
      location?: string;
      deadline?: string;
      skills?: string;
      details?: string;
      image?: string; // If using Multer, this might come from req.file instead
    }>,
    res: express.Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const {
        title,
        designation,
        salary,
        category,
        jobType,
        location,
        deadline,
        skills,
        details,
        image,
      } = req.body;

      // Basic validation for required fields based on your schema
      if (!title || !designation) {
        return httpError(
          next,
          new Error("Title and designation are required"),
          req,
          422,
        );
      }

      // If you are using Multer for the "Choose Image" field, grab the path
      const imageUrl = req.file?.path || image;

      const rawPayload = {
        title,
        designation,
        salary,
        category,
        jobType,
        location,
        deadline,
        skills,
        details,
        image: imageUrl,
      };

      // 2. Filter out any keys that have an 'undefined' value
      const cleanPayload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, value]) => value !== undefined),
      );

      // 3. Pass the clean payload to the service
      const job = await this.JobService.addOne(cleanPayload as Partial<IJob>);

      if (!job) {
        throw new Error("Error adding job to database.");
      }

      return httpResponse(req, res, 201, "Job created successfully", { job });
    } catch (error) {
      return httpError(next, error, req, 500);
    }
  };

  /**
   * Get all jobs with pagination (Matches the 1/20 Pages UI)
   */
  handleGetJobs = async (
    req: express.Request,
    res: express.Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Extract page and limit from query strings, default to page 1, 10 items per page
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // You can also extract search terms here if you want to power the top search bar
      const search = req.query.search as string;
      const filter = search ? { title: { $regex: search, $options: "i" } } : {};

      const result = await this.JobService.findAll(filter, page, limit);

      return httpResponse(req, res, 200, "Jobs retrieved successfully", result);
    } catch (error) {
      return httpError(next, error, req, 500);
    }
  };


/**
   * Get a single job by ID (Used for the "View" or "Edit" actions)
   */
  handleGetJobById = async (
    req: express.Request, 
    res: express.Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const rawId = req.params.id || req.query.id
      const id = Array.isArray(rawId) ? rawId[0] : rawId

      if (!id || typeof id !== 'string') {
        return httpError(next, new Error('A valid Slider ID is required'), req, 400)
      }


      const job = await this.JobService.findById(id)

      if (!job) {
        return httpError(next, new Error('Job not found'), req, 404)
      }

      return httpResponse(req, res, 200, 'Job retrieved successfully', { job })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }


  /**
   * Update a job (Also used for the isActive toggle switch)
   */
  handleUpdateJob = async (
    req: CustomRequest<Record<string, unknown>>,
    res: express.Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const rawId = req.params.id || req.query.id;

      // 2. Ensure it's a single string
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      // 3. Validation check
      if (!id || typeof id !== "string") {
        return httpError(
          next,
          new Error("A valid Job ID string is required"),
          req,
          400,
        );
      }

      // If updating the image via Multer, intercept the new file path
      const updates = { ...req.body };
      if (req.file?.path) {
        updates.image = req.file.path;
      }

      const job = await this.JobService.updateById(id, updates);

      if (!job) {
        return httpError(next, new Error("Job not found"), req, 404);
      }

      return httpResponse(req, res, 200, "Job updated successfully", { job });
    } catch (error) {
      return httpError(next, error, req, 500);
    }
  };

  /**
   * Delete a job
   */
  handleDeleteJob = async (
    req: express.Request,
    res: express.Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const rawId = req.params.id || req.query.id;

      // 2. Ensure it's a single string
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      // 3. Validation check
      if (!id || typeof id !== "string") {
        return httpError(
          next,
          new Error("A valid Job ID string is required"),
          req,
          400,
        );
      }


      const job = await this.JobService.deleteById(id);

      if (!job) {
        return httpError(next, new Error("Job not found"), req, 404);
      }

      return httpResponse(req, res, 200, "Job deleted successfully", { job });
    } catch (error) {
      return httpError(next, error, req, 500);
    }
  };
}
