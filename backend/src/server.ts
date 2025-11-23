import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from './lib/prisma';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import dealerRoutes from './routes/dealers';
import cmsRoutes from './routes/cms';
import analyticsRoutes from './routes/analytics';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateApiKey } from './middleware/validateApiKey';
import { authenticateToken } from './middleware/auth';

// Import services
import { initializePaymentServices } from './services/paymentService';
import { initializeEmailService } from './services/emailService';
import { initializeFileUpload } from './services/fileUploadService';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO for real-time features
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Arisegenius API',
      version: '1.0.0',
      description: 'Leading African Tire Innovation - Backend API',
      contact: {
        name: 'Arisegenius API Support',
        email: 'api@arisegenius.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.arisegenius.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Arisegenius API Documentation',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
const apiPrefix = `/api/${API_VERSION}`;

// Public routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);

// Protected routes (require authentication)
app.use(`${apiPrefix}/users`, validateApiKey, authenticateToken, userRoutes);
app.use(`${apiPrefix}/orders`, validateApiKey, authenticateToken, orderRoutes);
app.use(`${apiPrefix}/dealers`, validateApiKey, authenticateToken, dealerRoutes);
app.use(`${apiPrefix}/cms`, validateApiKey, authenticateToken, cmsRoutes);
app.use(`${apiPrefix}/analytics`, validateApiKey, authenticateToken, analyticsRoutes);

// Socket.IO connection handling
io.on('connection', (socket: any) => {
  console.log(`Client connected: ${socket.id}`);

  // Join dealer room for real-time updates
  socket.on('join-dealer-room', (dealerId: any) => {
    socket.join(`dealer-${dealerId}`);
    console.log(`Dealer ${dealerId} joined their room`);
  });

  // Join order tracking room
  socket.on('join-order-room', (orderId: any) => {
    socket.join(`order-${orderId}`);
    console.log(`Client joined order tracking room: ${orderId}`);
  });

  // Handle order status updates
  socket.on('order-status-update', async (data: any) => {
    try {
      const { orderId, status } = data;
      // Emit to all clients tracking this order
      io.to(`order-${orderId}`).emit('order-status-changed', {
        orderId,
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error handling order status update:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to other modules
export { io };

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    availableRoutes: [
      `${apiPrefix}/auth`,
      `${apiPrefix}/products`,
      `${apiPrefix}/orders`,
      `${apiPrefix}/payments`,
      `${apiPrefix}/dealers`,
      `${apiPrefix}/cms`,
      `${apiPrefix}/analytics`,
    ],
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});

// Initialize services
async function initializeServices() {
  try {
    await initializePaymentServices();
    await initializeEmailService();
    await initializeFileUpload();
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing services:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Initialize services
    await initializeServices();

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Arisegenius API server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;
