import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { generateTokens, refreshAccessToken } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, birthdate, birthTime } = req.body;
    const tenantId = req.header('X-Tenant-ID') || 'default';

    logger.info(`Registration attempt for email: ${email}, tenant: ${tenantId}`);

    const existingUser = await User.findOne({ email, tenantId });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const newUser = new User({
      email,
      password: hashedPassword,
      birthdate,
      birthTime,
      tenantId,
      verificationToken
    });

    await newUser.save();

    await sendVerificationEmail(email, verificationToken);

    logger.info(`User registered successfully: ${email}, tenant: ${tenantId}`);
    res.status(201).json({ message: 'User registered successfully. Please check your email for verification.' });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { isVerified: true }, $unset: { verificationToken: 1 } }
    );

    logger.info(`Email verified for user: ${user.email}`);
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const tenantId = req.header('X-Tenant-ID') || 'default';

    const user = await User.findOne({ email, tenantId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resetToken = Math.random().toString(36).substring(2, 15);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
        }
      }
    );

    await sendPasswordResetEmail(email, resetToken);

    logger.info(`Password reset requested for user: ${email}, tenant: ${tenantId}`);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing forgot password request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: user.password,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      }
    );

    logger.info(`Password reset successfully for user: ${user.email}`);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email, tenantId: user.tenantId } });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const newAccessToken = refreshAccessToken(refreshToken);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// ... other controller functions (login, etc.) remain the same