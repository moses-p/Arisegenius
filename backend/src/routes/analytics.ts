import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

const requireInsightsAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin && !req.user?.isDealer) {
    res.status(403).json({
      error: 'Access denied',
      message: 'Analytics access restricted to admins and dealers',
    });
    return;
  }
  next();
};

router.get(
  '/summary',
  requireInsightsAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const [orderCounts, paymentAggregates, userCounts, topProductSales] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          totalPrice: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const productIds = topProductSales.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        images: true,
      },
    });

    const topProducts = topProductSales.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name,
        sku: product?.sku,
        image: product?.images?.[0],
        quantitySold: item._sum.quantity || 0,
        revenue: Number(item._sum.totalPrice || 0),
      };
    });

    res.json({
      message: 'Analytics summary retrieved successfully',
      data: {
        ordersByStatus: orderCounts.map((count) => ({
          status: count.status,
          total: count._count._all,
        })),
        totalRevenue: Number(paymentAggregates._sum.amount || 0),
        usersByRole: userCounts.map((count) => ({
          role: count.role,
          total: count._count._all,
        })),
        topProducts,
      },
    });
  })
);

router.get(
  '/sales/trends',
  requireInsightsAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const rangeDays = Math.min(parseInt((req.query.days as string) || '30', 10), 90);
    const since = new Date();
    since.setDate(since.getDate() - rangeDays);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const trend: Record<string, { total: number; count: number }> = {};

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().slice(0, 10);
      if (!trend[dateKey]) {
        trend[dateKey] = { total: 0, count: 0 };
      }
      trend[dateKey].total += Number(order.totalAmount);
      trend[dateKey].count += 1;
    });

    const series = Object.entries(trend)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, value]) => ({
        date,
        revenue: value.total,
        orders: value.count,
      }));

    res.json({
      message: 'Sales trends retrieved successfully',
      data: {
        rangeDays,
        series,
      },
    });
  })
);

router.get(
  '/customers/segments',
  requireInsightsAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const customerSegments = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    const topCountries = await prisma.address.groupBy({
      by: ['country'],
      _count: { _all: true },
    });

    // Sort by count and take top 5
    const sortedCountries = topCountries
      .sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0))
      .slice(0, 5);

    res.json({
      message: 'Customer segments retrieved successfully',
      data: {
        roles: customerSegments.map((segment) => ({
          role: segment.role,
          total: segment._count?._all || 0,
        })),
        topCountries: sortedCountries.map((country) => ({
          country: country.country || 'Unknown',
          total: country._count?._all || 0,
        })),
      },
    });
  })
);

router.get(
  '/dealers/performance',
  requireInsightsAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const dealers = await prisma.dealerProfile.findMany({
      include: {
        orders: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    const performance = dealers
      .map((dealer) => ({
        dealerId: dealer.dealerId,
        companyName: dealer.companyName,
        orderCount: dealer.orders.length,
        revenue: dealer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
        status: dealer.status,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      message: 'Dealer performance retrieved successfully',
      data: performance,
    });
  })
);

export default router;

