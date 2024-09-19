import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

export default router;