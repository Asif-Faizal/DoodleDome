import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../infrastructure/security/token-service';
import { UserType } from '../../core/domain/entities/User';

const tokenService = new TokenService();

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    userType: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyToken(token);
    
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.userType !== UserType.ADMIN) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  
  next();
};

export const authorizeSchool = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.userType !== UserType.SCHOOL && req.user?.userType !== UserType.ADMIN) {
    res.status(403).json({ message: 'School or admin access required' });
    return;
  }
  
  next();
}; 