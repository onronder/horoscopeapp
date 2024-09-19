import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import horoscopeRoutes from './routes/horoscopeRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import { errorHandler } from './middleware/errorHandler';
import rateLimit from 'express-rate-limit';
import userRoutes from './routes/userRoutes';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((error) => logger.error('MongoDB connection error:', error));

app.use('/auth', authRoutes);
app.use('/horoscope', horoscopeRoutes);
app.use('/subscription', subscriptionRoutes);
app.use(errorHandler);
app.use(limiter);
app.use('/user', userRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});