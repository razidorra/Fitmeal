import { Schema, model, type Types } from 'mongoose';

interface CheckinRecord {
  profileId: Types.ObjectId;
  weightKg: number;
  note?: string;
  date: Date;
}

const checkinSchema = new Schema<CheckinRecord>({
  profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
  weightKg: { type: Number, required: true, min: 30, max: 350 },
  note: { type: String, trim: true, minlength: 1, maxlength: 300 },
  date: { type: Date, required: true, default: Date.now, index: true },
}, { timestamps: true });

checkinSchema.index({ profileId: 1, date: -1 });

export const Checkin = model<CheckinRecord>('Checkin', checkinSchema);
