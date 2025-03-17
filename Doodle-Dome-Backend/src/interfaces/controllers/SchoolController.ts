import { Request, Response, NextFunction } from 'express';
import { ISchoolRepository } from '../../core/domain/repositories/ISchoolRepository';
import { School } from '../../core/domain/entities/School';
import { AuthRequest } from '../middlewares/auth-middleware';
import { UserType } from '../../core/domain/entities/User';

export class SchoolController {
  constructor(
    private schoolRepository: ISchoolRepository
  ) {}

  // Get all schools
  getAllSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schools = await this.schoolRepository.findAll();
      res.json(schools);
    } catch (error) {
      next(error);
    }
  };

  // Get school by ID
  getSchoolById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = parseInt(req.params.id);
      const school = await this.schoolRepository.findById(schoolId);
      
      if (!school) {
        res.status(404).json({ message: 'School not found' });
        return;
      }
      
      res.json(school);
    } catch (error) {
      next(error);
    }
  };

  // Update school (admin only, or school user updating own record)
  updateSchool = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = parseInt(req.params.id);
      const { schoolName, address, phone } = req.body;
      
      const school = await this.schoolRepository.findById(schoolId);
      
      if (!school) {
        res.status(404).json({ message: 'School not found' });
        return;
      }
      
      // Only allow updating own school unless admin
      if (req.user?.userType !== UserType.ADMIN && 
          req.user?.userType === UserType.SCHOOL && 
          school.userId !== req.user.userId) {
        res.status(403).json({ message: 'Not authorized to update this school' });
        return;
      }
      
      // Prepare update data
      const updateData: Partial<School> = {};
      
      if (schoolName) updateData.schoolName = schoolName;
      if (address) updateData.address = address;
      if (phone) updateData.phone = phone;
      
      const updated = await this.schoolRepository.update(schoolId, updateData);
      
      if (updated) {
        res.json({ message: 'School updated successfully' });
      } else {
        res.status(400).json({ message: 'Failed to update school' });
      }
    } catch (error) {
      next(error);
    }
  };

  // Delete school (admin only)
  deleteSchool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = parseInt(req.params.id);
      
      const deleted = await this.schoolRepository.delete(schoolId);
      
      if (deleted) {
        res.json({ message: 'School deleted successfully' });
      } else {
        res.status(404).json({ message: 'School not found' });
      }
    } catch (error) {
      next(error);
    }
  };
} 