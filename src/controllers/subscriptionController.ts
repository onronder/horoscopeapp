import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import logger from '../utils/logger';
import { processPayment } from '../services/paymentService'; // We'll create this later

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      subscriptionLevel: user.subscriptionLevel,
      subscriptionEndDate: user.subscriptionEndDate
    });
  } catch (error) {
    logger.error('Error fetching subscription status:', error);
    res.status(500).json({ message: 'Error fetching subscription status' });
  }
};

export const upgradeSubscription = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.userId;
    const { newLevel, paymentToken } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process payment
    const paymentResult = await processPayment(paymentToken, newLevel);

    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Payment failed', error: paymentResult.error });
    }

    user.subscriptionLevel = newLevel;
    user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    await user.save();

    res.json({
      message: 'Subscription upgraded successfully',
      newLevel: user.subscriptionLevel,
      endDate: user.subscriptionEndDate
    });
  } catch (error) {
    logger.error('Error upgrading subscription:', error);
    res.status(500).json({ message: 'Error upgrading subscription' });
  }
};