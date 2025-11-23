import { UserRole, DealerStatus } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  dealerId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: TokenPair;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date | null;
  dealerProfile?: DealerProfileResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealerProfileResponse {
  id: string;
  dealerId: string;
  companyName: string;
  contactPerson: string;
  location: string;
  country: string;
  city: string;
  phone: string;
  status: DealerStatus;
  commissionRate: number;
  creditLimit: number;
  currentBalance: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

export interface DealerRegistrationRequest extends RegisterRequest {
  companyName: string;
  contactPerson: string;
  businessLicense?: string;
  taxId?: string;
  location: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  website?: string;
  yearsInBusiness?: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthContext {
  user: UserResponse;
  isAuthenticated: boolean;
  isDealer: boolean;
  isAdmin: boolean;
  permissions: string[];
}
