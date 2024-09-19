"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeSubscriptionValidators = void 0;
const express_validator_1 = require("express-validator");
exports.upgradeSubscriptionValidators = [
    (0, express_validator_1.body)('newLevel')
        .isIn(['premium', 'pro'])
        .withMessage('Invalid subscription level'),
    (0, express_validator_1.body)('paymentToken')
        .isString()
        .notEmpty()
        .withMessage('Payment token is required')
];
