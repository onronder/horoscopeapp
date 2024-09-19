import express from 'express';
import { auth } from '../middleware/auth';
import { getDailyHoroscope, getWeeklyHoroscope } from '../controllers/horoscopeController';

const router = express.Router();

// Public route
router.get('/public-horoscope', getDailyHoroscope);

// Protected routes
router.get('/daily', auth, getDailyHoroscope);
router.get('/weekly', auth, getWeeklyHoroscope);

export default router;