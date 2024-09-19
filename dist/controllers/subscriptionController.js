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
exports.upgradeSubscription = exports.getSubscriptionStatus = void 0;
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const paymentService_1 = require("../services/paymentService"); // We'll create this later
const getSubscriptionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            subscriptionLevel: user.subscriptionLevel,
            subscriptionEndDate: user.subscriptionEndDate
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching subscription status:', error);
        res.status(500).json({ message: 'Error fetching subscription status' });
    }
});
exports.getSubscriptionStatus = getSubscriptionStatus;
const upgradeSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.userId;
        const { newLevel, paymentToken } = req.body;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Process payment
        const paymentResult = yield (0, paymentService_1.processPayment)(paymentToken, newLevel);
        if (!paymentResult.success) {
            return res.status(400).json({ message: 'Payment failed', error: paymentResult.error });
        }
        user.subscriptionLevel = newLevel;
        user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        yield user.save();
        res.json({
            message: 'Subscription upgraded successfully',
            newLevel: user.subscriptionLevel,
            endDate: user.subscriptionEndDate
        });
    }
    catch (error) {
        logger_1.default.error('Error upgrading subscription:', error);
        res.status(500).json({ message: 'Error upgrading subscription' });
    }
});
exports.upgradeSubscription = upgradeSubscription;
