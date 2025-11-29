import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  LoginRequest,
  RegisterRequest,
  DealerRegistrationRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
  EmailVerificationRequest,
  RefreshTokenRequest,
  AuthResponse,
  UserResponse,
  DealerProfileResponse,
} from '../types/auth';
import { emailService } from '../services/emailService';
import { generateDealerId } from '../utils/helpers';
import { prisma } from '../lib/prisma';
import type { DealerProfile } from '@prisma/client';

export class AuthController {
  /**
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - firstName
   *               - lastName
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 8
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               phone:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [CUSTOMER, DEALER]
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Validation error
   *       409:
   *         description: User already exists
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, role = 'CUSTOMER' }: RegisterRequest = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Email, password, first name, and last name are required',
        });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Password must be at least 8 characters long',
        });
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        res.status(409).json({
          error: 'User already exists',
          message: 'A user with this email already exists',
        });
        return;
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const emailVerificationToken = uuidv4();

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: role as any,
          emailVerificationToken,
        },
      });

      // Send verification email
      try {
        await emailService.sendVerificationEmail(user.email, emailVerificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      // Generate tokens
      const tokens = generateTokens(user);

      // Return user data (without password)
      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      const response: AuthResponse = {
        user: userResponse,
        tokens,
      };

      res.status(201).json({
        message: 'User registered successfully',
        data: response,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to register user',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/register-dealer:
   *   post:
   *     summary: Register a new dealer
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - firstName
   *               - lastName
   *               - companyName
   *               - contactPerson
   *               - location
   *               - country
   *               - city
   *               - address
   *               - phone
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 8
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               phone:
   *                 type: string
   *               companyName:
   *                 type: string
   *               contactPerson:
   *                 type: string
   *               businessLicense:
   *                 type: string
   *               taxId:
   *                 type: string
   *               location:
   *                 type: string
   *               country:
   *                 type: string
   *               city:
   *                 type: string
   *               address:
   *                 type: string
   *               website:
   *                 type: string
   *               yearsInBusiness:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Dealer registered successfully
   *       400:
   *         description: Validation error
   *       409:
   *         description: User already exists
   */
  static async registerDealer(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        companyName,
        contactPerson,
        businessLicense,
        taxId,
        location,
        country,
        city,
        address,
        website,
        yearsInBusiness,
      }: DealerRegistrationRequest = req.body;

      // Validate required fields
      const requiredFields = [
        'email', 'password', 'firstName', 'lastName', 'companyName',
        'contactPerson', 'location', 'country', 'city', 'address', 'phone'
      ];

