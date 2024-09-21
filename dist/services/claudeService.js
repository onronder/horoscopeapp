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
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
const usageTracker_1 = require("../utils/usageTracker");
dotenv_1.default.config();
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const MAX_RETRIES = 3;
function callClaudeWithRetry(prompt_1) {
    return __awaiter(this, arguments, void 0, function* (prompt, retries = 0) {
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
            // Check for rate limiting
            if (response.headers['x-ratelimit-remaining']) {
                logger_1.default.info(`API calls remaining: ${response.headers['x-ratelimit-remaining']}`);
            }
            // Track API usage
            yield (0, usageTracker_1.trackApiUsage)();
            return response.data.content[0].text;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                if (error.response.status === 429 && retries < MAX_RETRIES) {
                    // Rate limited, wait and retry
                    const waitTime = parseInt(error.response.headers['retry-after'] || '5', 10) * 1000;
                    logger_1.default.warn(`Rate limited. Retrying after ${waitTime}ms`);
                    yield new Promise(resolve => setTimeout(resolve, waitTime));
                    return callClaudeWithRetry(prompt, retries + 1);
                }
                logger_1.default.error(`Claude API error: ${error.response.status} - ${error.response.data}`);
            }
            else {
                logger_1.default.error('Unexpected error calling Claude API:', error);
            }
            throw new Error('Failed to generate content with Claude');
        }
    });
}
function generateHoroscope(zodiacSign, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `Generate a ${type} horoscope for ${zodiacSign}. 
  The horoscope should be positive, inspirational, and around ${type === 'daily' ? '100' : type === 'weekly' ? '200' : '300'} words long. 
  Include advice for love, career, and personal growth.`;
        try {
            const horoscope = yield callClaudeWithRetry(prompt);
            logger_1.default.info(`Generated ${type} horoscope for ${zodiacSign}`);
            return horoscope;
        }
        catch (error) {
            logger_1.default.error(`Failed to generate ${type} horoscope for ${zodiacSign}:`, error);
            throw error;
        }
    });
}
function generateMotivationalQuote(zodiacSign) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `Generate a short, inspiring motivational quote (around 20 words) for someone with the zodiac sign ${zodiacSign}. 
  The quote should be uplifting and relate to the general characteristics of the sign.`;
        try {
            const quote = yield callClaudeWithRetry(prompt);
            logger_1.default.info(`Generated motivational quote for ${zodiacSign}`);
            return quote;
        }
        catch (error) {
            logger_1.default.error(`Failed to generate motivational quote for ${zodiacSign}:`, error);
            throw error;
        }
    });
}
