// src/logger/logger.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from './winston.logger';

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { method, originalUrl } = req;

  res.on('finish', () => {
    logger.info(
      `${method} ${originalUrl} → ${res.statusCode}`,
      { context: 'HTTP' },
    );
  });

  next();
}
