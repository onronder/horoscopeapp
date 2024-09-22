import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/test-db', (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ message: 'Database connected successfully' });
  } else {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

router.get('/test-env', (req: Request, res: Response) => {
  res.json({
    mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    claudeApiKey: process.env.CLAUDE_API_KEY ? 'Set' : 'Not set',
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV
  });
});

export default router;