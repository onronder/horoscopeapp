import express from 'express';
import { auth } from '../middleware/auth';
import { getSubscriptionStatus, upgradeSubscription } from '../controllers/subscriptionController';
import { upgradeSubscriptionValidators } from '../middleware/subscriptionValidators';

const router = express.Router();

router.get('/status', auth, getSubscriptionStatus);
router.post('/upgrade', auth, upgradeSubscriptionValidators, upgradeSubscription);

export default router;