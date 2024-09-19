"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const horoscopeController_1 = require("../controllers/horoscopeController");
const router = express_1.default.Router();
// Public route
router.get('/public-horoscope', horoscopeController_1.getDailyHoroscope);
// Protected routes
router.get('/daily', auth_1.auth, horoscopeController_1.getDailyHoroscope);
router.get('/weekly', auth_1.auth, horoscopeController_1.getWeeklyHoroscope);
exports.default = router;
