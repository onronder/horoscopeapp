"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendVerificationEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield transporter.sendMail(mailOptions);
        logger_1.default.info(`Verification email sent to ${to}`);
    }
    catch (error) {
        logger_1.default.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield transporter.sendMail(mailOptions);
        logger_1.default.info(`Password reset email sent to ${to}`);
    }
    catch (error) {
        logger_1.default.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
