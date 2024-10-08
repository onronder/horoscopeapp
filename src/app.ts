import express, { Router } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import horoscopeRoutes from './routes/horoscopeRoutes';
import tenantRoutes from './routes/tenantRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import testRoutes from './routes/testRoutes';
// Add this line
// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
// Remove or add the following line if you have created the apiLogger middleware
//import { apiLogger } from './middleware/apiLogger';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
// Remove or add the following line if you have created the apiLogger middleware
//app.use(apiLogger);

// Route logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Horoscope API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/horoscopes', horoscopeRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/test', testRoutes);  // Add this line

// Database connection test route
const testDbRouter = Router();
testDbRouter.get('/test-db', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ message: 'Database connected successfully' });
  } else {
    res.status(500).json({ message: 'Database connection failed' });
  }
});
app.use('/api', testDbRouter);

// Environment variables test route
app.get('/api/test-env', (req, res) => {
  res.json({
    mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    claudeApiKey: process.env.CLAUDE_API_KEY ? 'Set' : 'Not set',
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;