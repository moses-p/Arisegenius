import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.post(
  '/process',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { orderId, method, paymentDetails = {}, currency, amount } = req.body;

    if (!orderId || !method) {
      res.status(400).json({
        error: 'Validation error',
        message: 'orderId and method are required',
      });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        totalAmount: true,
        currency: true,
      },
    });

    if (!order) {
      res.status(404).json({
        error: 'Order not found',
        message: `No order found with ID ${orderId}`,
      });
      return;
    }

    if (!req.user?.isAdmin && order.userId !== req.user?.user.id) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You are not allowed to pay for this order',
      });
      return;
    }

    const paymentResult = await PaymentService.processPayment(
      orderId,
      method,
      amount || Number(order.totalAmount),
      currency || order.currency,
      paymentDetails
    );

    res.json({
      message: 'Payment processed successfully',
      data: paymentResult,
    });
  })
);

router.get(
  '/:paymentId/status',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        orderId: true,
        order: {
          select: { userId: true },
        },
      },
    });

    if (!payment) {
      res.status(404).json({
        error: 'Payment not found',
        message: `No payment found with ID ${paymentId}`,
      });
      return;
    }

    if (
      !req.user?.isAdmin &&
      payment.order.userId !== req.user?.user.id &&
      !req.user?.isDealer
    ) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You are not allowed to view this payment',
      });
      return;
    }

    const status = await PaymentService.verifyPaymentStatus(paymentId);

    res.json({
      message: 'Payment status retrieved successfully',
      data: status,
    });
  })
);

router.post(
  '/webhook/:provider',
  asyncHandler(async (req: Request, res: Response) => {
    const { provider } = req.params;
    const signature = (req.headers['stripe-signature'] as string) || '';

    await PaymentService.handleWebhook(provider.toLowerCase(), req.body, signature);

    res.json({ received: true });
  })
);

// Pesapal callback (redirect after payment)
router.get(
  '/pesapal/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { OrderTrackingId, OrderMerchantReference } = req.query;
    
    if (OrderTrackingId) {
      // Redirect to frontend with payment status
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/payment/callback?trackingId=${OrderTrackingId}&reference=${OrderMerchantReference}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?error=invalid`);
    }
  })
);

// Pesapal IPN (Instant Payment Notification)
router.post(
  '/pesapal/ipn',
  asyncHandler(async (req: Request, res: Response) => {
    await PaymentService.handleWebhook('pesapal', req.body, '');
    res.json({ received: true });
  })
);

export default router;

