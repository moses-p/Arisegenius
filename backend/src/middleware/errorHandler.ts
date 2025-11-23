import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let details: any = undefined;

  // Log error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Handle different types of errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database errors
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A record with this information already exists';
        details = {
          field: error.meta?.target,
          code: 'DUPLICATE_ENTRY',
        };
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        details = {
          code: 'NOT_FOUND',
        };
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference to related record';
        details = {
          code: 'FOREIGN_KEY_CONSTRAINT',
        };
        break;
      case 'P2014':
        statusCode = 400;
        message = 'Invalid ID provided';
        details = {
          code: 'INVALID_ID',
        };
        break;
      default:
        statusCode = 500;
        message = 'Database operation failed';
        details = {
          code: 'DATABASE_ERROR',
        };
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    details = {
      code: 'VALIDATION_ERROR',
    };
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    message = 'Database connection failed';
    details = {
      code: 'DATABASE_CONNECTION_ERROR',
    };
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = {
      code: 'VALIDATION_ERROR',
    };
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    details = {
      code: 'CAST_ERROR',
    };
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    details = {
      code: 'INVALID_TOKEN',
    };
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    details = {
      code: 'TOKEN_EXPIRED',
    };
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    switch (error.message) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = 'File upload error';
    }
    details = {
      code: 'FILE_UPLOAD_ERROR',
    };
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    message = 'Something went wrong';
    details = undefined;
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        originalError: error.message,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Global error handler for unhandled promise rejections
export const handleUnhandledRejection = (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Close server gracefully
  process.exit(1);
};

// Global error handler for uncaught exceptions
export const handleUncaughtException = (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Close server gracefully
  process.exit(1);
};
