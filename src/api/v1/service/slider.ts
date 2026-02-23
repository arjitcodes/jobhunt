import { Model } from 'mongoose';
import type { ISlider } from './../../v1/interface/slider.js';

export class SliderService {
  private SliderModel: Model<ISlider>;

  constructor(SliderModel: Model<ISlider>) {
    this.SliderModel = SliderModel;
  }

  /**
   * Fetch sliders with pagination (defaults to 8 items per page for the grid UI)
   */
  findAll = async (filter: Record<string, any> = {}, page: number = 1, limit: number = 8) => {
    try {
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        this.SliderModel.find(filter)
          .sort({ order: 1, createdAt: -1 }) // Sorts by order first, then newest
          .skip(skip)
          .limit(limit),
        this.SliderModel.countDocuments(filter)
      ]);

      return { 
        data, 
        total, 
        pages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      console.error(`[SliderService] Error fetching sliders: ${error}`);
      throw error;
    }
  };


  /**
   * Update general slider details (like fixing a name typo, changing order, or replacing the image)
   */
  updateById = async (id: string, updates: Partial<ISlider>): Promise<ISlider | null> => {
    try {
      return await this.SliderModel.findByIdAndUpdate(id, updates, { 
        new: true, 
        runValidators: true 
      });
    } catch (error) {
      console.error(`[SliderService] Error updating slider: ${error}`);
      throw error;
    }
  };

  // ... rest of the methods (addOne, toggleStatus, deleteById) remain exactly the same
  addOne = async (sliderData: Partial<ISlider>): Promise<ISlider> => {
    try {
      const newSlider = new this.SliderModel(sliderData);
      return await newSlider.save();
    } catch (error) {
      console.error(`[SliderService] Error adding slider: ${error}`);
      throw error;
    }
  };

  toggleStatus = async (id: string, currentStatus: boolean): Promise<ISlider | null> => {
    try {
      return await this.SliderModel.findByIdAndUpdate(
        id, 
        { status: !currentStatus }, 
        { new: true }
      );
    } catch (error) {
      console.error(`[SliderService] Error toggling slider status: ${error}`);
      throw error;
    }
  };

  deleteById = async (id: string): Promise<ISlider | null> => {
    try {
      return await this.SliderModel.findByIdAndDelete(id);
    } catch (error) {
      console.error(`[SliderService] Error deleting slider: ${error}`);
      throw error;
    }
  };
}