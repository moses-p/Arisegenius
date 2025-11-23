# Arisegenius - Leading African Tire Innovation

A comprehensive, world-class website and backend API for Arisegenius, Africa's premier tire manufacturer. Built with modern web technologies and designed for global excellence.

## 🚀 Project Overview

Arisegenius is a sophisticated platform that combines:
- **Frontend**: Modern, responsive website with advanced UX
- **Backend**: Robust API with payment integration and dealer portal
- **Mobile Money**: Integration with African payment systems
- **PWA**: Progressive Web App capabilities

## 📁 Project Structure

```
Arisegenius/
├── frontend/                 # Frontend website files
│   ├── index.html           # Main homepage
│   ├── ventures.html        # Ventures page
│   ├── products.html        # Products showcase
│   ├── payment.html         # Payment integration
│   ├── styles.css           # Main stylesheet
│   ├── script.js            # Main JavaScript
│   ├── assets/              # Images, videos, icons
│   ├── favicon files        # All favicon and icon files
│   ├── site.webmanifest     # PWA manifest
│   └── Dockerfile           # Frontend container
├── backend/                 # Backend API files
│   ├── src/                 # Source code
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Main server file
│   ├── prisma/              # Database schema
│   ├── package.json         # Dependencies
│   └── Dockerfile           # Backend container
├── docker-compose.yml       # Multi-service orchestration
├── deploy.sh               # Linux/Mac deployment script
├── deploy.ps1              # Windows deployment script
└── README.md               # This file
```

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript** - Interactive functionality
- **PWA** - Progressive Web App features
- **Nginx** - Web server and reverse proxy

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Prisma** - Database ORM
- **JWT** - Authentication
- **Socket.IO** - Real-time features

### Payment Integration
- **Stripe** - Credit/debit cards
- **M-Pesa** - Safaricom mobile money
- **Airtel Money** - Airtel mobile money
- **MTN Mobile Money** - MTN mobile money
- **PayPal** - PayPal payments

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **Nginx** - Load balancing and SSL
- **Winston** - Logging
- **Swagger** - API documentation

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- PostgreSQL 15+ (for development)
- Redis 7+ (for development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Arisegenius
   ```

2. **Start with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

3. **Access the application**
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost/api
   - **API Docs**: http://localhost/api-docs
   - **Health Check**: http://localhost/health

### Manual Development Setup

#### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Configure .env file
npx prisma generate
npx prisma migrate deploy
npm run seed  # Optional: seed sample data
npm run dev
```

#### Frontend Setup
```bash
cd frontend
# Serve with any static file server
python -m http.server 8000
# or
npx serve .
```

## 📱 Features

### Frontend Features
- **Responsive Design** - Mobile-first approach
- **Parallax Scrolling** - Smooth animations
- **Tire Finder Tool** - Interactive search
- **3D Product Viewer** - Product visualization
- **B2B Portal** - Dealer access
- **Interactive Map** - Dealer locations
- **PWA Support** - Install as app
- **SEO Optimized** - Search engine friendly

### Backend Features
- **JWT Authentication** - Secure user management
- **Role-based Access** - Customer, Dealer, Admin roles
- **Payment Processing** - Multiple payment methods
- **Order Management** - Complete e-commerce
- **Real-time Updates** - Socket.IO integration
- **Email System** - Automated notifications
- **File Upload** - Secure file handling
- **API Documentation** - Swagger/OpenAPI

### Payment Methods
- **Credit/Debit Cards** - Stripe integration
- **Mobile Money** - M-Pesa, Airtel Money, MTN
- **PayPal** - International payments
- **Bank Transfer** - Direct bank payments
- **Cash on Delivery** - Local delivery option

## 🌍 African Market Focus

- **Mobile Money Integration** - Local payment methods
- **Multi-currency Support** - USD and local currencies
- **Regional Compliance** - Data protection regulations
- **Local Language Support** - Multi-language ready
- **Offline Capabilities** - PWA offline features

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/arisegenius_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Payments
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
MPESA_CONSUMER_KEY="your_mpesa_key"
AIRTEL_CLIENT_ID="your_airtel_id"
```

### Docker Configuration

The project uses Docker Compose with the following services:
- **PostgreSQL** - Database
- **Redis** - Cache
- **Backend** - API server
- **Frontend** - Web server

## 📊 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost/api-docs
- **Health Check**: http://localhost/health

### Key Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/products` - List products
- `POST /api/v1/orders` - Create order
- `POST /api/v1/payments/process` - Process payment

## 🚀 Deployment

### Production Deployment

1. **Configure environment variables**
2. **Set up SSL certificates**
3. **Configure domain and DNS**
4. **Run deployment script**

```bash
# Linux/Mac
./deploy.sh production

# Windows
.\deploy.ps1 -Environment production
```

### Manual Deployment

```bash
# Build and start services
docker-compose -f docker-compose.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

## 📈 Monitoring

- **Health Checks** - Automatic service monitoring
- **Logging** - Structured logging with Winston
- **Error Tracking** - Comprehensive error handling
- **Performance** - Request tracking and optimization

## 🔒 Security

- **HTTPS** - SSL/TLS encryption
- **Rate Limiting** - API protection
- **Input Validation** - Request sanitization
- **Authentication** - JWT-based security
- **CORS** - Cross-origin protection

## 📞 Support

For support and questions:
- **Email**: support@arisegenius.com
- **Documentation**: [API Docs](http://localhost/api-docs)
- **Issues**: GitHub Issues

## 📄 License

This project is proprietary software owned by Arisegenius.

---

**Arisegenius** - Leading African Tire Innovation 🚗💨

*Innovation, Safety, Durability, African Leadership*