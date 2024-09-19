import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
  email: string;
  password: string;
  birthdate: Date;
  birthTime: string;
  subscriptionLevel: 'free' | 'premium' | 'pro';
  subscriptionEndDate: Date;
  isVerified: boolean;
  verificationToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
}

export interface UserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  birthTime: { type: String, required: true },
  subscriptionLevel: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
  subscriptionEndDate: { type: Date },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

UserSchema.pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<UserDocument>('User', UserSchema);