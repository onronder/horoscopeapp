"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateZodiacSign = calculateZodiacSign;
exports.generateVerificationToken = generateVerificationToken;
exports.generateResetToken = generateResetToken;
exports.generateRandomPassword = generateRandomPassword;
exports.isValidEmail = isValidEmail;
exports.isStrongPassword = isStrongPassword;
exports.formatDate = formatDate;
exports.calculateAge = calculateAge;
const crypto_1 = __importDefault(require("crypto"));
// Calculate zodiac sign based on birthdate
function calculateZodiacSign(birthdate) {
    const month = birthdate.getMonth() + 1; // JavaScript months are 0-indexed
    const day = birthdate.getDate();
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
        return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
        return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
        return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
        return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22))
        return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
        return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
        return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
        return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
        return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
        return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
        return 'Aquarius';
    return 'Pisces';
}
// Generate a verification token
function generateVerificationToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
// Generate a reset token
function generateResetToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
// Generate a random password (useful for temporary passwords or testing)
function generateRandomPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
}
// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Validate password strength
function isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}
// Format date to YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
// Calculate age from birthdate
function calculateAge(birthdate) {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDifference = today.getMonth() - birthdate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age;
}
