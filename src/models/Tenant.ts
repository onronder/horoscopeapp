import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  tenantId: string;
  name: string;
  domain: string;
  isActive: boolean;
}

const TenantSchema: Schema = new Schema({
  tenantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ITenant>('Tenant', TenantSchema);