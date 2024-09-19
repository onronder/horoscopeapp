import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '1d';

const generateToken = (user: IUser) => {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, birthdate, birthTime } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = new User({
      email,
      password,
      birthdate,
      birthTime,
      verificationToken
    });

    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing forgot password request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};