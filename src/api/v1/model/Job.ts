import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema({
  title: { type: String, required: true },         // "Hotel Udaan Designer Team"
  designation: { type: String, required: true },   // "Sr. Graphic Designer"
  salary: { type: String },                        // "15k"
  category: { type: String },                      // "Design & Architecture"
  jobType: { type: String },                       // "Full-Time"
  location: { type: String },                      // "Darjeeling, India"
  deadline: { type: String },                      // "22 December 2025"
  image: { type: String },                         // URL for the job/company image
  skills: { type: String },                        // "React, CSS, HTML"
  details: { type: String },                       // "Full job details..."
  isActive: { type: Boolean, default: true }       // For the toggle switch in the list
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);