/**
 * Bank Muscat Payment API Endpoints
 * Firebase Functions for Payment Gateway Integration
 */

import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { bankMuscatService } from '../services/bank-muscat.service';
import {
  CreatePaymentRequest,
  PaymentConfirmation,
  WebhookPayload,
  WebhookResponse,
  PaymentError
} from '../types/payment.types';

/**
 * Create Payment - POST /api/payments/create
 * Creates a new payment session with Bank Muscat
 */
export const createPayment = functions.https.onRequest(async (req: Request, res: Response) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Validate request body
    const {
      amount,
      currency = 'OMR',
      orderId,
      customerEmail,
      customerPhone,
      description,
      metadata,
      successUrl,
      failureUrl,
      cancelUrl
    }: CreatePaymentRequest = req.body;

    // Input validation
    if (!amount || amount <= 0) {
      res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
      return;
    }

    if (!orderId || orderId.trim().length === 0) {
      res.status(400).json({
        error: 'Missing orderId',
        message: 'Order ID is required'
      });
      return;
    }

    // Validate currency
    const validCurrencies = ['OMR', 'USD', 'EUR', 'SAR', 'AED'];
    if (!validCurrencies.includes(currency)) {
      res.status(400).json({
        error: 'Invalid currency',
        message: `Currency must be one of: ${validCurrencies.join(', ')}`
      });
      return;
    }

    // Validate email format if provided
    if (customerEmail && !isValidEmail(customerEmail)) {
      res.status(400).json({
        error: 'Invalid email',
        message: 'Customer email format is invalid'
      });
      return;
    }

    functions.logger.info('Creating payment session', {
      orderId,
      amount,
      currency,
      customerEmail
    });

    // Create payment with Bank Muscat
    const paymentResult = await bankMuscatService.createPayment({
      amount,
      currency,
      orderId,
      customerEmail,
      customerPhone,
      description,
      metadata,
      successUrl,
      failureUrl,
      cancelUrl
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        orderId: orderId,
        sessionId: paymentResult.session.session.id,
        amount: amount,
        currency: currency,
        redirectUrl: paymentResult.redirectUrl,
        checkoutUrl: paymentResult.checkoutUrl,
        order: {
          id: paymentResult.order.order.id,
          status: paymentResult.order.order.status,
          creationTime: paymentResult.order.timeOfRecord
        },
        session: {
          id: paymentResult.session.session.id,
          updateStatus: paymentResult.session.session.updateStatus,
          version: paymentResult.session.session.version
        }
      },
      message: 'Payment session created successfully'
    });

  } catch (error: any) {
    functions.logger.error('Payment creation failed', error);

    // Handle PaymentError specifically
    if (error.code && error.message) {
      const paymentError = error as PaymentError;
      res.status(400).json({
        success: false,
        error: paymentError.code,
        message: paymentError.message,
        details: paymentError.details,
        field: paymentError.field
      });
      return;
    }

    // Handle generic errors
    res.status(500).json({
      success: false,
      error: 'PAYMENT_CREATION_FAILED',
      message: 'Failed to create payment session',
      details: error.message
    });
  }
});

/**
 * Payment Webhook - POST /api/payments/webhook
 * Receives payment notifications from Bank Muscat
 */
export const paymentWebhook = functions.https.onRequest(async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    functions.logger.info('Received payment webhook', {
      headers: req.headers,
      body: req.body
    });

    // Extract webhook data
    const webhookData: WebhookPayload = req.body;
    
    if (!webhookData.orderId) {
      res.status(400).json({
        success: false,
        message: 'Missing orderId in webhook data'
      });
      return;
    }

    // Validate webhook signature if configured
    const signature = req.headers['x-signature'] as string || req.headers['signature'] as string;
    const rawBody = JSON.stringify(req.body);
    
    if (signature && !bankMuscatService.validateWebhookSignature(rawBody, signature)) {
      functions.logger.warn('Invalid webhook signature', { orderId: webhookData.orderId });
      res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
      return;
    }

    // Verify payment status with Bank Muscat API
    try {
      const paymentInquiry = await bankMuscatService.inquirePayment(webhookData.orderId);
      
      functions.logger.info('Payment inquiry result', {
        orderId: webhookData.orderId,
        result: paymentInquiry.result,
        status: paymentInquiry.order.status,
        amount: paymentInquiry.order.amount
      });

      // Process payment based on result
      if (paymentInquiry.result === 'SUCCESS') {
        // Payment successful - update your database, send notifications, etc.
        await processSuccessfulPayment(webhookData, paymentInquiry);
      } else {
        // Payment failed - handle accordingly
        await processFailedPayment(webhookData, paymentInquiry);
      }

      const response: WebhookResponse = {
        success: true,
        message: 'Webhook processed successfully',
        orderId: webhookData.orderId,
        processed: true
      };

      res.status(200).json(response);

    } catch (inquiryError: any) {
      functions.logger.error('Payment inquiry failed in webhook', inquiryError, {
        orderId: webhookData.orderId
      });

      // Still return success to avoid repeated webhook calls
      res.status(200).json({
        success: true,
        message: 'Webhook received, inquiry failed',
        orderId: webhookData.orderId,
        processed: false
      });
    }

  } catch (error: any) {
    functions.logger.error('Webhook processing failed', error);
    
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      details: error.message
    });
  }
});

/**
 * Payment Confirmation - GET /api/payments/confirm
 * Handles user return after payment
 */
