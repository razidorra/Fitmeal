import { Schema, model } from 'mongoose';
const checkinSchema = new Schema({ profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true }, weightKg: { type: Number, required: true }, note: String, date: { type: Date, default: Date.now } }, { timestamps: true });
export const Checkin = model('Checkin', checkinSchema);
