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
exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const emailService_1 = require("../services/emailService");
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '1d';
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, birthdate, birthTime } = req.body;
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const verificationToken = crypto_1.default.randomBytes(20).toString('hex');
        const user = new User_1.default({
            email,
            password,
            birthdate,
            birthTime,
            verificationToken
        });
        yield user.save();
        yield (0, emailService_1.sendVerificationEmail)(user.email, verificationToken);
        res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
    }
    catch (error) {
        logger_1.default.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in' });
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user);
        res.json({ token });
    }
    catch (error) {
        logger_1.default.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});
exports.login = login;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const user = yield User_1.default.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }
        user.isVerified = true;
        user.verificationToken = null;
        yield user.save();
        res.json({ message: 'Email verified successfully. You can now log in.' });
    }
    catch (error) {
        logger_1.default.error('Email verification error:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
});
exports.verifyEmail = verifyEmail;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        yield user.save();
        yield (0, emailService_1.sendPasswordResetEmail)(user.email, resetToken);
        res.json({ message: 'Password reset email sent' });
    }
    catch (error) {
        logger_1.default.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing forgot password request' });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = yield User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        yield user.save();
        res.json({ message: 'Password reset successful' });
    }
    catch (error) {
        logger_1.default.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});
exports.resetPassword = resetPassword;
