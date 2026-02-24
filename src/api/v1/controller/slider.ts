import express, { type NextFunction } from 'express'
import { SliderService } from '../service/slider.js' // Adjust path if needed
import httpResponse from '../utils/httpResponse.js'
import { httpError } from '../utils/httpError.js'
import { type CustomRequest } from '../interface/express.js'
import type { ISlider } from '../interface/slider.js'
import fs from 'fs/promises';
import path from 'path';

export class SliderController {
  private SliderService: SliderService

  constructor(SliderService: SliderService) {
    this.SliderService = SliderService
  }

  /**
   * Create a new slider/banner
   */
  handleCreateSlider = async (
    req: CustomRequest<{ 
      name: string; 
      status?: string; // Form-data sends this as a string "true" or "false"
      link?: string; 
      order?: string;  // Form-data sends this as a string "1", "2"
    }>,
    res: express.Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, status, link, order } = req.body

      if (!name) {
        return httpError(next, new Error('Slider name is required'), req, 422)
      }

      if (!req.file) {
        return httpError(next, new Error('Slider image file is required'), req, 422)
      }

      // 1. Use the web-safe path for the image
      const imageUrl = `/public/uploads/${req.file.filename}`

      // 2. Parse form-data strings into correct types
      const parsedStatus = status === 'false' ? false : true // Defaults to true
      const parsedOrder = order ? parseInt(order, 10) : 0

      const rawPayload={
        name,
        imageUrl,
        status: parsedStatus,
        link,
        order: parsedOrder
      }

      const cleanPayload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, value]) => value !== undefined),
      );

      const slider = await this.SliderService.addOne(cleanPayload as Partial<ISlider>)

      if (!slider) {
        throw new Error('Error adding slider to database.')
      }

      return httpResponse(req, res, 201, 'Slider created successfully', { slider })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }

  /**
   * Get all sliders with pagination (defaults to 8 items per page for the grid)
   */
  handleGetSliders = async (
    req: express.Request, 
    res: express.Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 8

      // Optional: Filter by status if requested (e.g., frontend only wants active sliders)
      const statusFilter = req.query.status ? { status: req.query.status === 'true' } : {}

      const result = await this.SliderService.findAll(statusFilter, page, limit)

      return httpResponse(req, res, 200, 'Sliders retrieved successfully', result)
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }

  /**
   * Update a slider (Handles the Status Toggle Switch AND image replacements)
   */
  handleUpdateSlider = async (
    req: CustomRequest<Record<string, unknown>>, 
    res: express.Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const rawId = req.params.id || req.query.id
      const id = Array.isArray(rawId) ? rawId[0] : rawId

      if (!id || typeof id !== 'string') {
        return httpError(next, new Error('A valid Slider ID is required'), req, 400)
      }

      const updates: Record<string, unknown> = { ...req.body }

      // If the frontend sent a new file, update the imageUrl
      if (req.file) {
        updates.imageUrl = `/public/uploads/${req.file.filename}`
      }

      // Handle form-data string conversions if they exist in the update payload
      if (typeof updates.status === 'string') {
        updates.status = updates.status === 'true'
      }
      if (typeof updates.order === 'string') {
        updates.order = parseInt(updates.order, 10)
      }

      const slider = await this.SliderService.updateById(id, updates)

      if (!slider) {
        return httpError(next, new Error('Slider not found'), req, 404)
      }

      return httpResponse(req, res, 200, 'Slider updated successfully', { slider })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }

  /**
   * Delete a slider
   */
  handleDeleteSlider = async (
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

      const slider = await this.SliderService.deleteById(id)

      if (!slider) {
        return httpError(next, new Error('Slider not found'), req, 404)
      }

      const imagePath = slider.imageUrl; 
      
      if (imagePath) {
        try {
          const fullPath = path.join(process.cwd(), imagePath);
          
          await fs.unlink(fullPath);
          console.log(`Successfully deleted orphaned file: ${fullPath}`);
        } catch (fileError: any) {
          console.error(`Failed to delete file off disk: ${imagePath}`, fileError.message);
        }
      }

      return httpResponse(req, res, 200, 'Slider deleted successfully', { slider })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }
}