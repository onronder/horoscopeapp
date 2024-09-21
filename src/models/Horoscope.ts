import mongoose, { Document, Schema } from 'mongoose';

export interface IHoroscope extends Document {
  tenantId: string;
  zodiacSign: string;
  date: Date;
  type: 'daily' | 'weekly' | 'monthly';
  content: string;
}

const HoroscopeSchema: Schema = new Schema({
  tenantId: { type: String, required: true },
  zodiacSign: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  content: { type: String, required: true }
}, { timestamps: true });

HoroscopeSchema.index({ tenantId: 1, zodiacSign: 1, date: 1, type: 1 }, { unique: true });

export default mongoose.model<IHoroscope>('Horoscope', HoroscopeSchema);