"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionValidator = exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidator = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Enter a valid email address'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('birthdate').isISO8601().toDate().withMessage('Enter a valid birthdate'),
    (0, express_validator_1.body)('birthTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Enter a valid birth time (HH:MM)')
];
exports.loginValidator = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Enter a valid email address'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
exports.subscriptionValidator = [
    (0, express_validator_1.body)('subscriptionLevel').isIn(['free', 'premium', 'pro']).withMessage('Invalid subscription level'),
    (0, express_validator_1.body)('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
];
