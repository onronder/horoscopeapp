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
exports.refreshAccessToken = exports.generateTokens = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret';
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            throw new Error('No token provided');
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield User_1.default.findOne({ _id: decoded.userId, tenantId: decoded.tenantId });
        if (!user) {
            throw new Error('User not found');
        }
        req.userId = decoded.userId;
        req.tenantId = decoded.tenantId;
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication error:', error);
        res.status(401).json({ message: 'Please authenticate' });
    }
});
exports.auth = auth;
const generateTokens = (user) => {
    var _a, _b;
    const accessToken = jsonwebtoken_1.default.sign({ userId: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString(), tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString(), tenantId: user.tenantId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
        const accessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId, tenantId: decoded.tenantId }, JWT_SECRET, { expiresIn: '15m' });
        return accessToken;
    }
    catch (error) {
        throw new Error('Invalid refresh token');
    }
};
exports.refreshAccessToken = refreshAccessToken;
// Remove the register, login, verifyEmail, forgotPassword, and resetPassword functions from this file
// as they are now in the authController.ts file
