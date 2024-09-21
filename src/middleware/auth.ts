import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret';

export interface AuthRequest extends Request {
  userId?: string;
  tenantId?: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; tenantId: string };
    const user = await User.findOne({ _id: decoded.userId, tenantId: decoded.tenantId });

    if (!user) {
      throw new Error('User not found');
    }

    req.userId = decoded.userId;
    req.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const generateTokens = (user: IUser) => {
  const accessToken = jwt.sign(
    { userId: user._id?.toString(), tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user._id?.toString(), tenantId: user.tenantId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

export const refreshAccessToken = (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string; tenantId: string };
    const accessToken = jwt.sign(
      { userId: decoded.userId, tenantId: decoded.tenantId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    return accessToken;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Remove the register, login, verifyEmail, forgotPassword, and resetPassword functions from this file
// as they are now in the authController.ts file