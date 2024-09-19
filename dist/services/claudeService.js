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
exports.generateHoroscope = generateHoroscope;
exports.generateMotivationalQuote = generateMotivationalQuote;
const axios_1 = __importDefault(require("axios"));
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
function callClaude(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(CLAUDE_API_URL, {
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01'
                }
            });
            return response.data.content[0];
        }
        catch (error) {
            console.error('Error calling Claude API:', error);
            throw new Error('Failed to generate content with Claude');
        }
    });
}
function generateHoroscope(zodiacSign, date, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `Generate a ${type} horoscope for ${zodiacSign} starting from ${date}. 
  The horoscope should be positive, inspirational, and around ${type === 'daily' ? '100' : type === 'weekly' ? '200' : '300'} words long. 
  Include advice for love, career, and personal growth.`;
        const response = yield callClaude(prompt);
        return response.content;
    });
}
function generateMotivationalQuote(zodiacSign) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `Generate a short, inspiring motivational quote (around 20 words) for someone with the zodiac sign ${zodiacSign}. 
  The quote should be uplifting and relate to the general characteristics of the sign.`;
        const response = yield callClaude(prompt);
        return response.content;
    });
}
