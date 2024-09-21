import express from 'express';
import { getSubscriptionStatus, upgradeSubscription } from '../controllers/subscriptionController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/status', auth, getSubscriptionStatus);
router.post('/upgrade', auth, upgradeSubscription);

export default router;