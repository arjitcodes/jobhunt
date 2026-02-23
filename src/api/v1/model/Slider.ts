import mongoose, { Schema } from "mongoose";

const sliderSchema = new Schema({
  name: { type: String, required: true },    // Slider Name input
  imageUrl: { type: String, required: true }, // The uploaded file path
  status: { type: Boolean, default: true },   // The green/blue toggle switch
  link: { type: String },                     // Optional: where the slider points to
  order: { type: Number, default: 0 }         // To manage the display sequence
}, { timestamps: true });

export const Slider = mongoose.model("Slider", sliderSchema);