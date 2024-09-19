"use strict";
// services/storePaymentService.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processStorePayment = processStorePayment;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
function verifyAppleReceipt(receiptData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post('https://sandbox.itunes.apple.com/verifyReceipt', {
                'receipt-data': receiptData,
                'password': process.env.APPLE_SHARED_SECRET // Make sure to set this in your .env file
            });
            // Parse the response and return the verification result
            // This is a simplified example. You'll need to handle various response cases.
            if (response.data.status === 0) {
                const latestReceipt = response.data.latest_receipt_info[0];
                return {
                    isValid: true,
                    subscriptionLevel: latestReceipt.product_id.includes('premium') ? 'premium' : 'pro',
                    expirationDate: new Date(latestReceipt.expires_date_ms)
                };
            }
            return { isValid: false };
        }
        catch (error) {
            logger_1.default.error('Apple receipt verification error:', error);
            return { isValid: false };
        }
    });
}
function verifyGooglePurchase(purchaseToken, subscriptionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // You'll need to set up Google OAuth2 client and get an access token
            const accessToken = 'YOUR_GOOGLE_ACCESS_TOKEN';
            const response = yield axios_1.default.get(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${process.env.ANDROID_PACKAGE_NAME}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            // Parse the response and return the verification result
            if (response.data.paymentState === 1) {
                return {
                    isValid: true,
                    subscriptionLevel: subscriptionId.includes('premium') ? 'premium' : 'pro',
                    expirationDate: new Date(parseInt(response.data.expiryTimeMillis))
                };
            }
            return { isValid: false };
        }
        catch (error) {
            logger_1.default.error('Google purchase verification error:', error);
            return { isValid: false };
        }
    });
}
function processStorePayment(user, storeReceipt, store) {
    return __awaiter(this, void 0, void 0, function* () {
        let verificationResult;
        if (store === 'apple') {
            verificationResult = yield verifyAppleReceipt(storeReceipt);
        }
        else {
            const [subscriptionId, purchaseToken] = storeReceipt.split(':');
            verificationResult = yield verifyGooglePurchase(purchaseToken, subscriptionId);
        }
        if (verificationResult.isValid) {
            user.subscriptionLevel = verificationResult.subscriptionLevel;
            user.subscriptionEndDate = verificationResult.expirationDate;
            if (store === 'apple') {
                user.appleSubscriptionId = storeReceipt;
            }
            else {
                user.googleSubscriptionId = storeReceipt;
            }
            yield user.save();
            return true;
        }
        return false;
    });
}
