import Stripe from 'stripe';
import axios from 'axios';
import crypto from 'crypto';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';
import { io } from '../server';
import { prisma } from '../lib/prisma';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// M-Pesa configuration
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE!,
  passkey: process.env.MPESA_PASSKEY!,
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
  baseUrl: process.env.MPESA_ENVIRONMENT === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke',
};

// Airtel Money configuration
const AIRTEL_CONFIG = {
  clientId: process.env.AIRTEL_CLIENT_ID!,
  clientSecret: process.env.AIRTEL_CLIENT_SECRET!,
  merchantId: process.env.AIRTEL_MERCHANT_ID!,
  environment: process.env.AIRTEL_ENVIRONMENT || 'sandbox',
  baseUrl: process.env.AIRTEL_ENVIRONMENT === 'production'
    ? 'https://openapiuat.airtel.africa'
    : 'https://openapiuat.airtel.africa',
};

// MTN Mobile Money configuration
const MTN_CONFIG = {
  subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY!,
  environment: process.env.MTN_ENVIRONMENT || 'sandbox',
  baseUrl: process.env.MTN_ENVIRONMENT === 'production'
    ? 'https://api.mtn.com'
    : 'https://sandbox.mtn.com',
};

type PaymentProcessorResult = {
  status: PaymentStatus;
  transactionId: string | null;
  response: any;
  redirectUrl?: string;
  message: string;
};

