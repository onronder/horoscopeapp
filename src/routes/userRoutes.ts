import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Get all users' });
  });
  
  router.get('/:id', (req, res) => {
    res.status(200).json({ message: 'Get user by ID' });
  });

export default router;