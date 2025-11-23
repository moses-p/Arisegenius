import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAdmin, requireDealer } from '../middleware/auth';
import { emailService } from '../services/emailService';

const router = Router();

const ensureDealerAccess = (req: any, dealerId: string) => {
  if (req.user?.isAdmin) {
    return true;
  }

  if (req.user?.isDealer && req.user.user.dealerProfile) {
    return req.user.user.dealerProfile.id === dealerId;
  }

  return false;
};

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const dealers = await prisma.dealerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        inventory: {
          take: 5,
          orderBy: { updatedAt: 'desc' },
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
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json({
      message: 'Dealers retrieved successfully',
      data: dealers,
    });
  })
);

router.get(
  '/me',
  requireDealer,
  asyncHandler(async (req, res) => {
    const dealerId = req.user?.user.dealerProfile?.id;

    if (!dealerId) {
      res.status(403).json({
        error: 'Access denied',
        message: 'Dealer profile not found',
      });
      return;
    }

    const dealer = await prisma.dealerProfile.findUnique({
      where: { id: dealerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        inventory: {
          include: {
            product: true,
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });

    res.json({
      message: 'Dealer profile retrieved successfully',
      data: dealer,
    });
  })
);

router.get(
  '/:dealerId',
  asyncHandler(async (req, res) => {
    const { dealerId } = req.params;

    if (!ensureDealerAccess(req, dealerId)) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You are not allowed to view this dealer',
      });
      return;
    }

    const dealer = await prisma.dealerProfile.findUnique({
      where: { id: dealerId },
      include: {
        user: true,
        inventory: {
          include: {
            product: true,
          },
        },
        orders: true,
      },
    });

    if (!dealer) {
      res.status(404).json({
        error: 'Dealer not found',
        message: `No dealer found with ID ${dealerId}`,
      });
      return;
    }

    res.json({
      message: 'Dealer retrieved successfully',
      data: dealer,
    });
  })
);

router.patch(
  '/:dealerId/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { dealerId } = req.params;
    const { status, commissionRate, creditLimit } = req.body;

    const dealer = await prisma.dealerProfile.update({
      where: { id: dealerId },
      data: {
        ...(status && {
          status,
          approvedAt: status === 'APPROVED' ? new Date() : undefined,
          approvedBy: status === 'APPROVED' ? req.user?.user.id : undefined,
        }),
        ...(commissionRate !== undefined && { commissionRate }),
        ...(creditLimit !== undefined && { creditLimit }),
      },
      include: {
        user: true,
      },
    });

    if (status === 'APPROVED') {
      try {
        await emailService.sendDealerApprovalEmail(dealer.id);
      } catch (error) {
        console.error('Failed to send dealer approval email:', error);
      }
    }

    res.json({
      message: 'Dealer status updated successfully',
      data: dealer,
    });
  })
);

router.get(
  '/:dealerId/inventory',
  asyncHandler(async (req, res) => {
    const { dealerId } = req.params;

    if (!ensureDealerAccess(req, dealerId)) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You are not allowed to view this inventory',
      });
      return;
    }

    const inventory = await prisma.dealerInventory.findMany({
      where: { dealerId },
      include: {
        product: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      message: 'Dealer inventory retrieved successfully',
      data: inventory,
    });
  })
);

router.post(
  '/inventory',
  requireDealer,
  asyncHandler(async (req, res) => {
    const dealerId = req.user?.user.dealerProfile?.id;
    const { items } = req.body;

    if (!dealerId) {
      res.status(403).json({
        error: 'Access denied',
        message: 'Dealer profile not found',
      });
      return;
    }

    if (!Array.isArray(items) || !items.length) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Inventory items array is required',
      });
      return;
    }

    await prisma.$transaction(
      items.map((item: any) =>
        prisma.dealerInventory.upsert({
          where: {
            dealerId_productId: {
              dealerId,
              productId: item.productId,
            },
          },
          update: {
            stock: item.stock,
            reservedStock: item.reservedStock ?? 0,
            reorderLevel: item.reorderLevel ?? 0,
            lastRestocked: item.lastRestocked || new Date(),
          },
          create: {
            dealerId,
            productId: item.productId,
            stock: item.stock,
            reservedStock: item.reservedStock ?? 0,
            reorderLevel: item.reorderLevel ?? 0,
            lastRestocked: item.lastRestocked || new Date(),
          },
        })
      )
    );

    const inventory = await prisma.dealerInventory.findMany({
      where: { dealerId },
      include: { product: true },
    });

    res.json({
      message: 'Inventory updated successfully',
      data: inventory,
    });
  })
);

export default router;

