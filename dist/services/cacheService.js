"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCachedHoroscope = exports.getCachedHoroscope = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 86400 }); // Cache for 24 hours
const getCachedHoroscope = (key) => {
    return cache.get(key);
};
exports.getCachedHoroscope = getCachedHoroscope;
const setCachedHoroscope = (key, value) => {
    cache.set(key, value);
};
exports.setCachedHoroscope = setCachedHoroscope;
