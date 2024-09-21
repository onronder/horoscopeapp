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
exports.getMonthlyHoroscope = exports.getWeeklyHoroscope = exports.getDailyHoroscope = void 0;
const User_1 = __importDefault(require("../models/User"));
const Horoscope_1 = __importDefault(require("../models/Horoscope"));
const claudeService_1 = require("../services/claudeService");
const logger_1 = __importDefault(require("../utils/logger"));
const getDailyHoroscope = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let horoscope = yield Horoscope_1.default.findOne({
            tenantId: req.tenantId,
            zodiacSign: user.zodiacSign,
            date: today,
            type: 'daily'
        });
        if (!horoscope) {
            const content = yield (0, claudeService_1.generateHoroscope)(user.zodiacSign, 'daily');
            horoscope = new Horoscope_1.default({
                tenantId: req.tenantId,
                zodiacSign: user.zodiacSign,
                date: today,
                type: 'daily',
                content
            });
            yield horoscope.save();
        }
        res.json({ zodiacSign: user.zodiacSign, date: today, horoscope: horoscope.content });
    }
    catch (error) {
        logger_1.default.error('Error generating daily horoscope:', error);
        res.status(500).json({ message: 'Error generating horoscope' });
    }
});
exports.getDailyHoroscope = getDailyHoroscope;
const getWeeklyHoroscope = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ _id: req.userId, tenantId: req.tenantId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.subscriptionLevel === 'free') {
            return res.status(403).json({ message: 'Upgrade to access weekly horoscopes' });
        }
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        let horoscope = yield Horoscope_1.default.findOne({
            tenantId: req.tenantId,
            zodiacSign: user.zodiacSign,
            date: startOfWeek,
            type: 'weekly'
        });
        if (!horoscope) {
            const content = yield (0, claudeService_1.generateHoroscope)(user.zodiacSign, 'weekly');
            horoscope = new Horoscope_1.default({
                tenantId: req.tenantId,
                zodiacSign: user.zodiacSign,
                date: startOfWeek,
                type: 'weekly',
                content
            });
            yield horoscope.save();
        }
        res.json({ zodiacSign: user.zodiacSign, date: startOfWeek, horoscope: horoscope.content });
    }
    catch (error) {
        logger_1.default.error('Error generating weekly horoscope:', error);
        res.status(500).json({ message: 'Error generating horoscope' });
    }
});
exports.getWeeklyHoroscope = getWeeklyHoroscope;
const getMonthlyHoroscope = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ _id: req.userId, tenantId: req.tenantId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.subscriptionLevel !== 'pro') {
            return res.status(403).json({ message: 'Upgrade to pro to access monthly horoscopes' });
        }
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        let horoscope = yield Horoscope_1.default.findOne({
            tenantId: req.tenantId,
            zodiacSign: user.zodiacSign,
            date: startOfMonth,
            type: 'monthly'
        });
        if (!horoscope) {
            const content = yield (0, claudeService_1.generateHoroscope)(user.zodiacSign, 'monthly');
            horoscope = new Horoscope_1.default({
                tenantId: req.tenantId,
                zodiacSign: user.zodiacSign,
                date: startOfMonth,
                type: 'monthly',
                content
            });
            yield horoscope.save();
        }
        res.json({ zodiacSign: user.zodiacSign, date: startOfMonth, horoscope: horoscope.content });
    }
    catch (error) {
        logger_1.default.error('Error generating monthly horoscope:', error);
        res.status(500).json({ message: 'Error generating horoscope' });
    }
});
exports.getMonthlyHoroscope = getMonthlyHoroscope;
