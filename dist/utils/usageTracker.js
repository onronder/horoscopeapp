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
exports.trackApiUsage = trackApiUsage;
exports.getApiUsage = getApiUsage;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
const USAGE_FILE = path_1.default.join(__dirname, '..', '..', 'api_usage.json');
function readUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield promises_1.default.readFile(USAGE_FILE, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, return an empty array
                return [];
            }
            // For other errors, log and rethrow
            logger_1.default.error('Error reading usage file:', error);
            throw error;
        }
    });
}
function writeUsage(usage) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield promises_1.default.writeFile(USAGE_FILE, JSON.stringify(usage, null, 2));
        }
        catch (error) {
            logger_1.default.error('Error writing usage file:', error);
            throw error;
        }
    });
}
function trackApiUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const usage = yield readUsage();
            const today = new Date().toISOString().split('T')[0];
            const todayUsage = usage.find(u => u.date === today);
            if (todayUsage) {
                todayUsage.count++;
            }
            else {
                usage.push({ date: today, count: 1 });
            }
            yield writeUsage(usage);
            logger_1.default.info(`API usage for ${today}: ${todayUsage ? todayUsage.count : 1}`);
        }
        catch (error) {
            logger_1.default.error('Error tracking API usage:', error);
            // Don't throw here, as we don't want to interrupt the main application flow
            // if usage tracking fails
        }
    });
}
function getApiUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield readUsage();
        }
        catch (error) {
            logger_1.default.error('Error getting API usage:', error);
            return [];
        }
    });
}
