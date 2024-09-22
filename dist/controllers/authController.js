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
exports.refreshToken = exports.login = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const emailService_1 = require("../services/emailService");
const logger_1 = __importDefault(require("../utils/logger"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, birthdate, birthTime } = req.body;
        const tenantId = req.header('X-Tenant-ID') || 'default';
        logger_1.default.info(`Registration attempt for email: ${email}, tenant: ${tenantId}`);
        const existingUser = yield User_1.default.findOne({ email, tenantId });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const verificationToken = (0, uuid_1.v4)();
        const newUser = new User_1.default({
            email,
            password: hashedPassword,
            birthdate,
            birthTime,
            tenantId,
            verificationToken
        });
        yield newUser.save();
        yield (0, emailService_1.sendVerificationEmail)(email, verificationToken);
        logger_1.default.info(`User registered successfully: ${email}, tenant: ${tenantId}`);
        res.status(201).json({ message: 'User registered successfully. Please check your email for verification.' });
    }
    catch (error) {
        logger_1.default.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});
exports.register = register;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const user = yield User_1.default.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }
        yield User_1.default.updateOne({ _id: user._id }, { $set: { isVerified: true }, $unset: { verificationToken: 1 } });
        logger_1.default.info(`Email verified for user: ${user.email}`);
        res.json({ message: 'Email verified successfully' });
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
        const tenantId = req.header('X-Tenant-ID') || 'default';
        const user = yield User_1.default.findOne({ email, tenantId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const resetToken = Math.random().toString(36).substring(2, 15);
        yield User_1.default.updateOne({ _id: user._id }, {
            $set: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
            }
        });
        yield (0, emailService_1.sendPasswordResetEmail)(email, resetToken);
        logger_1.default.info(`Password reset requested for user: ${email}, tenant: ${tenantId}`);
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
        const { token, newPassword } = req.body;
        const user = yield User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        user.password = yield bcrypt_1.default.hash(newPassword, 10);
        yield User_1.default.updateOne({ _id: user._id }, {
            $set: {
                password: user.password,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });
        logger_1.default.info(`Password reset successfully for user: ${user.email}`);
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        logger_1.default.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});
exports.resetPassword = resetPassword;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user || !(yield user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user);
        res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email, tenantId: user.tenantId } });
    }
    catch (error) {
        logger_1.default.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        const newAccessToken = (0, auth_1.refreshAccessToken)(refreshToken);
        res.json({ accessToken: newAccessToken });
    }
    catch (error) {
        logger_1.default.error('Refresh token error:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
});
exports.refreshToken = refreshToken;
// ... other controller functions (login, etc.) remain the same
