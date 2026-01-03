import Joi from 'joi';

// Common validation patterns
const emailSchema = Joi.string().email().lowercase().required();
const passwordSchema = Joi.string().min(8).max(128).required();
const phoneSchema = Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional();
const nameSchema = Joi.string().min(2).max(50).required();

// Authentication schemas
export const loginSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: Joi.boolean().optional(),
});

export const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: Joi.string().valid('CUSTOMER', 'DEALER').optional(),
});

export const dealerRegistrationSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  companyName: Joi.string().min(2).max(100).required(),
  contactPerson: Joi.string().min(2).max(100).required(),
  businessLicense: Joi.string().max(50).optional(),
  taxId: Joi.string().max(50).optional(),
  location: Joi.string().min(2).max(100).required(),
  country: Joi.string().min(2).max(50).required(),
  city: Joi.string().min(2).max(50).required(),
  address: Joi.string().min(5).max(200).required(),
  website: Joi.string().uri().optional(),
  yearsInBusiness: Joi.number().integer().min(0).max(100).optional(),
});

export const passwordResetSchema = Joi.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = Joi.object({
  token: Joi.string().uuid().required(),
  newPassword: passwordSchema,
});

export const changePasswordSchema = Joi.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const emailVerificationSchema = Joi.object({
  token: Joi.string().uuid().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Product schemas
export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  shortDescription: Joi.string().max(500).optional(),
  sku: Joi.string().min(3).max(50).required(),
  categoryId: Joi.string().uuid().required(),
  brand: Joi.string().min(2).max(50).required(),
  model: Joi.string().min(2).max(50).required(),
  size: Joi.string().min(5).max(20).required(),
  width: Joi.number().integer().min(100).max(500).required(),
  profile: Joi.number().integer().min(20).max(100).required(),
  rimSize: Joi.number().integer().min(10).max(30).required(),
  loadIndex: Joi.number().integer().min(50).max(200).optional(),
  speedRating: Joi.string().length(1).optional(),
  season: Joi.string().valid('ALL_SEASON', 'SUMMER', 'WINTER', 'PERFORMANCE').required(),
  type: Joi.string().valid('PASSENGER', 'PERFORMANCE', 'TRUCK', 'OFF_ROAD', 'COMMERCIAL').required(),
  price: Joi.number().positive().required(),
  costPrice: Joi.number().positive().optional(),
  salePrice: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).default(0),
  minStock: Joi.number().integer().min(0).default(0),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.object().optional(),
  specifications: Joi.object().optional(),
  features: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  isActive: Joi.boolean().default(true),
  isFeatured: Joi.boolean().default(false),
  metaTitle: Joi.string().max(60).optional(),
  metaDescription: Joi.string().max(160).optional(),
  metaKeywords: Joi.array().items(Joi.string()).optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  shortDescription: Joi.string().max(500).optional(),
  brand: Joi.string().min(2).max(50).optional(),
  model: Joi.string().min(2).max(50).optional(),
  size: Joi.string().min(5).max(20).optional(),
  width: Joi.number().integer().min(100).max(500).optional(),
  profile: Joi.number().integer().min(20).max(100).optional(),
  rimSize: Joi.number().integer().min(10).max(30).optional(),
  loadIndex: Joi.number().integer().min(50).max(200).optional(),
  speedRating: Joi.string().length(1).optional(),
  season: Joi.string().valid('ALL_SEASON', 'SUMMER', 'WINTER', 'PERFORMANCE').optional(),
  type: Joi.string().valid('PASSENGER', 'PERFORMANCE', 'TRUCK', 'OFF_ROAD', 'COMMERCIAL').optional(),
  price: Joi.number().positive().optional(),
  costPrice: Joi.number().positive().optional(),
  salePrice: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).optional(),
  minStock: Joi.number().integer().min(0).optional(),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.object().optional(),
  specifications: Joi.object().optional(),
  features: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  metaTitle: Joi.string().max(60).optional(),
  metaDescription: Joi.string().max(160).optional(),
  metaKeywords: Joi.array().items(Joi.string()).optional(),
});

export const productSearchSchema = Joi.object({
  query: Joi.string().min(1).max(100).optional(),
  category: Joi.string().optional(),
  brand: Joi.string().optional(),
  size: Joi.string().optional(),
  season: Joi.string().valid('ALL_SEASON', 'SUMMER', 'WINTER', 'PERFORMANCE').optional(),
  type: Joi.string().valid('PASSENGER', 'PERFORMANCE', 'TRUCK', 'OFF_ROAD', 'COMMERCIAL').optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  inStock: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'price', 'createdAt', 'popularity').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Order schemas
export const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
  shippingAddressId: Joi.string().uuid().optional(),
  billingAddressId: Joi.string().uuid().optional(),
  notes: Joi.string().max(500).optional(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED').required(),
  notes: Joi.string().max(500).optional(),
});

