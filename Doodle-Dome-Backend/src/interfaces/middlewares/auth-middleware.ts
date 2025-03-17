import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../infrastructure/security/token-service';
import { UserType } from '../../core/domain/entities/User';
import { StudentRepository } from '../../infrastructure/repositories/StudentRepository';
import { SchoolRepository } from '../../infrastructure/repositories/SchoolRepository';
import { getConnection } from '../../infrastructure/database/database-connection';

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

export const authorizeSchool = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Skip for admin users - they can access everything
    if (req.user?.userType === UserType.ADMIN) {
      next();
      return;
    }
    
    // For school users, check if they're accessing their own resources
    if (req.user?.userType === UserType.SCHOOL) {
      // If accessing student by ID
      if (req.params.id) {
        const studentRepository = new StudentRepository(getConnection());
        const student = await studentRepository.findById(Number(req.params.id));
        
        if (!student) {
          res.status(404).json({ error: 'Student not found' });
          return;
        }
        
        const schoolRepository = new SchoolRepository(getConnection());
        const school = await schoolRepository.findByUserId(req.user.userId);
        
        if (!school || school.id !== student.schoolId) {
          res.status(403).json({ error: 'Unauthorized: You can only manage students from your own school' });
          return;
        }
      }
      
      // If accessing students by school ID
      if (req.params.schoolId) {
        const schoolRepository = new SchoolRepository(getConnection());
        const school = await schoolRepository.findByUserId(req.user.userId);
        
        if (!school || school.id !== Number(req.params.schoolId)) {
          res.status(403).json({ error: 'Unauthorized: You can only access your own school data' });
          return;
        }
      }
      
      next();
      return;
    }
    
    // If not admin or school, deny access
    res.status(403).json({ error: 'Unauthorized: Insufficient permissions' });
  } catch (error) {
    next(error);
  }
}; 