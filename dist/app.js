"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const horoscopeRoutes_1 = __importDefault(require("./routes/horoscopeRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(express_1.default.json());
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => logger_1.default.info('Connected to MongoDB'))
    .catch((error) => logger_1.default.error('MongoDB connection error:', error));
app.use('/auth', authRoutes_1.default);
app.use('/horoscope', horoscopeRoutes_1.default);
app.use('/subscription', subscriptionRoutes_1.default);
app.use(errorHandler_1.errorHandler);
app.use(limiter);
app.use('/user', userRoutes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