export class PaymentService {
  /**
   * Process payment with various methods
   */
  static async processPayment(
    orderId: string,
    method: PaymentMethod | string,
    amount?: number,
    currency: string = 'USD',
    paymentDetails: any = {}
  ) {
    try {
      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.paymentStatus === PaymentStatus.COMPLETED) {
        throw new Error('Order already paid');
      }

      const normalizedMethod = method as PaymentMethod;
      const chargeAmount = amount ?? Number(order.totalAmount);
      const chargeCurrency = currency || order.currency;
      let paymentResult: PaymentProcessorResult;

      switch (normalizedMethod) {
        case 'CREDIT_CARD':
        case 'DEBIT_CARD':
          paymentResult = await this.processStripePayment(order, paymentDetails);
          break;
        case 'PAYPAL':
          paymentResult = await this.processPayPalPayment(order, paymentDetails);
          break;
        case 'MPESA':
          paymentResult = await this.processMpesaPayment(order, paymentDetails);
          break;
        case 'AIRTEL_MONEY':
          paymentResult = await this.processAirtelMoneyPayment(order, paymentDetails);
          break;
        case 'MTN_MOBILE_MONEY':
          paymentResult = await this.processMTNPayment(order, paymentDetails);
          break;
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: chargeAmount,
          currency: chargeCurrency,
          method: normalizedMethod,
          status: paymentResult.status,
          provider: this.getProviderFromMethod(normalizedMethod),
          providerTransactionId: paymentResult.transactionId,
          providerResponse: paymentResult.response,
          processedAt: paymentResult.status === PaymentStatus.COMPLETED ? new Date() : null,
        },
      });

      // Update order payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: paymentResult.status,
          paymentMethod: normalizedMethod,
          paymentReference: paymentResult.transactionId || undefined,
        },
      });

      // Emit real-time update
      io.to(`order-${orderId}`).emit('payment-status-update', {
        orderId,
        paymentStatus: paymentResult.status,
        paymentId: payment.id,
        timestamp: new Date().toISOString(),
      });

      return {
        paymentId: payment.id,
        status: paymentResult.status,
        transactionId: paymentResult.transactionId,
        redirectUrl: paymentResult.redirectUrl,
        message: paymentResult.message,
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  /**
   * Process Stripe payment
   */
  private static async processStripePayment(order: any, paymentDetails: any): Promise<PaymentProcessorResult> {
    try {
      const { token, customerId } = paymentDetails;

      // Create or retrieve customer
      let customer;
      if (customerId) {
        customer = await stripe.customers.retrieve(customerId);
      } else {
        customer = await stripe.customers.create({
          email: order.user.email,
          name: `${order.user.firstName} ${order.user.lastName}`,
          metadata: {
            userId: order.user.id,
            orderId: order.id,
          },
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(order.totalAmount) * 100), // Convert to cents
        currency: (order.currency || 'USD').toLowerCase(),
        customer: customer.id,
        payment_method: token,
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          orderId: order.id,
          userId: order.user.id,
        },
      });

      if (paymentIntent.status === 'succeeded') {
        return {
          status: PaymentStatus.COMPLETED,
          transactionId: paymentIntent.id,
          response: paymentIntent,
          message: 'Payment completed successfully',
        };
      } else if (paymentIntent.status === 'requires_action') {
        return {
          status: PaymentStatus.PROCESSING,
          transactionId: paymentIntent.id,
          response: paymentIntent,
          redirectUrl: paymentIntent.next_action?.redirect_to_url?.url,
          message: 'Payment requires additional authentication',
        };
      } else {
        return {
          status: PaymentStatus.FAILED,
          transactionId: paymentIntent.id,
          response: paymentIntent,
          message: 'Payment failed',
        };
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        status: PaymentStatus.FAILED,
        transactionId: null,
        response: error,
        message: 'Payment processing failed',
      };
    }
  }

  /**
   * Process PayPal payment
   */
  private static async processPayPalPayment(order: any, paymentDetails: any): Promise<PaymentProcessorResult> {
    try {
      // In a real implementation, you would integrate with PayPal API
      // For now, we'll simulate the process
      const transactionId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate PayPal payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        status: PaymentStatus.COMPLETED,
        transactionId,
        response: { provider: 'paypal', orderId: order.id },
        message: 'PayPal payment completed successfully',
      };
    } catch (error) {
      console.error('PayPal payment error:', error);
      return {
        status: PaymentStatus.FAILED,
        transactionId: null,
        response: error,
        message: 'PayPal payment failed',
      };
    }
  }

  /**
   * Process M-Pesa payment
   */
  private static async processMpesaPayment(order: any, paymentDetails: any): Promise<PaymentProcessorResult> {
    try {
      const { phoneNumber } = paymentDetails;
      
      if (!phoneNumber) {
        throw new Error('Phone number is required for M-Pesa payment');
      }

      // Get M-Pesa access token
      const accessToken = await this.getMpesaAccessToken();

      // Generate timestamp and password
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(
        `${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`
      ).toString('base64');

      // STK Push request
      const stkPushData = {
        BusinessShortCode: MPESA_CONFIG.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(Number(order.totalAmount)),
        PartyA: phoneNumber,
        PartyB: MPESA_CONFIG.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.API_BASE_URL}/api/v1/payments/mpesa/callback`,
        AccountReference: order.orderNumber,
        TransactionDesc: `Payment for order ${order.orderNumber}`,
      };

      const response = await axios.post(
        `${MPESA_CONFIG.baseUrl}/mpesa/stkpush/v1/processrequest`,
        stkPushData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.ResponseCode === '0') {
        return {
          status: PaymentStatus.PROCESSING,
          transactionId: response.data.CheckoutRequestID,
          response: response.data,
          message: 'M-Pesa payment initiated. Please complete on your phone.',
        };
      } else {
        return {
          status: PaymentStatus.FAILED,
          transactionId: null,
          response: response.data,
          message: 'M-Pesa payment initiation failed',
        };
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      return {
        status: PaymentStatus.FAILED,
        transactionId: null,
        response: error,
        message: 'M-Pesa payment failed',
      };
    }
  }

  /**
   * Process Airtel Money payment
   */
  private static async processAirtelMoneyPayment(order: any, paymentDetails: any): Promise<PaymentProcessorResult> {
    try {
      const { phoneNumber } = paymentDetails;
      
      if (!phoneNumber) {
        throw new Error('Phone number is required for Airtel Money payment');
      }

      // Get Airtel access token
      const accessToken = await this.getAirtelAccessToken();

      // Create payment request
      const paymentData = {
        reference: order.orderNumber,
        subscriber: {
          msisdn: phoneNumber,
        },
        transaction: {
          amount: order.totalAmount,
          id: `airtel_${Date.now()}`,
        },
      };

      const response = await axios.post(
        `${AIRTEL_CONFIG.baseUrl}/merchant/v1/payments/`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Country': 'UG', // Uganda
            'X-Currency': 'UGX',
          },
        }
      );

      if (response.data.status?.success) {
        return {
          status: PaymentStatus.PROCESSING,
          transactionId: response.data.data.transaction.id,
          response: response.data,
          message: 'Airtel Money payment initiated. Please complete on your phone.',
        };
      } else {
        return {
          status: PaymentStatus.FAILED,
          transactionId: null,
          response: response.data,
          message: 'Airtel Money payment initiation failed',
        };
      }
    } catch (error) {
      console.error('Airtel Money payment error:', error);
      return {
        status: PaymentStatus.FAILED,
        transactionId: null,
        response: error,
        message: 'Airtel Money payment failed',
      };
    }
  }

  /**
   * Process MTN Mobile Money payment
   */
  private static async processMTNPayment(order: any, paymentDetails: any): Promise<PaymentProcessorResult> {
    try {
      const { phoneNumber } = paymentDetails;
      
      if (!phoneNumber) {
        throw new Error('Phone number is required for MTN Mobile Money payment');
      }

      // Create payment request
      const paymentData = {
        amount: Number(order.totalAmount).toString(),
        currency: order.currency,
        externalId: order.orderNumber,
        payer: {
          partyIdType: 'MSISDN',
          partyId: phoneNumber,
        },
        payerMessage: `Payment for order ${order.orderNumber}`,
        payeeNote: `Arisegenius order ${order.orderNumber}`,
      };

      const response = await axios.post(
        `${MTN_CONFIG.baseUrl}/collection/v1_0/requesttopay`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${MTN_CONFIG.subscriptionKey}`,
            'Content-Type': 'application/json',
            'X-Reference-Id': `mtn_${Date.now()}`,
            'X-Target-Environment': MTN_CONFIG.environment,
          },
        }
      );

      if (response.status === 202) {
        return {
          status: PaymentStatus.PROCESSING,
          transactionId: response.headers['x-reference-id'] as string,
          response: response.data,
          message: 'MTN Mobile Money payment initiated. Please complete on your phone.',
        };
      } else {
        return {
          status: PaymentStatus.FAILED,
          transactionId: null,
          response: response.data,
          message: 'MTN Mobile Money payment initiation failed',
        };
      }
    } catch (error) {
      console.error('MTN Mobile Money payment error:', error);
      return {
        status: PaymentStatus.FAILED,
        transactionId: null,
        response: error,
        message: 'MTN Mobile Money payment failed',
      };
    }
  }

  /**
   * Get M-Pesa access token
   */
  private static async getMpesaAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
      ).toString('base64');

      const response = await axios.get(
        `${MPESA_CONFIG.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('M-Pesa token error:', error);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  /**
   * Get Airtel access token
   */
  private static async getAirtelAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        `${AIRTEL_CONFIG.baseUrl}/auth/oauth2/token`,
        {
          client_id: AIRTEL_CONFIG.clientId,
          client_secret: AIRTEL_CONFIG.clientSecret,
          grant_type: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Airtel token error:', error);
      throw new Error('Failed to get Airtel access token');
    }
  }

  /**
   * Handle payment webhooks
   */
  static async handleWebhook(provider: string, payload: any, signature: string) {
    try {
      switch (provider) {
        case 'stripe':
          return await this.handleStripeWebhook(payload, signature);
        case 'mpesa':
          return await this.handleMpesaWebhook(payload);
        case 'airtel':
          return await this.handleAirtelWebhook(payload);
        case 'mtn':
          return await this.handleMTNWebhook(payload);
        default:
          throw new Error(`Unsupported webhook provider: ${provider}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook
   */
  private static async handleStripeWebhook(payload: any, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.updatePaymentStatus(event.data.object.id, PaymentStatus.COMPLETED);
          break;
        case 'payment_intent.payment_failed':
          await this.updatePaymentStatus(event.data.object.id, PaymentStatus.FAILED);
          break;
      }

      return { received: true };
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle M-Pesa webhook
   */
  private static async handleMpesaWebhook(payload: any) {
    try {
      const { Body } = payload;
      const { stkCallback } = Body;

      if (stkCallback.ResultCode === 0) {
        // Payment successful
        const checkoutRequestId = stkCallback.CheckoutRequestID;
        await this.updatePaymentStatusByProviderId(checkoutRequestId, PaymentStatus.COMPLETED);
      } else {
        // Payment failed
        const checkoutRequestId = stkCallback.CheckoutRequestID;
        await this.updatePaymentStatusByProviderId(checkoutRequestId, PaymentStatus.FAILED);
      }

      return { received: true };
    } catch (error) {
      console.error('M-Pesa webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle Airtel webhook
   */
  private static async handleAirtelWebhook(payload: any) {
    try {
      const { status, data } = payload;

      if (status.success && data.transaction.status === 'TS') {
        // Transaction successful
        await this.updatePaymentStatusByProviderId(data.transaction.id, PaymentStatus.COMPLETED);
      } else {
        // Transaction failed
        await this.updatePaymentStatusByProviderId(data.transaction.id, PaymentStatus.FAILED);
      }

      return { received: true };
    } catch (error) {
      console.error('Airtel webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle MTN webhook
   */
  private static async handleMTNWebhook(payload: any) {
    try {
      const { status, data } = payload;

      if (status === 'SUCCESSFUL') {
        await this.updatePaymentStatusByProviderId(data.externalId, PaymentStatus.COMPLETED);
      } else {
        await this.updatePaymentStatusByProviderId(data.externalId, PaymentStatus.FAILED);
      }

      return { received: true };
    } catch (error) {
      console.error('MTN webhook error:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  private static async updatePaymentStatus(providerTransactionId: string, status: PaymentStatus) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { providerTransactionId },
        include: { order: true },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status,
            processedAt: status === PaymentStatus.COMPLETED ? new Date() : null,
          },
        });

        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: status },
        });

        // Emit real-time update
        io.to(`order-${payment.orderId}`).emit('payment-status-update', {
          orderId: payment.orderId,
          paymentStatus: status,
          paymentId: payment.id,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Update payment status error:', error);
    }
  }

  /**
   * Update payment status by provider transaction ID
   */
  private static async updatePaymentStatusByProviderId(providerTransactionId: string, status: PaymentStatus) {
    await this.updatePaymentStatus(providerTransactionId, status);
  }

  /**
   * Get provider from payment method
   */
  private static getProviderFromMethod(method: PaymentMethod): PaymentProvider {
    switch (method) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return PaymentProvider.STRIPE;
      case 'PAYPAL':
        return PaymentProvider.PAYPAL;
      case 'MPESA':
        return PaymentProvider.MPESA;
      case 'AIRTEL_MONEY':
        return PaymentProvider.AIRTEL;
      case 'MTN_MOBILE_MONEY':
        return PaymentProvider.MTN;
      default:
        return PaymentProvider.BANK;
    }
  }

  /**
   * Verify payment status
   */
  static async verifyPaymentStatus(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // For mobile money payments, you might want to check with the provider
      if (payment.provider === PaymentProvider.MPESA && payment.status === PaymentStatus.PROCESSING) {
        // Check M-Pesa transaction status
        // Implementation would depend on M-Pesa API
      }

      return {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        transactionId: payment.providerTransactionId,
        processedAt: payment.processedAt,
      };
    } catch (error) {
      console.error('Verify payment status error:', error);
      throw error;
    }
  }
}

// Initialize payment services
export async function initializePaymentServices() {
  try {
    console.log('✅ Payment services initialized');
    console.log('  - Stripe:', process.env.STRIPE_SECRET_KEY ? '✅' : '❌');
    console.log('  - M-Pesa:', process.env.MPESA_CONSUMER_KEY ? '✅' : '❌');
    console.log('  - Airtel Money:', process.env.AIRTEL_CLIENT_ID ? '✅' : '❌');
    console.log('  - MTN Mobile Money:', process.env.MTN_SUBSCRIPTION_KEY ? '✅' : '❌');
  } catch (error) {
    console.error('❌ Failed to initialize payment services:', error);
    throw error;
  }
}
