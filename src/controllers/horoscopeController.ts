import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User, { IUser } from '../models/User';
import Horoscope from '../models/Horoscope';
import { generateHoroscope } from '../services/claudeService';
import logger from '../utils/logger';

export const getDailyHoroscope = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId) as IUser;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let horoscope = await Horoscope.findOne({
      tenantId: req.tenantId,
      zodiacSign: user.zodiacSign,
      date: today,
      type: 'daily'
    });

    if (!horoscope) {
      const content = await generateHoroscope(user.zodiacSign, 'daily');
      horoscope = new Horoscope({
        tenantId: req.tenantId,
        zodiacSign: user.zodiacSign,
        date: today,
        type: 'daily',
        content
      });
      await horoscope.save();
    }

    res.json({ zodiacSign: user.zodiacSign, date: today, horoscope: horoscope.content });
  } catch (error) {
    logger.error('Error generating daily horoscope:', error);
    res.status(500).json({ message: 'Error generating horoscope' });
  }
};

export const getWeeklyHoroscope = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ _id: req.userId, tenantId: req.tenantId }) as IUser;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.subscriptionLevel === 'free') {
      return res.status(403).json({ message: 'Upgrade to access weekly horoscopes' });
    }

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let horoscope = await Horoscope.findOne({
      tenantId: req.tenantId,
      zodiacSign: user.zodiacSign,
      date: startOfWeek,
      type: 'weekly'
    });

    if (!horoscope) {
      const content = await generateHoroscope(user.zodiacSign, 'weekly');
      horoscope = new Horoscope({
        tenantId: req.tenantId,
        zodiacSign: user.zodiacSign,
        date: startOfWeek,
        type: 'weekly',
        content
      });
      await horoscope.save();
    }

    res.json({ zodiacSign: user.zodiacSign, date: startOfWeek, horoscope: horoscope.content });
  } catch (error) {
    logger.error('Error generating weekly horoscope:', error);
    res.status(500).json({ message: 'Error generating horoscope' });
  }
};

export const getMonthlyHoroscope = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ _id: req.userId, tenantId: req.tenantId }) as IUser;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.subscriptionLevel !== 'pro') {
      return res.status(403).json({ message: 'Upgrade to pro to access monthly horoscopes' });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let horoscope = await Horoscope.findOne({
      tenantId: req.tenantId,
      zodiacSign: user.zodiacSign,
      date: startOfMonth,
      type: 'monthly'
    });
    if (!horoscope) {
      const content = await generateHoroscope(user.zodiacSign as string, 'monthly');
      horoscope = new Horoscope({
        tenantId: req.tenantId,
        zodiacSign: user.zodiacSign as string,
        date: startOfMonth,
        type: 'monthly',
        content
      });
      await horoscope.save();
    }

    res.json({ zodiacSign: user.zodiacSign, date: startOfMonth, horoscope: horoscope.content });
  } catch (error) {
    logger.error('Error generating monthly horoscope:', error);
    res.status(500).json({ message: 'Error generating horoscope' });
  }
};