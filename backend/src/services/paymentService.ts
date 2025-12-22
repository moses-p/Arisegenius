import Stripe from 'stripe';
import axios from 'axios';
import crypto from 'crypto';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';
import { io } from '../server';
import { prisma } from '../lib/prisma';

// Initialize Stripe (only if configured)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

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

// Pesapal configuration (for MTN and Airtel Mobile Money)
const PESAPAL_CONFIG = {
  consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
  environment: process.env.PESAPAL_ENVIRONMENT || 'sandbox',
  baseUrl: process.env.PESAPAL_ENVIRONMENT === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3',
  callbackUrl: process.env.PESAPAL_CALLBACK_URL || `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/payments/pesapal/callback`,
  ipnUrl: process.env.PESAPAL_IPN_URL || `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/payments/pesapal/ipn`,
  // Default phone numbers
  mtnDefaultPhone: process.env.MTN_DEFAULT_PHONE || '256775538145', // +256775538145
  airtelDefaultPhone: process.env.AIRTEL_DEFAULT_PHONE || '256743232445', // +256743232445
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
          paymentResult = await this.processPesapalPayment(order, paymentDetails, 'AIRTEL');
          break;
        case 'MTN_MOBILE_MONEY':
          paymentResult = await this.processPesapalPayment(order, paymentDetails, 'MTN');
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
    if (!stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file');
    }
    try {
      const { token, customerId } = paymentDetails;

      // Create or retrieve customer
      let customer;
      if (customerId) {
        customer = await stripe!.customers.retrieve(customerId);
      } else {
        customer = await stripe!.customers.create({
          email: order.user.email,
          name: `${order.user.firstName} ${order.user.lastName}`,
          metadata: {
            userId: order.user.id,
            orderId: order.id,
          },
        });
      }

      // Create payment intent
      const paymentIntent = await stripe!.paymentIntents.create({
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
          redirectUrl: paymentIntent.next_action?.redirect_to_url?.url || undefined,
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
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      throw new Error('M-Pesa is not configured. Please add MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET to your .env file');
    }
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
   * Process Pesapal payment (for MTN and Airtel Mobile Money)
   */
  private static async processPesapalPayment(order: any, paymentDetails: any, provider: 'MTN' | 'AIRTEL'): Promise<PaymentProcessorResult> {
    if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
      throw new Error('Pesapal is not configured. Please add PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET to your .env file');
    }
    
    try {
      // Use provided phone number or default
      let phoneNumber = paymentDetails.phoneNumber;
      if (!phoneNumber) {
        phoneNumber = provider === 'MTN' ? PESAPAL_CONFIG.mtnDefaultPhone : PESAPAL_CONFIG.airtelDefaultPhone;
      }
      
      // Format phone number (remove + and ensure it starts with country code)
      phoneNumber = phoneNumber.replace(/^\+/, '').replace(/\s/g, '');
      if (!phoneNumber.startsWith('256')) {
        phoneNumber = '256' + phoneNumber.replace(/^0/, '');
      }

      // Get Pesapal access token
      const accessToken = await this.getPesapalAccessToken();

      // Determine payment method code for Pesapal
      const paymentMethod = provider === 'MTN' ? 'MTNMOBILEMONEYUG' : 'AIRTELMONEYUG';

      // Create payment request
      const paymentData = {
        id: order.orderNumber,
        currency: order.currency || 'UGX',
        amount: Number(order.totalAmount).toFixed(2),
        description: `Payment for Arisegenius order ${order.orderNumber}`,
        callback_url: PESAPAL_CONFIG.callbackUrl,
        notification_id: PESAPAL_CONFIG.ipnUrl,
        billing_address: {
          email_address: order.user.email,
          phone_number: phoneNumber,
          country_code: 'UG',
          first_name: order.user.firstName || 'Customer',
          middle_name: '',
          last_name: order.user.lastName || '',
          line_1: paymentDetails.address || '',
          line_2: '',
          city: paymentDetails.city || '',
          state: paymentDetails.state || '',
          postal_code: paymentDetails.postalCode || '',
          zip_code: paymentDetails.postalCode || '',
        },
      };

      const response = await axios.post(
        `${PESAPAL_CONFIG.baseUrl}/api/Transactions/SubmitOrderRequest`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (response.data && response.data.order_tracking_id) {
        // Get payment link
        const paymentLink = `${PESAPAL_CONFIG.baseUrl}/api/Transactions/GetPaymentLink?orderTrackingId=${response.data.order_tracking_id}`;
        
        return {
          status: PaymentStatus.PROCESSING,
          transactionId: response.data.order_tracking_id,
          response: response.data,
          redirectUrl: paymentLink,
          message: `${provider} Mobile Money payment initiated via Pesapal. Please complete the payment.`,
        };
      } else {
        return {
          status: PaymentStatus.FAILED,
          transactionId: null,
          response: response.data,
          message: `${provider} Mobile Money payment initiation failed`,
        };
      }
    } catch (error: any) {
      console.error(`Pesapal ${provider} payment error:`, error);
      return {
        status: PaymentStatus.FAILED,
        transactionId: null,
        response: error.response?.data || error.message,
        message: `${provider} Mobile Money payment failed: ${error.message}`,
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
   * Get Pesapal access token
   */
  private static async getPesapalAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${PESAPAL_CONFIG.consumerKey}:${PESAPAL_CONFIG.consumerSecret}`
      ).toString('base64');

      const response = await axios.post(
        `${PESAPAL_CONFIG.baseUrl}/api/Auth/RequestToken`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      return response.data.token;
    } catch (error) {
      console.error('Pesapal token error:', error);
      throw new Error('Failed to get Pesapal access token');
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
        case 'pesapal':
          return await this.handlePesapalWebhook(payload);
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
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }
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
   * Handle Pesapal webhook/IPN
   */
  private static async handlePesapalWebhook(payload: any) {
    try {
      const { OrderTrackingId, OrderMerchantReference, OrderNotificationType, OrderNotificationTypeId } = payload;

      // Get payment by order tracking ID
      const payment = await prisma.payment.findFirst({
        where: { providerTransactionId: OrderTrackingId },
        include: { order: true },
      });

      if (!payment) {
        console.log(`Pesapal webhook: Payment not found for tracking ID ${OrderTrackingId}`);
        return { received: true };
      }

      // Map Pesapal status to our PaymentStatus
      // OrderNotificationTypeId: 1 = Payment, 2 = IPN
      // Status codes: COMPLETED, FAILED, PENDING
      let status: PaymentStatus = PaymentStatus.PROCESSING;

      if (OrderNotificationType === 'COMPLETED' || OrderNotificationTypeId === 1) {
        status = PaymentStatus.COMPLETED;
      } else if (OrderNotificationType === 'FAILED' || OrderNotificationTypeId === 2) {
        status = PaymentStatus.FAILED;
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          processedAt: status === PaymentStatus.COMPLETED ? new Date() : null,
          providerResponse: payload,
        },
      });

      // Update order status
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

      return { received: true };
    } catch (error) {
      console.error('Pesapal webhook error:', error);
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
      case 'MTN_MOBILE_MONEY':
        return PaymentProvider.PESAPAL as PaymentProvider;
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
    const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
    const mpesaConfigured = !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);
    const pesapalConfigured = !!(process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET);

    console.log('✅ Payment services initialized');
    console.log('  - Stripe:', stripeConfigured ? '✅ Configured' : '⚠️  Not configured (development mode)');
    console.log('  - M-Pesa:', mpesaConfigured ? '✅ Configured' : '⚠️  Not configured (development mode)');
    console.log('  - Pesapal (MTN & Airtel):', pesapalConfigured ? '✅ Configured' : '⚠️  Not configured (development mode)');
    
    if (pesapalConfigured) {
      console.log('    📱 MTN Mobile Money: Available via Pesapal');
      console.log('    📱 Airtel Money: Available via Pesapal');
    }
    
    if (!stripeConfigured && !mpesaConfigured && !pesapalConfigured) {
      console.log('');
      console.log('ℹ️  Payment gateways are not configured. This is normal for development.');
      console.log('   Payment processing will be disabled until credentials are added to .env');
      console.log('   See backend/env.example for required configuration variables.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize payment services:', error);
    throw error;
  }
}