// Payment schemas
export const processPaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  method: Joi.string().valid('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'MPESA', 'AIRTEL_MONEY', 'MTN_MOBILE_MONEY', 'PESAPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY').required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  paymentDetails: Joi.object().optional(),
});

// Address schemas
export const createAddressSchema = Joi.object({
  type: Joi.string().valid('BILLING', 'SHIPPING').default('BILLING'),
  firstName: nameSchema,
  lastName: nameSchema,
  company: Joi.string().max(100).optional(),
  address1: Joi.string().min(5).max(200).required(),
  address2: Joi.string().max(200).optional(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().max(50).optional(),
  postalCode: Joi.string().max(20).optional(),
  country: Joi.string().min(2).max(50).required(),
  phone: phoneSchema,
  isDefault: Joi.boolean().default(false),
});

export const updateAddressSchema = Joi.object({
  type: Joi.string().valid('BILLING', 'SHIPPING').optional(),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  company: Joi.string().max(100).optional(),
  address1: Joi.string().min(5).max(200).optional(),
  address2: Joi.string().max(200).optional(),
  city: Joi.string().min(2).max(50).optional(),
  state: Joi.string().max(50).optional(),
  postalCode: Joi.string().max(20).optional(),
  country: Joi.string().min(2).max(50).optional(),
  phone: phoneSchema,
  isDefault: Joi.boolean().optional(),
});

// Dealer schemas
export const updateDealerProfileSchema = Joi.object({
  companyName: Joi.string().min(2).max(100).optional(),
  contactPerson: Joi.string().min(2).max(100).optional(),
  businessLicense: Joi.string().max(50).optional(),
  taxId: Joi.string().max(50).optional(),
  location: Joi.string().min(2).max(100).optional(),
  country: Joi.string().min(2).max(50).optional(),
  city: Joi.string().min(2).max(50).optional(),
  address: Joi.string().min(5).max(200).optional(),
  phone: phoneSchema,
  website: Joi.string().uri().optional(),
  yearsInBusiness: Joi.number().integer().min(0).max(100).optional(),
});

export const approveDealerSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'REJECTED').required(),
  notes: Joi.string().max(500).optional(),
});

// Review schemas
export const createReviewSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().max(100).optional(),
  comment: Joi.string().max(1000).optional(),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  title: Joi.string().max(100).optional(),
  comment: Joi.string().max(1000).optional(),
});

// CMS schemas
export const createPageSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  slug: Joi.string().min(2).max(100).required(),
  content: Joi.string().min(10).required(),
  excerpt: Joi.string().max(500).optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').default('DRAFT'),
  metaTitle: Joi.string().max(60).optional(),
  metaDescription: Joi.string().max(160).optional(),
  metaKeywords: Joi.array().items(Joi.string()).optional(),
});

export const updatePageSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  slug: Joi.string().min(2).max(100).optional(),
  content: Joi.string().min(10).optional(),
  excerpt: Joi.string().max(500).optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
  metaTitle: Joi.string().max(60).optional(),
  metaDescription: Joi.string().max(160).optional(),
  metaKeywords: Joi.array().items(Joi.string()).optional(),
});

export const createBlogPostSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  slug: Joi.string().min(2).max(100).required(),
  content: Joi.string().min(10).required(),
  excerpt: Joi.string().max(500).optional(),
  featuredImage: Joi.string().uri().optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').default('DRAFT'),
  metaTitle: Joi.string().max(60).optional(),
  metaDescription: Joi.string().max(160).optional(),
  metaKeywords: Joi.array().items(Joi.string()).optional(),
});

export const updateBlogPostSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  slug: Joi.string().min(2).max(100).optional(),
  content: Joi.string().min(10).optional(),
  excerpt: Joi.string().max(500).optional(),
  featuredImage: Joi.string().uri().optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
  metaTitle: Joi.string().max(60).optional(),
  metaDescription: Joi.string().max(160).optional(),
  metaKeywords: Joi.array().items(Joi.string()).optional(),
});

// Query parameter schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

// File upload schemas
export const fileUploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/webp', 'image/gif').required(),
  size: Joi.number().max(5 * 1024 * 1024).required(), // 5MB max
});
