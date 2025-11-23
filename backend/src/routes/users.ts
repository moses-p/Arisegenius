import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';
import { calculatePagination } from '../utils/helpers';

const router = Router();
type UserWhereInput = NonNullable<Parameters<typeof prisma.user.findMany>[0]>['where'];

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = '1',
      limit = '20',
      role,
      status,
      search,
      sort = 'recent',
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const where: UserWhereInput = {};

    if (role && typeof role === 'string') {
      where.role = role as any;
    }

    if (status && typeof status === 'string') {
      if (status.toLowerCase() === 'active') where.isActive = true;
      if (status.toLowerCase() === 'inactive') where.isActive = false;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = (() => {
      switch (sort) {
        case 'name':
          return [{ firstName: 'asc' as const }, { lastName: 'asc' as const }];
        case 'role':
          return [{ role: 'asc' as const }];
        default:
          return [{ createdAt: 'desc' as const }];
      }
    })();

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy,
        include: {
          dealerProfile: true,
          addresses: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      message: 'Users retrieved successfully',
      data: users,
      meta: calculatePagination(pageNumber, limitNumber, total),
    });
  })
);

router.get(
  '/stats/summary',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const [
      totalUsers,
      activeUsers,
      dealerCount,
      adminCount,
      latestUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'DEALER' } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          isActive: true,
        },
      }),
    ]);

    res.json({
      message: 'User summary retrieved successfully',
      data: {
        totals: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          dealerCount,
          adminCount,
        },
        latestUsers,
      },
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestingUser = req.user;

    if (!requestingUser?.isAdmin && requestingUser?.user.id !== id) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own profile',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        dealerProfile: true,
        addresses: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: `No user found with ID ${id}`,
      });
      return;
    }

    res.json({
      message: 'User retrieved successfully',
      data: user,
    });
  })
);

router.put(
  '/me',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.user.id;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { firstName, lastName, phone } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      data: updated,
    });
  })
);

router.patch(
  '/:id/status',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        error: 'Validation error',
        message: 'isActive boolean value is required',
      });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  })
);

router.patch(
  '/:id/role',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Role is required',
      });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'User role updated successfully',
      data: updated,
    });
  })
);

export default router;

