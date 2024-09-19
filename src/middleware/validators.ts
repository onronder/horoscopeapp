import { body, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('birthdate').isISO8601().toDate().withMessage('Enter a valid birthdate'),
  body('birthTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Enter a valid birth time (HH:MM)')
];

export const loginValidator: ValidationChain[] = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

export const subscriptionValidator: ValidationChain[] = [
  body('subscriptionLevel').isIn(['free', 'premium', 'pro']).withMessage('Invalid subscription level'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
];