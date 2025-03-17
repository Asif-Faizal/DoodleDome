import { Router } from 'express';
import { StudentController } from '../controllers/StudentController';
import { authenticate, authorizeAdmin } from '../middlewares/auth-middleware';
import { StudentRepository } from '../../infrastructure/repositories/StudentRepository';
import { SchoolRepository } from '../../infrastructure/repositories/SchoolRepository';
import { getConnection } from 'typeorm';

const router = Router();

// Initialize repositories
const connection = getConnection();
const studentRepository = new StudentRepository(connection);
const schoolRepository = new SchoolRepository(connection);

// Create controller instance
const studentController = new StudentController(
  studentRepository,
  schoolRepository
);

// Get all students (admin only)
router.get('/', authenticate, authorizeAdmin, studentController.getAllStudents);

// Get students by school ID
router.get('/school/:schoolId', authenticate, studentController.getStudentsBySchool);

// Get student by ID
router.get('/:id', authenticate, studentController.getStudentById);

// Update student
router.put('/:id', authenticate, studentController.updateStudent);

// Delete student
router.delete('/:id', authenticate, studentController.deleteStudent);

export const studentRoutes = router; 