      for (const field of requiredFields) {
        if (!req.body[field]) {
          res.status(400).json({
            error: 'Validation error',
            message: `${field} is required`,
          });
          return;
        }
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        res.status(409).json({
          error: 'User already exists',
          message: 'A user with this email already exists',
        });
        return;
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const emailVerificationToken = uuidv4();

      // Generate unique dealer ID
      const dealerId = await generateDealerId();

      // Create user and dealer profile in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role: 'DEALER',
            emailVerificationToken,
          },
        });

        // Create dealer profile
        const dealerProfile = await tx.dealerProfile.create({
          data: {
            userId: user.id,
            dealerId,
            companyName,
            contactPerson,
            businessLicense,
            taxId,
            location,
            country,
            city,
            address,
            phone,
            website,
            yearsInBusiness,
            status: 'PENDING',
          },
        });

        return { user, dealerProfile };
      });

      // Send verification email
      try {
        await emailService.sendVerificationEmail(result.user.email, emailVerificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      // Generate tokens
      const tokens = generateTokens(result.user);

      // Return user data
      const userResponse: UserResponse = {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        role: result.user.role,
        isActive: result.user.isActive,
        emailVerified: result.user.emailVerified,
        lastLogin: result.user.lastLogin,
        dealerProfile: mapDealerProfile(result.dealerProfile),
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      };

      const response: AuthResponse = {
        user: userResponse,
        tokens,
      };

      res.status(201).json({
        message: 'Dealer registered successfully',
        data: response,
      });
    } catch (error) {
      console.error('Dealer registration error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to register dealer',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *               rememberMe:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   *       403:
   *         description: Account inactive or not verified
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, rememberMe = false }: LoginRequest = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Email and password are required',
        });
        return;
      }

      // Find user with dealer profile
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          dealerProfile: true,
        },
      });

      if (!user) {
        res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password',
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(403).json({
          error: 'Account inactive',
          message: 'Your account has been deactivated',
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password',
        });
        return;
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const tokens = generateTokens(user, rememberMe);

      // Return user data
      const userResponse: UserResponse = {
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
      };

      const response: AuthResponse = {
        user: userResponse,
        tokens,
      };

      res.json({
        message: 'Login successful',
        data: response,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to login',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Refresh token is required',
        });
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          dealerProfile: true,
        },
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          error: 'Invalid token',
          message: 'User not found or inactive',
        });
        return;
      }

      // Generate new tokens
      const tokens = generateTokens(user);

      res.json({
        message: 'Token refreshed successfully',
        data: { tokens },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          error: 'Invalid token',
          message: 'Invalid refresh token',
        });
      } else {
        console.error('Token refresh error:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to refresh token',
        });
      }
    }
  }

  /**
   * @swagger
   * /api/v1/auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a more sophisticated implementation, you might want to blacklist the token
      // For now, we'll just return a success message
      res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to logout',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/verify-email:
   *   post:
   *     summary: Verify email address
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *             properties:
   *               token:
   *                 type: string
   *     responses:
   *       200:
   *         description: Email verified successfully
   *       400:
   *         description: Invalid or expired token
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token }: EmailVerificationRequest = req.body;

      if (!token) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Verification token is required',
        });
        return;
      }

      // Find user with this verification token
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerified: false,
        },
      });

      if (!user) {
        res.status(400).json({
          error: 'Invalid token',
          message: 'Invalid or expired verification token',
        });
        return;
      }

      // Update user to mark email as verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
        },
      });

      res.json({
        message: 'Email verified successfully',
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify email',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/forgot-password:
   *   post:
   *     summary: Request password reset
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *     responses:
   *       200:
   *         description: Password reset email sent
   *       404:
   *         description: User not found
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email }: PasswordResetRequest = req.body;

      if (!email) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Email is required',
        });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if user exists or not
        res.json({
          message: 'If an account with that email exists, a password reset link has been sent',
        });
        return;
      }

      // Generate password reset token
      const passwordResetToken = uuidv4();
      const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken,
          passwordResetExpires,
        },
      });

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(user.email, passwordResetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to send password reset email',
        });
        return;
      }

      res.json({
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process password reset request',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/reset-password:
   *   post:
   *     summary: Reset password with token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - newPassword
   *             properties:
   *               token:
   *                 type: string
   *               newPassword:
   *                 type: string
   *                 minLength: 8
   *     responses:
   *       200:
   *         description: Password reset successfully
   *       400:
   *         description: Invalid or expired token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword }: PasswordResetConfirmRequest = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Token and new password are required',
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Password must be at least 8 characters long',
        });
        return;
      }

      // Find user with valid reset token
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        res.status(400).json({
          error: 'Invalid token',
          message: 'Invalid or expired password reset token',
        });
        return;
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      res.json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to reset password',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/change-password:
   *   post:
   *     summary: Change password (authenticated user)
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *                 minLength: 8
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Invalid current password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
      const userId = req.user?.user.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Current password and new password are required',
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          error: 'Validation error',
          message: 'New password must be at least 8 characters long',
        });
        return;
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'User not found',
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          error: 'Invalid password',
          message: 'Current password is incorrect',
        });
        return;
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      res.json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to change password',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/me:
   *   get:
   *     summary: Get current user profile
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.user.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      // Get user with dealer profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          dealerProfile: true,
        },
      });

      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'User not found',
        });
        return;
      }

      // Return user data
      const userResponse: UserResponse = {
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
      };

      res.json({
        message: 'Profile retrieved successfully',
        data: userResponse,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get profile',
      });
    }
  }
}

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

// Helper function to generate JWT tokens
function generateTokens(user: any, rememberMe: boolean = false) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    dealerId: user.dealerProfile?.dealerId,
  };

  const expiresIn = rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d');
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  const jwtSecret = process.env.JWT_SECRET as Secret;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as Secret;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets are not configured');
  }

  const accessToken = jwt.sign(payload, jwtSecret, {
    expiresIn: expiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
    expiresIn: refreshExpiresIn,
  } as jwt.SignOptions);

  return {
    accessToken,
    refreshToken,
    expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // seconds
  };
}
