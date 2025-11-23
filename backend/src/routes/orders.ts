import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { generateOrderNumber } from '../utils/helpers';
import { emailService } from '../services/emailService';

const router = Router();

const ensureOrderAccess = (req: any, order: any) => {
  if (req.user?.isAdmin) {
    return true;
  }

  if (req.user?.isDealer && order.dealerId && req.user.user.dealerProfile) {
    return order.dealerId === req.user.user.dealerProfile.id;
  }

  return order.userId === req.user?.user.id;
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      status,
      paymentStatus,
      dealerId,
      page = '1',
      limit = '20',
      startDate,
      endDate,
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (paymentStatus && typeof paymentStatus === 'string') {
      where.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (req.user?.isAdmin) {
      if (dealerId && typeof dealerId === 'string') {
        where.dealerId = dealerId;
      }
    } else if (req.user?.isDealer && req.user.user.dealerProfile) {
      where.dealerId = req.user.user.dealerProfile.id;
    } else if (req.user?.user.id) {
      where.userId = req.user.user.id;
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          dealer: {
            select: {
              id: true,
              companyName: true,
              dealerId: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      message: 'Orders retrieved successfully',
      data: orders,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        dealer: true,
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        shipments: true,
      },
    });

    if (!order) {
      res.status(404).json({
        error: 'Order not found',
        message: `No order found with ID ${id}`,
      });
      return;
    }

    if (!ensureOrderAccess(req, order)) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You are not allowed to view this order',
      });
      return;
    }

    res.json({
      message: 'Order retrieved successfully',
      data: order,
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?.user.id;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const {
      items,
      dealerId,
      notes,
      currency = 'USD',
      shippingAmount = 0,
      taxAmount = 0,
      discountAmount = 0,
      shippingAddressId,
      billingAddressId,
      shippingAddress,
      billingAddress,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        error: 'Validation error',
        message: 'At least one order item is required',
      });
      return;
    }

    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Some products are unavailable or inactive',
      });
      return;
    }

    let shippingAddressRecordId = shippingAddressId;
    let billingAddressRecordId = billingAddressId;

    if (!shippingAddressRecordId && shippingAddress) {
      const created = await prisma.address.create({
        data: {
          ...shippingAddress,
          userId,
          type: 'SHIPPING',
        },
      });
      shippingAddressRecordId = created.id;
    }

    if (!billingAddressRecordId && billingAddress) {
      const created = await prisma.address.create({
        data: {
          ...billingAddress,
          userId,
          type: 'BILLING',
        },
      });
      billingAddressRecordId = created.id;
    }

    const orderNumber = await generateOrderNumber();

    const orderItemsData = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId)!;
      const quantity = Number(item.quantity) || 1;
      const unitPrice = Number(product.price);
      const totalPrice = unitPrice * quantity;

      return {
        productId: product.id,
        quantity,
        unitPrice,
        totalPrice,
      };
    });

    const subtotal = orderItemsData.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = subtotal + Number(shippingAmount) + Number(taxAmount) - Number(discountAmount);

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        dealerId: dealerId || req.user?.user.dealerProfile?.id || null,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        currency,
        notes,
        shippingAddressId: shippingAddressRecordId,
        billingAddressId: billingAddressRecordId,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    try {
      await emailService.sendOrderConfirmationEmail(createdOrder.id);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
    }

    res.status(201).json({
      message: 'Order created successfully',
      data: createdOrder,
    });
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    if (!req.user?.isAdmin && !req.user?.isDealer) {
      res.status(403).json({
        error: 'Access denied',
        message: 'Only admins or dealers can update orders',
      });
      return;
    }

    const { id } = req.params;
    const {
      status,
      paymentStatus,
      shippingStatus,
      trackingNumber,
      dealerId,
      notes,
    } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        dealerId: true,
        userId: true,
      },
    });

    if (!order) {
      res.status(404).json({
        error: 'Order not found',
        message: `No order found with ID ${id}`,
      });
      return;
    }

    if (!ensureOrderAccess(req, order)) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You are not allowed to update this order',
      });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(shippingStatus && { shippingStatus }),
        ...(trackingNumber && { trackingNumber }),
        ...(dealerId && { dealerId }),
        ...(notes && { notes }),
      },
    });

    res.json({
      message: 'Order updated successfully',
      data: updated,
    });
  })
);

export default router;

