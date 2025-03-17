import { Request, Response, NextFunction } from 'express';
import { IRegistrationRepository } from '../../core/domain/repositories/IRegistrationRepository';
import { ICompetitionRepository } from '../../core/domain/repositories/ICompetitionRepository';
import { IStudentRepository } from '../../core/domain/repositories/IStudentRepository';
import { ISchoolRepository } from '../../core/domain/repositories/ISchoolRepository';
import { Registration, RegistrationStatus } from '../../core/domain/entities/Registration';
import { AuthRequest } from '../middlewares/auth-middleware';
import { UserType } from '../../core/domain/entities/User';

export class RegistrationController {
  constructor(
    private registrationRepository: IRegistrationRepository,
    private competitionRepository: ICompetitionRepository,
    private studentRepository: IStudentRepository,
    private schoolRepository: ISchoolRepository
  ) {}

  // Get all registrations for a competition
  getRegistrationsByCompetition = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const competitionId = parseInt(req.params.competitionId);
      
      // Verify competition exists
      const competition = await this.competitionRepository.findById(competitionId);
      if (!competition) {
        res.status(404).json({ message: 'Competition not found' });
        return;
      }
      
      // Only admin can see all registrations
      if (req.user?.userType !== UserType.ADMIN) {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }
      
      const registrations = await this.registrationRepository.findByCompetitionId(competitionId);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  };

  // Get student's registrations
  getStudentRegistrations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = parseInt(req.params.studentId);
      
      // Verify student exists
      const student = await this.studentRepository.findById(studentId);
      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }
      
      // Allow access if admin, the student themselves, or their school
      if (req.user?.userType === UserType.ADMIN) {
        // Admin can access all student registrations
      } else if (req.user?.userType === UserType.STUDENT) {
        // Students can only view their own registrations
        const studentUser = await this.studentRepository.findByUserId(req.user.userId);
        if (!studentUser || studentUser.id !== studentId) {
          res.status(403).json({ message: 'You can only view your own registrations' });
          return;
        }
      } else if (req.user?.userType === UserType.SCHOOL) {
        // Schools can only view their students' registrations
        const school = await this.schoolRepository.findByUserId(req.user.userId);
        if (!school || school.id !== student.schoolId) {
          res.status(403).json({ message: 'You can only view registrations for students in your school' });
          return;
        }
      } else {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }
      
      const registrations = await this.registrationRepository.findByStudentId(studentId);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  };

  // Register student for competition
  registerStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, competitionId } = req.body;
      
      // Verify student exists
      const student = await this.studentRepository.findById(studentId);
      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }
      
      // Verify competition exists and registration is still open
      const competition = await this.competitionRepository.findById(competitionId);
      if (!competition) {
        res.status(404).json({ message: 'Competition not found' });
        return;
      }
      
      const now = new Date();
      if (now > competition.lastRegistrationDate) {
        res.status(400).json({ message: 'Registration for this competition is closed' });
        return;
      }
      
      // Check authorization
      if (req.user?.userType === UserType.ADMIN) {
        // Admin can register any student
      } else if (req.user?.userType === UserType.STUDENT) {
        // Students can only register themselves
        const studentUser = await this.studentRepository.findByUserId(req.user.userId);
        if (!studentUser || studentUser.id !== studentId) {
          res.status(403).json({ message: 'You can only register yourself' });
          return;
        }
      } else if (req.user?.userType === UserType.SCHOOL) {
        // Schools can only register their students
        const school = await this.schoolRepository.findByUserId(req.user.userId);
        if (!school || school.id !== student.schoolId) {
          res.status(403).json({ message: 'You can only register students from your school' });
          return;
        }
      } else {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }
      
      // Check if student is already registered
      const existingRegistration = await this.registrationRepository.findByStudentAndCompetition(
        studentId, 
        competitionId
      );
      
      if (existingRegistration) {
        res.status(400).json({ message: 'Student is already registered for this competition' });
        return;
      }
      
      // Create registration
      const registration = new Registration(
        studentId,
        competitionId,
        new Date(),
        RegistrationStatus.CONFIRMED
      );
      
      const createdRegistration = await this.registrationRepository.create(registration);
      
      res.status(201).json({
        message: 'Student registered successfully',
        registrationId: createdRegistration.id
      });
    } catch (error) {
      next(error);
    }
  };

  // Cancel registration
  cancelRegistration = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registrationId = parseInt(req.params.id);
      
      // Verify registration exists
      const registration = await this.registrationRepository.findById(registrationId);
      if (!registration) {
        res.status(404).json({ message: 'Registration not found' });
        return;
      }
      
      // Check authorization
      if (req.user?.userType === UserType.ADMIN) {
        // Admin can cancel any registration
      } else if (req.user?.userType === UserType.STUDENT) {
        // Students can only cancel their own registrations
        const student = await this.studentRepository.findByUserId(req.user.userId);
        if (!student || student.id !== registration.studentId) {
          res.status(403).json({ message: 'You can only cancel your own registrations' });
          return;
        }
      } else if (req.user?.userType === UserType.SCHOOL) {
        // Schools can only cancel their students' registrations
        const school = await this.schoolRepository.findByUserId(req.user.userId);
        const student = await this.studentRepository.findById(registration.studentId);
        
        if (!school || !student || school.id !== student.schoolId) {
          res.status(403).json({ message: 'You can only cancel registrations for students in your school' });
          return;
        }
      } else {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }
      
      // Check if competition has already started
      const competition = await this.competitionRepository.findById(registration.competitionId);
      if (competition && new Date() > competition.startDate) {
        res.status(400).json({ message: 'Cannot cancel registration after competition has started' });
        return;
      }
      
      // Update registration status
      const updated = await this.registrationRepository.update(
        registrationId, 
        { status: RegistrationStatus.CANCELLED }
      );
      
      if (updated) {
        res.json({ message: 'Registration cancelled successfully' });
      } else {
        res.status(400).json({ message: 'Failed to cancel registration' });
      }
    } catch (error) {
      next(error);
    }
  };
} 