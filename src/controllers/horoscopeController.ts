import { Request, Response } from 'express';
import User from '../models/User';
import { generateHoroscope, generateMotivationalQuote } from '../services/claudeService';
import { getZodiacSign } from '../utils/astrology';
import { getCachedHoroscope, setCachedHoroscope } from '../services/cacheService';
import logger from '../utils/logger';

type HoroscopeType = 'daily' | 'weekly' | 'monthly';

const getHoroscope = async (
  userId: string, 
  type: HoroscopeType
): Promise<{ zodiacSign: string; date: string; horoscope: string }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const zodiacSign = getZodiacSign(user.birthdate);
  const today = new Date();
  let date: string;
  let cacheKey: string;

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

  let horoscope = getCachedHoroscope(cacheKey);

  if (!horoscope) {
    logger.info(`Generating new ${type} horoscope for ${zodiacSign} on ${date}`);
    horoscope = await generateHoroscope(zodiacSign, date, type);
    setCachedHoroscope(cacheKey, horoscope);
  } else {
    logger.info(`Retrieved cached ${type} horoscope for ${zodiacSign} on ${date}`);
  }

  return { zodiacSign, date, horoscope };
};

export const getDailyHoroscope = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await getHoroscope(userId, 'daily');
    res.json(result);
  } catch (error) {
    logger.error('Error fetching daily horoscope:', error);
    res.status(500).json({ message: 'Error generating daily horoscope' });
  }
};

export const getWeeklyHoroscope = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await getHoroscope(userId, 'weekly');
    res.json(result);
  } catch (error) {
    logger.error('Error fetching weekly horoscope:', error);
    res.status(500).json({ message: 'Error generating weekly horoscope' });
  }
};

export const getMonthlyHoroscope = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await getHoroscope(userId, 'monthly');
    res.json(result);
  } catch (error) {
    logger.error('Error fetching monthly horoscope:', error);
    res.status(500).json({ message: 'Error generating monthly horoscope' });
  }
};

export const getDailyMotivationalQuote = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const zodiacSign = getZodiacSign(user.birthdate);
    const today = new Date().toISOString().split('T')[0];
    
    const cacheKey = `quote:${zodiacSign}:${today}`;
    let quote = getCachedHoroscope(cacheKey);

    if (!quote) {
      logger.info(`Generating new motivational quote for ${zodiacSign} on ${today}`);
      quote = await generateMotivationalQuote(zodiacSign);
      setCachedHoroscope(cacheKey, quote);
    } else {
      logger.info(`Retrieved cached motivational quote for ${zodiacSign} on ${today}`);
    }
    
    res.json({ zodiacSign, date: today, quote });
  } catch (error) {
    logger.error('Error fetching motivational quote:', error);
    res.status(500).json({ message: 'Error generating motivational quote' });
  }
};