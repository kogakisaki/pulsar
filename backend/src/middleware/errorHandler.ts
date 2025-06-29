import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;

  logger.error(err);

  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: err.message || 'An unexpected error occurred',
  });
};

export default errorHandler;