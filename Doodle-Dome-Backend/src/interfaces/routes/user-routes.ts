import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorizeAdmin } from '../middlewares/auth-middleware';
import { TokenService } from '../../infrastructure/security/token-service';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { SchoolRepository } from '../../infrastructure/repositories/SchoolRepository';
import { StudentRepository } from '../../infrastructure/repositories/StudentRepository';
import { getConnection } from 'typeorm';

const router = Router();

// Initialize services and repositories
const connection = getConnection();
const userRepository = new UserRepository(connection);
const schoolRepository = new SchoolRepository(connection);
const studentRepository = new StudentRepository(connection);
const tokenService = new TokenService();

// Create controller instance
const userController = new UserController(
  userRepository,
  schoolRepository,
  studentRepository,
  tokenService
);

// Auth routes
router.post('/login', userController.login);

// Create school user (admin only)
router.post('/schools', authenticate, authorizeAdmin, userController.createSchool);

// Create student user (admin or school)
router.post('/students', authenticate, userController.createStudent);

// Get all users (admin only)
router.get('/', authenticate, authorizeAdmin, userController.getAllUsers);

// Update user
router.put('/:id', authenticate, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authenticate, authorizeAdmin, userController.deleteUser);

// Create default admin if not exists (this could be called during app startup)
userRepository.createAdminIfNotExists();

export const userRoutes = router; 