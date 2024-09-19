import nodemailer from 'nodemailer';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${process.env.APP_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Verify Your Email',
    html: `
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `${process.env.APP_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Reset Your Password',
    html: `
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};