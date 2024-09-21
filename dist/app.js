"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const horoscopeRoutes_1 = __importDefault(require("./routes/horoscopeRoutes"));
const tenantRoutes_1 = __importDefault(require("./routes/tenantRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
// Remove or add the following line if you have created the apiLogger middleware
//import { apiLogger } from './middleware/apiLogger';
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
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
mongoose_1.default.connect(MONGODB_URI)
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
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/horoscopes', horoscopeRoutes_1.default);
app.use('/api/tenants', tenantRoutes_1.default);
app.use('/api/subscriptions', subscriptionRoutes_1.default);
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});
// Error handling middleware
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
