"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.get('/test-db', (req, res) => {
    if (mongoose_1.default.connection.readyState === 1) {
        res.status(200).json({ message: 'Database connected successfully' });
    }
    else {
        res.status(500).json({ message: 'Database connection failed' });
    }
});
router.get('/test-env', (req, res) => {
    res.json({
        mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
        claudeApiKey: process.env.CLAUDE_API_KEY ? 'Set' : 'Not set',
        port: process.env.PORT,
        nodeEnv: process.env.NODE_ENV
    });
});
exports.default = router;
