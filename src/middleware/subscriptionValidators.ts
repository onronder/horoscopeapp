import { body } from 'express-validator';

export const upgradeSubscriptionValidators = [
  body('newLevel')
    .isIn(['premium', 'pro'])
    .withMessage('Invalid subscription level'),
  body('paymentToken')
    .isString()
    .notEmpty()
    .withMessage('Payment token is required')
];