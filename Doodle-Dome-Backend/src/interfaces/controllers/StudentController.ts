import { Request, Response, NextFunction } from 'express';
import { IStudentRepository } from '../../core/domain/repositories/IStudentRepository';
import { ISchoolRepository } from '../../core/domain/repositories/ISchoolRepository';
import { Student } from '../../core/domain/entities/Student';
import { AuthRequest } from '../middlewares/auth-middleware';
import { UserType } from '../../core/domain/entities/User';
import bcrypt from 'bcrypt';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { getConnection } from '../../infrastructure/database/database-connection';
import { User } from '../../core/domain/entities/User';

export class StudentController {
  constructor(
    private studentRepository: IStudentRepository,
    private schoolRepository: ISchoolRepository
  ) {}

  // Get all students
  getAllStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const students = await this.studentRepository.findAll();
      res.json(students);
    } catch (error) {
      next(error);
    }
  };

  // Get students by school ID
  getStudentsBySchool = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      
      // If school user, ensure they're only viewing their own students
      if (req.user?.userType === UserType.SCHOOL) {
        const school = await this.schoolRepository.findByUserId(req.user.userId);
        if (!school || school.id !== schoolId) {
          res.status(403).json({ message: 'Not authorized to view these students' });
          return;
        }
      }
      
      const students = await this.studentRepository.findBySchoolId(schoolId);
      res.json(students);
    } catch (error) {
      next(error);
    }
  };

  // Get student by ID
  getStudentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = parseInt(req.params.id);
      const student = await this.studentRepository.findById(studentId);
      
      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }
      
      res.json(student);
    } catch (error) {
      next(error);
    }
  };

  // Update student (admin or related school only)
  updateStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = parseInt(req.params.id);
      const { grade, age } = req.body;
      
      const student = await this.studentRepository.findById(studentId);
      
      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }
      
      // Allow only if admin or school that owns the student
      if (req.user?.userType !== UserType.ADMIN && req.user?.userType === UserType.SCHOOL) {
        const school = await this.schoolRepository.findByUserId(req.user.userId);
        if (!school || school.id !== student.schoolId) {
          res.status(403).json({ message: 'Not authorized to update this student' });
          return;
        }
      }
      
      // Prepare update data
      const updateData: Partial<Student> = {};
      
      if (grade) updateData.grade = grade;
      if (age) updateData.age = parseInt(age);
      
      const updated = await this.studentRepository.update(studentId, updateData);
      
      if (updated) {
        res.json({ message: 'Student updated successfully' });
      } else {
        res.status(400).json({ message: 'Failed to update student' });
      }
    } catch (error) {
      next(error);
    }
  };

  // Delete student (admin or related school only)
  deleteStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = parseInt(req.params.id);
      
      const student = await this.studentRepository.findById(studentId);
      
      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }
      
      // Allow only if admin or school that owns the student
      if (req.user?.userType !== UserType.ADMIN && req.user?.userType === UserType.SCHOOL) {
        const school = await this.schoolRepository.findByUserId(req.user.userId);
        if (!school || school.id !== student.schoolId) {
          res.status(403).json({ message: 'Not authorized to delete this student' });
          return;
        }
      }
      
      const deleted = await this.studentRepository.delete(studentId);
      
      if (deleted) {
        res.json({ message: 'Student deleted successfully' });
      } else {
        res.status(404).json({ message: 'Student not found' });
      }
    } catch (error) {
      next(error);
    }
  };

  createStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const { email, password, name, grade, age } = req.body;
      let { schoolId } = req.body;
      
      // If school user is creating a student, force using their own school ID
      if (authReq.user?.userType === UserType.SCHOOL) {
        const school = await this.schoolRepository.findByUserId(authReq.user.userId);
        if (!school) {
          res.status(404).json({ error: 'School profile not found' });
          return;
        }
        schoolId = school.id;
      } else {
        // For admin creating a student, validate the provided school ID
        const school = await this.schoolRepository.findById(schoolId);
        if (!school) {
          res.status(404).json({ error: `School with ID ${schoolId} not found` });
          return;
        }
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const user = new User(email, hashedPassword, name, UserType.STUDENT);
      const userRepository = new UserRepository(getConnection());
      const createdUser = await userRepository.create(user);
      
      // Create student
      const student = new Student(createdUser.id!, schoolId, grade, age);
      const createdStudent = await this.studentRepository.create(student);
      
      res.status(201).json({
        message: 'Student created successfully',
        userId: createdUser.id,
        studentId: createdStudent.id
      });
    } catch (error) {
      next(error);
    }
  };
} 