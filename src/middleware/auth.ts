import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../models/User';
import logger from '../utils/logger';
import { Document, Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface AuthRequest extends Request {
  userId?: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).exec();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Explicitly type user as UserDocument
    const userDoc = user as UserDocument;

    // Use toObject() to convert the Mongoose document to a plain JavaScript object
    const userObject = userDoc.toObject();

    // Now we can safely access _id
    req.userId = userObject._id.toString();
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is invalid' });
  }
};

// Type guard function (if needed for other parts of your application)
function isUserDocument(user: any): user is UserDocument {
  return user instanceof Document && 'subscriptionLevel' in user;
}