export const confirmPayment = functions.https.onRequest(async (req: Request, res: Response) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const orderId = req.query.orderId as string;
    const sessionId = req.query.sessionId as string;
    const result = req.query.result as string;

    if (!orderId) {
      res.status(400).send(`
        <html>
          <head><title>Payment Error</title></head>
          <body>
            <h1>Payment Error</h1>
            <p>Order ID is missing</p>
            <a href="/">Return to Home</a>
          </body>
        </html>
      `);
      return;
    }

    functions.logger.info('Payment confirmation requested', {
      orderId,
      sessionId,
      result
    });

    // Inquire payment status from Bank Muscat
    const paymentInquiry = await bankMuscatService.inquirePayment(orderId);
    
    const paymentConfirmation: PaymentConfirmation = {
      orderId: orderId,
      result: paymentInquiry.result,
      transactionId: paymentInquiry.transaction?.[0]?.id,
      amount: paymentInquiry.order.amount,
      currency: paymentInquiry.order.currency,
      authorizationCode: paymentInquiry.transaction?.[0]?.authorizationCode,
      receipt: paymentInquiry.transaction?.[0]?.receipt,
      timestamp: paymentInquiry.timeOfRecord,
      customerMessage: getCustomerMessage(paymentInquiry.result, paymentInquiry.order.status)
    };

    // Return HTML response or JSON based on Accept header
    const acceptHeader = req.headers.accept || '';
    
    if (acceptHeader.includes('application/json')) {
      res.status(200).json({
        success: paymentInquiry.result === 'SUCCESS',
        data: paymentConfirmation
      });
    } else {
      // Return HTML page
      const htmlResponse = generatePaymentConfirmationHTML(paymentConfirmation);
      res.status(200).send(htmlResponse);
    }

  } catch (error: any) {
    functions.logger.error('Payment confirmation failed', error);

    const errorHtml = `
      <html>
        <head><title>Payment Error</title></head>
        <body>
          <h1>Payment Verification Error</h1>
          <p>Unable to verify payment status. Please contact support.</p>
          <p>Error: ${error.message}</p>
          <a href="/">Return to Home</a>
        </body>
      </html>
    `;

    res.status(500).send(errorHtml);
  }
});

// Helper Functions

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Process successful payment
 */
async function processSuccessfulPayment(webhookData: WebhookPayload, paymentInquiry: any): Promise<void> {
  functions.logger.info('Processing successful payment', {
    orderId: webhookData.orderId,
    amount: paymentInquiry.order.amount,
    transactionId: paymentInquiry.transaction?.[0]?.id
  });

  // TODO: Implement your business logic here:
  // - Update order status in your database
  // - Send confirmation email to customer
  // - Update inventory
  // - Trigger order fulfillment
  // - Send push notifications
}

/**
 * Process failed payment
 */
async function processFailedPayment(webhookData: WebhookPayload, paymentInquiry: any): Promise<void> {
  functions.logger.info('Processing failed payment', {
    orderId: webhookData.orderId,
    result: paymentInquiry.result,
    status: paymentInquiry.order.status
  });

  // TODO: Implement your business logic here:
  // - Update order status to failed
  // - Send failure notification to customer
  // - Release reserved inventory
  // - Log for analytics
}

/**
 * Get customer-friendly message based on payment result
 */
function getCustomerMessage(result: string, status: string): string {
  if (result === 'SUCCESS') {
    return 'Your payment has been processed successfully. Thank you for your purchase!';
  } else if (result === 'FAILURE') {
    return 'Your payment could not be processed. Please try again or contact support.';
  } else if (result === 'PENDING') {
    return 'Your payment is being processed. You will receive a confirmation shortly.';
  } else {
    return 'Payment status is unclear. Please contact support for assistance.';
  }
}

/**
 * Generate HTML confirmation page
 */
function generatePaymentConfirmationHTML(confirmation: PaymentConfirmation): string {
  const isSuccess = confirmation.result === 'SUCCESS';
  const statusColor = isSuccess ? '#4CAF50' : '#f44336';
  const statusIcon = isSuccess ? '✅' : '❌';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment ${isSuccess ? 'Successful' : 'Failed'} - SpiritHub Cafe</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                text-align: center;
            }
            .status-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }
            .status-title {
                color: ${statusColor};
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .message {
                font-size: 16px;
                color: #666;
                margin-bottom: 30px;
                line-height: 1.5;
            }
            .details {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
            }
            .detail-label {
                font-weight: 600;
                color: #333;
            }
            .detail-value {
                color: #666;
            }
            .button {
                display: inline-block;
                background: #007bff;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 500;
                margin-top: 20px;
                transition: background-color 0.2s;
            }
            .button:hover {
                background: #0056b3;
            }
            .logo {
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <h2 style="color: #8B4513; margin: 0;">☕ SpiritHub Cafe</h2>
            </div>
            
            <div class="status-icon">${statusIcon}</div>
            <h1 class="status-title">Payment ${isSuccess ? 'Successful' : 'Failed'}</h1>
            <p class="message">${confirmation.customerMessage}</p>

            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    <span class="detail-value">${confirmation.orderId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">${confirmation.amount} ${confirmation.currency}</span>
                </div>
                ${confirmation.transactionId ? `
                <div class="detail-row">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${confirmation.transactionId}</span>
                </div>
                ` : ''}
                ${confirmation.authorizationCode ? `
                <div class="detail-row">
                    <span class="detail-label">Authorization Code:</span>
                    <span class="detail-value">${confirmation.authorizationCode}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Date & Time:</span>
                    <span class="detail-value">${new Date(confirmation.timestamp).toLocaleString()}</span>
                </div>
            </div>

            <a href="/" class="button">Return to SpiritHub Cafe</a>
            
            ${isSuccess ? `
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
                A confirmation email will be sent to you shortly. Please save this page for your records.
            </p>
            ` : `
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
                If you continue to experience issues, please contact our support team.
            </p>
            `}
        </div>
    </body>
    </html>
  `;
}