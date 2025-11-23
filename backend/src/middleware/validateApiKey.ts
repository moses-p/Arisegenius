import { Request, Response, NextFunction } from 'express';
export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        error: 'API key required',
        message: 'Please provide a valid API key in the X-API-Key header',
      });
      return;
    }

    // In a real implementation, you would validate the API key against a database
    // For now, we'll use a simple environment variable check
    const validApiKey = process.env.API_KEY || 'arisegenius-api-key-2024';

    if (apiKey !== validApiKey) {
      res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid',
      });
      return;
    }

    // Optional: Log API key usage for analytics
    console.log(`API key used: ${apiKey.substring(0, 8)}...`);

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate API key',
    });
  }
};

// Optional: More sophisticated API key validation with database
export const validateApiKeyWithDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        error: 'API key required',
        message: 'Please provide a valid API key in the X-API-Key header',
      });
      return;
    }

    // Check if API key exists in database (if you have an API keys table)
    // const apiKeyRecord = await prisma.apiKey.findUnique({
    //   where: { key: apiKey },
    //   include: { user: true },
    // });

    // if (!apiKeyRecord || !apiKeyRecord.isActive) {
    //   res.status(401).json({
    //     error: 'Invalid API key',
    //     message: 'The provided API key is invalid or inactive',
    //   });
    //   return;
    // }

    // // Check if API key has expired
    // if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    //   res.status(401).json({
    //     error: 'API key expired',
    //     message: 'The provided API key has expired',
    //   });
    //   return;
    // }

    // // Update last used timestamp
    // await prisma.apiKey.update({
    //   where: { id: apiKeyRecord.id },
    //   data: { lastUsedAt: new Date() },
    // });

    // // Add user info to request
    // req.apiKeyUser = apiKeyRecord.user;

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate API key',
    });
  }
};
