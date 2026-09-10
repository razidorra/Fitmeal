import { Schema, model, type Types } from 'mongoose';

interface ReviewRecord {
  profileId: Types.ObjectId;
  clerkUserId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewRecord>({
  profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true, unique: true, sparse: true },
  clerkUserId: { type: String, required: true, unique: true, sparse: true },
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 800 },
}, { timestamps: true });

reviewSchema.index({ createdAt: -1 });

export const Review = model<ReviewRecord>('Review', reviewSchema);
