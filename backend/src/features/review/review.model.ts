import { Schema, model } from 'mongoose';

interface ReviewRecord {
  name: string;
  email?: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewRecord>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, select: false },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 800 },
}, { timestamps: true });

reviewSchema.index({ createdAt: -1 });

export const Review = model<ReviewRecord>('Review', reviewSchema);
