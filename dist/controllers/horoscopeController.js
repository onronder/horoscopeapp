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
exports.getDailyMotivationalQuote = exports.getMonthlyHoroscope = exports.getWeeklyHoroscope = exports.getDailyHoroscope = void 0;
const User_1 = __importDefault(require("../models/User"));
const claudeService_1 = require("../services/claudeService");
const astrology_1 = require("../utils/astrology");
const cacheService_1 = require("../services/cacheService");
const logger_1 = __importDefault(require("../utils/logger"));
const getHoroscope = (userId, type) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const zodiacSign = (0, astrology_1.getZodiacSign)(user.birthdate);
    const today = new Date();
    let date;
    let cacheKey;
    switch (type) {
        case 'daily':
            date = today.toISOString().split('T')[0];
            cacheKey = `horoscope:daily:${zodiacSign}:${date}`;
            break;
        case 'weekly':
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            date = startOfWeek.toISOString().split('T')[0];
            cacheKey = `horoscope:weekly:${zodiacSign}:${date}`;
            break;
        case 'monthly':
            date = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-01`;
            cacheKey = `horoscope:monthly:${zodiacSign}:${date}`;
            break;
        default:
            throw new Error('Invalid horoscope type');
    }
    let horoscope = (0, cacheService_1.getCachedHoroscope)(cacheKey);
    if (!horoscope) {
        logger_1.default.info(`Generating new ${type} horoscope for ${zodiacSign} on ${date}`);
        horoscope = yield (0, claudeService_1.generateHoroscope)(zodiacSign, date, type);
        (0, cacheService_1.setCachedHoroscope)(cacheKey, horoscope);
    }
    else {
        logger_1.default.info(`Retrieved cached ${type} horoscope for ${zodiacSign} on ${date}`);
    }
    return { zodiacSign, date, horoscope };
});
const getDailyHoroscope = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const result = yield getHoroscope(userId, 'daily');
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error fetching daily horoscope:', error);
        res.status(500).json({ message: 'Error generating daily horoscope' });
    }
});
exports.getDailyHoroscope = getDailyHoroscope;
const getWeeklyHoroscope = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const result = yield getHoroscope(userId, 'weekly');
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error fetching weekly horoscope:', error);
        res.status(500).json({ message: 'Error generating weekly horoscope' });
    }
});
exports.getWeeklyHoroscope = getWeeklyHoroscope;
const getMonthlyHoroscope = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const result = yield getHoroscope(userId, 'monthly');
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error fetching monthly horoscope:', error);
        res.status(500).json({ message: 'Error generating monthly horoscope' });
    }
});
exports.getMonthlyHoroscope = getMonthlyHoroscope;
const getDailyMotivationalQuote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const zodiacSign = (0, astrology_1.getZodiacSign)(user.birthdate);
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `quote:${zodiacSign}:${today}`;
        let quote = (0, cacheService_1.getCachedHoroscope)(cacheKey);
        if (!quote) {
            logger_1.default.info(`Generating new motivational quote for ${zodiacSign} on ${today}`);
            quote = yield (0, claudeService_1.generateMotivationalQuote)(zodiacSign);
            (0, cacheService_1.setCachedHoroscope)(cacheKey, quote);
        }
        else {
            logger_1.default.info(`Retrieved cached motivational quote for ${zodiacSign} on ${today}`);
        }
        res.json({ zodiacSign, date: today, quote });
    }
    catch (error) {
        logger_1.default.error('Error fetching motivational quote:', error);
        res.status(500).json({ message: 'Error generating motivational quote' });
    }
});
exports.getDailyMotivationalQuote = getDailyMotivationalQuote;
