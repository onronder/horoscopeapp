import { Request, Response } from 'express';
import User from '../models/User';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { birthdate, birthTime } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { birthdate, birthTime },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile' });
  }
};