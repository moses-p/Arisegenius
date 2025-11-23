import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, AuthContext, DealerProfileResponse } from '../types/auth';
import { prisma } from '../lib/prisma';
import type { DealerProfile } from '@prisma/client';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'Access denied',
        message: 'No token provided',
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        dealerProfile: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        error: 'Access denied',
        message: 'Invalid or inactive user',
      });
      return;
    }

    // Create auth context
    const authContext: AuthContext = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        dealerProfile: mapDealerProfile(user.dealerProfile),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      isAuthenticated: true,
      isDealer: user.role === 'DEALER' && user.dealerProfile?.status === 'APPROVED',
      isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
      permissions: getUserPermissions(user.role, user.dealerProfile?.status),
    };

    req.user = authContext;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token',
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Access denied',
        message: 'Token expired',
      });
    } else {
      console.error('Authentication error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Authentication failed',
      });
    }
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.isAuthenticated) {
    res.status(401).json({
      error: 'Access denied',
      message: 'Authentication required',
    });
    return;
  }
  next();
};

export const requireDealer = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.isDealer) {
    res.status(403).json({
      error: 'Access denied',
      message: 'Dealer access required',
    });
    return;
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.isAdmin) {
    res.status(403).json({
      error: 'Access denied',
      message: 'Admin access required',
    });
    return;
  }
  next();
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.permissions.includes(permission)) {
      res.status(403).json({
        error: 'Access denied',
        message: `Permission '${permission}' required`,
      });
      return;
    }
    next();
  };
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = {
        user: {} as any,
        isAuthenticated: false,
        isDealer: false,
        isAdmin: false,
        permissions: [],
      };
      next();
      return;
    }

    // Try to authenticate, but don't fail if token is invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        dealerProfile: true,
      },
    });

    if (user && user.isActive) {
      req.user = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin,
          dealerProfile: mapDealerProfile(user.dealerProfile),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        isAuthenticated: true,
        isDealer: user.role === 'DEALER' && user.dealerProfile?.status === 'APPROVED',
        isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
        permissions: getUserPermissions(user.role, user.dealerProfile?.status),
      };
    } else {
      req.user = {
        user: {} as any,
        isAuthenticated: false,
        isDealer: false,
        isAdmin: false,
        permissions: [],
      };
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without authentication
    req.user = {
      user: {} as any,
      isAuthenticated: false,
      isDealer: false,
      isAdmin: false,
      permissions: [],
    };
    next();
  }
};

function mapDealerProfile(profile?: DealerProfile | null): DealerProfileResponse | undefined {
  if (!profile) {
    return undefined;
  }

  return {
    id: profile.id,
    dealerId: profile.dealerId,
    companyName: profile.companyName,
    contactPerson: profile.contactPerson,
    location: profile.location,
    country: profile.country,
    city: profile.city,
    phone: profile.phone,
    status: profile.status,
    commissionRate: profile.commissionRate,
    creditLimit: Number(profile.creditLimit ?? 0),
    currentBalance: Number(profile.currentBalance ?? 0),
  };
}

// Helper function to get user permissions based on role and status
function getUserPermissions(role: string, dealerStatus?: string): string[] {
  const permissions: string[] = [];

  switch (role) {
    case 'SUPER_ADMIN':
      permissions.push(
        'users:read', 'users:write', 'users:delete',
        'products:read', 'products:write', 'products:delete',
        'orders:read', 'orders:write', 'orders:delete',
        'dealers:read', 'dealers:write', 'dealers:delete',
        'payments:read', 'payments:write', 'payments:delete',
        'analytics:read', 'analytics:write',
        'settings:read', 'settings:write',
        'cms:read', 'cms:write', 'cms:delete'
      );
      break;

    case 'ADMIN':
      permissions.push(
        'users:read', 'users:write',
        'products:read', 'products:write',
        'orders:read', 'orders:write',
        'dealers:read', 'dealers:write',
        'payments:read', 'payments:write',
        'analytics:read',
        'cms:read', 'cms:write'
      );
      break;

    case 'DEALER':
      if (dealerStatus === 'APPROVED') {
        permissions.push(
          'products:read',
          'orders:read', 'orders:write',
          'payments:read',
          'analytics:read'
        );
      }
      break;

    case 'CUSTOMER':
      permissions.push(
        'products:read',
        'orders:read', 'orders:write',
        'payments:read'
      );
      break;
  }

  return permissions;
}

// Middleware to check if user owns the resource
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.isAuthenticated) {
      res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required',
      });
      return;
    }

    // Admin users can access any resource
    if (req.user.isAdmin) {
      next();
      return;
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId !== req.user.user.id) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources',
      });
      return;
    }

    next();
  };
};
