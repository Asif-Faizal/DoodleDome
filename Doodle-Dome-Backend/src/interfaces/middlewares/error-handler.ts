import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export class ApplicationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error(err.stack);
  
  if (err instanceof ApplicationError) {
    res.status(err.statusCode).json({
      error: err.message
    });
    return;
  }
  
  res.status(500).json({
    error: 'Internal server error'
  });
}; 