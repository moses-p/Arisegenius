# Arisegenius Backend API

A comprehensive, production-ready backend API for Arisegenius - Africa's leading tire innovation platform. Built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

### Core Functionality
- **JWT Authentication & Authorization** - Secure user authentication with role-based access control
- **Multi-Role User System** - Customers, Dealers, Admins, and Super Admins
- **Dealer Portal** - Complete B2B solution for tire dealers
- **Product Management** - Comprehensive tire catalog with search and filtering
- **Order Management** - Full e-commerce order processing
- **Payment Integration** - Multiple payment methods including mobile money
- **Content Management** - Blog posts, pages, and dynamic content
- **File Upload System** - Secure file handling with validation
- **Real-time Updates** - Socket.IO integration for live notifications
- **Email System** - Automated email notifications and templates

### Payment Methods
- **Credit/Debit Cards** - Stripe integration
- **PayPal** - PayPal payment processing
- **M-Pesa** - Safaricom mobile money (Kenya)
- **Airtel Money** - Airtel mobile money (Uganda)
- **MTN Mobile Money** - MTN mobile money (Ghana)

### Security Features
- **Rate Limiting** - API request throttling
- **Input Validation** - Comprehensive request validation
- **SQL Injection Protection** - Prisma ORM with parameterized queries
- **XSS Protection** - Content sanitization
- **CORS Configuration** - Cross-origin request handling
- **Helmet Security** - Security headers
- **API Key Authentication** - Optional API key validation

## 🏗️ Architecture

```
src/
├── controllers/          # Request handlers
├── middleware/          # Custom middleware
├── routes/             # API route definitions
├── services/           # Business logic services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── database/           # Database configuration and seeds
└── server.ts           # Main application entry point
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **Email**: Nodemailer
- **Real-time**: Socket.IO
- **Documentation**: Swagger/OpenAPI
- **Validation**: Joi
- **Logging**: Winston
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd arisegenius-backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/arisegenius_db"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# API Configuration
API_KEY="arisegenius-api-key-2024"
API_VERSION="v1"
PORT=3000

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@arisegenius.com"

# Payment Gateways
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
MPESA_CONSUMER_KEY="your_mpesa_consumer_key"
MPESA_CONSUMER_SECRET="your_mpesa_consumer_secret"
AIRTEL_CLIENT_ID="your_airtel_client_id"
AIRTEL_CLIENT_SECRET="your_airtel_client_secret"

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE="5242880"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,image/gif"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Deployment Scripts

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh production
```

**Windows:**
```powershell
.\deploy.ps1 -Environment production
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

#### Products
- `GET /api/v1/products` - List products with filtering
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/:id` - Update product (Admin)

#### Orders
- `GET /api/v1/orders` - List user orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id/status` - Update order status

#### Payments
- `POST /api/v1/payments/process` - Process payment
- `GET /api/v1/payments/:id/status` - Check payment status
- `POST /api/v1/payments/webhooks/:provider` - Payment webhooks

#### Dealers
- `GET /api/v1/dealers` - List dealers
- `POST /api/v1/dealers/register` - Dealer registration
- `GET /api/v1/dealers/:id` - Get dealer details
- `PUT /api/v1/dealers/:id/approve` - Approve dealer (Admin)

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **CUSTOMER** - Regular customers
- **DEALER** - Tire dealers (requires approval)
- **ADMIN** - System administrators
- **SUPER_ADMIN** - Full system access

## 💳 Payment Integration

### Supported Payment Methods

1. **Stripe (Credit/Debit Cards)**
   ```javascript
   {
     "method": "CREDIT_CARD",
     "paymentDetails": {
       "token": "tok_visa",
       "customerId": "cus_123"
     }
   }
   ```

2. **M-Pesa (Kenya)**
   ```javascript
   {
     "method": "MPESA",
     "paymentDetails": {
       "phoneNumber": "254712345678"
     }
   }
   ```

3. **Airtel Money (Uganda)**
   ```javascript
   {
     "method": "AIRTEL_MONEY",
     "paymentDetails": {
       "phoneNumber": "256712345678"
     }
   }
   ```

## 📁 File Upload

Upload files using multipart/form-data:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  http://localhost:3000/api/v1/upload
```

## 🔄 Real-time Updates

The API uses Socket.IO for real-time updates:

```javascript
// Connect to Socket.IO
const socket = io('http://localhost:3000');

// Join order tracking room
socket.emit('join-order-room', orderId);

// Listen for order updates
socket.on('order-status-update', (data) => {
  console.log('Order status updated:', data);
});
```

## 📊 Monitoring & Logging

### Health Checks
- **API Health**: `GET /health`
- **Database Health**: Automatic connection monitoring

### Logging
- **Application Logs**: `./logs/combined.log`
- **Error Logs**: `./logs/error.log`
- **Request Logs**: Winston with structured logging

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 🚀 Production Deployment

### Environment Setup

1. **Database**: Set up PostgreSQL with proper backups
2. **SSL**: Configure SSL certificates for HTTPS
4. **Domain**: Set up domain and DNS
5. **Monitoring**: Set up application monitoring

### Security Checklist

- [ ] Change all default passwords
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up log monitoring
- [ ] Enable database encryption
- [ ] Configure backup strategy

### Performance Optimization

- [ ] Configure CDN for static assets
- [ ] Optimize database queries
- [ ] Enable gzip compression
- [ ] Set up load balancing
- [ ] Configure auto-scaling

## 📞 Support

For support and questions:
- **Email**: api@arisegenius.com
- **Documentation**: [API Docs](http://localhost:3000/api-docs)
- **Issues**: GitHub Issues

## 📄 License

This project is proprietary software owned by Arisegenius.

---

**Arisegenius** - Leading African Tire Innovation 🚗💨
