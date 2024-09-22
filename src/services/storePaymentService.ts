// services/storePaymentService.ts

import axios from 'axios';
import User, { IUser } from '../models/User';
import logger from '../utils/logger';

interface VerificationResult {
  isValid: boolean;
  subscriptionLevel?: 'premium' | 'pro';
  expirationDate?: Date;
}

async function verifyAppleReceipt(receiptData: string): Promise<VerificationResult> {
  try {
    const response = await axios.post('https://sandbox.itunes.apple.com/verifyReceipt', {
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
  } catch (error) {
    logger.error('Apple receipt verification error:', error);
    return { isValid: false };
  }
}

async function verifyGooglePurchase(purchaseToken: string, subscriptionId: string): Promise<VerificationResult> {
  try {
    // You'll need to set up Google OAuth2 client and get an access token
    const accessToken = 'YOUR_GOOGLE_ACCESS_TOKEN';
    const response = await axios.get(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${process.env.ANDROID_PACKAGE_NAME}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    // Parse the response and return the verification result
    if (response.data.paymentState === 1) {
      return {
        isValid: true,
        subscriptionLevel: subscriptionId.includes('premium') ? 'premium' : 'pro',
        expirationDate: new Date(parseInt(response.data.expiryTimeMillis))
      };
    }
    return { isValid: false };
  } catch (error) {
    logger.error('Google purchase verification error:', error);
    return { isValid: false };
  }
}

export async function processStorePayment(user: IUser, storeReceipt: string, store: 'apple' | 'google'): Promise<boolean> {
  let verificationResult: VerificationResult;

  if (store === 'apple') {
    verificationResult = await verifyAppleReceipt(storeReceipt);
  } else {
    const [subscriptionId, purchaseToken] = storeReceipt.split(':');
    verificationResult = await verifyGooglePurchase(purchaseToken, subscriptionId);
  }

  if (verificationResult.isValid) {
    user.subscriptionLevel = verificationResult.subscriptionLevel!;
    user.subscriptionEndDate = verificationResult.expirationDate!;
    if (store === 'apple') {
      user.appleSubscriptionId = storeReceipt;
    } else {
      user.googleSubscriptionId = storeReceipt;
    }
    await user.save();
    return true;
  }

  return false;
}