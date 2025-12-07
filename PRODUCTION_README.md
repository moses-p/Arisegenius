# Arisegenius Production Deployment Guide

## 🚀 Production Readiness Checklist

### ✅ Completed Tasks

1. **Mobile Optimization**
   - ✅ Enhanced responsive design for all screen sizes
   - ✅ Improved text visibility with better contrast
   - ✅ Optimized font sizes for mobile devices
   - ✅ Enhanced navigation for mobile

2. **Database Configuration**
   - ✅ Removed all Redis references
   - ✅ PostgreSQL-only database setup
   - ✅ Database connection configured

3. **Frontend Optimization**
   - ✅ Removed News and Contact sections from home page (moved to independent pages)
   - ✅ All navigation links point to independent pages
   - ✅ Mobile-responsive design implemented
   - ✅ Text visibility improved

### 📋 Pre-Deployment Checklist

#### Environment Variables

Create `.env` files for production:

**Backend `.env`:**
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/arisegenius_db?schema=public"

# Server
PORT=5000
NODE_ENV="production"
API_VERSION="v1"

# JWT
JWT_SECRET="your-production-jwt-secret-min-32-chars"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-production-refresh-secret-min-32-chars"
JWT_REFRESH_EXPIRES_IN="30d"

# CORS
CORS_ORIGIN="https://arisegenius.com,https://www.arisegenius.com"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@arisegenius.com"

# Payment Gateways
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="your-production-session-secret"
API_KEY="your-production-api-key"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,image/gif"

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="arisegenius-assets"

# Monitoring
SENTRY_DSN="your_sentry_dsn"
```

**Frontend Environment:**
- Update API base URL in frontend JavaScript files
- Configure production API endpoint

#### Database Setup

1. **Create Production Database:**
```sql
CREATE DATABASE arisegenius_db;
CREATE USER arisegenius_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE arisegenius_db TO arisegenius_user;
```

2. **Run Migrations:**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

3. **Seed Database (Optional):**
```bash
npm run seed
```

#### Build and Deploy

**Backend:**
```bash
cd backend
npm install --production
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm install
# Serve static files using nginx or similar
```

### 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Enable database encryption
- [ ] Set up regular backups
- [ ] Configure log monitoring
- [ ] Review and update API keys

### 📊 Testing

**API Testing:**
```bash
cd backend
chmod +x test-api.sh
./test-api.sh
```

**Manual Testing:**
1. Test all frontend pages
2. Test authentication flow
3. Test product browsing
4. Test order creation
5. Test payment processing
6. Test admin panel
7. Test mobile responsiveness

### 🚀 Deployment Steps

1. **Prepare Server:**
   - Install Node.js 18+
   - Install PostgreSQL 15+
   - Install nginx (for frontend)

2. **Deploy Backend:**
   ```bash
   git clone <repository>
   cd arisegenius-backend
   npm install --production
   npm run build
   cp .env.example .env
   # Edit .env with production values
   npx prisma migrate deploy
   npm start
   ```

3. **Deploy Frontend:**
   - Copy frontend files to nginx web root
   - Configure nginx for SPA routing
   - Update API endpoint URLs

4. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name arisegenius.com;
       
       root /var/www/arisegenius/frontend;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Set Up SSL:**
   ```bash
   sudo certbot --nginx -d arisegenius.com -d www.arisegenius.com
   ```

### 📝 Post-Deployment

1. Monitor application logs
2. Test all critical paths
3. Set up monitoring alerts
4. Configure backup schedule
5. Document any custom configurations

### 🆘 Troubleshooting

**Database Connection Issues:**
- Verify DATABASE_URL format
- Check PostgreSQL is running
- Verify user permissions

**API Not Responding:**
- Check server logs
- Verify PORT is not in use
- Check firewall rules

**Frontend Issues:**
- Verify API endpoint URLs
- Check browser console for errors
- Verify nginx configuration

### 📞 Support

For issues or questions:
- Check logs: `backend/logs/`
- Review API docs: `http://your-domain/api-docs`
- Contact: support@arisegenius.com

