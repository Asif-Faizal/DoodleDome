import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectToDatabase } from './infrastructure/config/database';
import { config } from './infrastructure/config/env';
import { errorHandler } from './interfaces/middlewares/error-handler';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { SchoolRepository } from './infrastructure/repositories/SchoolRepository';
import { StudentRepository } from './infrastructure/repositories/StudentRepository';
import { TokenService } from './infrastructure/security/token-service';
import { UserController } from './interfaces/controllers/UserController';
import { SchoolController } from './interfaces/controllers/SchoolController';
import { StudentController } from './interfaces/controllers/StudentController';
import { authenticate, authorizeAdmin } from './interfaces/middlewares/auth-middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to database before starting the server
(async () => {
  try {
    const connection = await connectToDatabase();
    
    // Initialize repositories
    const userRepository = new UserRepository(connection);
    const schoolRepository = new SchoolRepository(connection);
    const studentRepository = new StudentRepository(connection);
    
    // Initialize services
    const tokenService = new TokenService();
    
    // Initialize controllers
    const userController = new UserController(
      userRepository, 
      schoolRepository, 
      studentRepository, 
      tokenService
    );
    
    const schoolController = new SchoolController(schoolRepository);
    
    const studentController = new StudentController(
      studentRepository,
      schoolRepository
    );
    
    // Create default admin user if it doesn't exist
    await userRepository.createAdminIfNotExists();
    
    // Set up routes
    
    // User routes
    app.post('/api/users/login', userController.login);
    app.post('/api/users/schools', authenticate, authorizeAdmin, userController.createSchool);
    app.post('/api/users/students', authenticate, userController.createStudent);
    app.get('/api/users', authenticate, authorizeAdmin, userController.getAllUsers);
    app.put('/api/users/:id', authenticate, userController.updateUser);
    app.delete('/api/users/:id', authenticate, authorizeAdmin, userController.deleteUser);
    
    // School routes
    app.get('/api/schools', authenticate, schoolController.getAllSchools);
    app.get('/api/schools/:id', authenticate, schoolController.getSchoolById);
    app.put('/api/schools/:id', authenticate, schoolController.updateSchool);
    app.delete('/api/schools/:id', authenticate, authorizeAdmin, schoolController.deleteSchool);
    
    // Student routes
    app.get('/api/students', authenticate, authorizeAdmin, studentController.getAllStudents);
    app.get('/api/students/school/:schoolId', authenticate, studentController.getStudentsBySchool);
    app.get('/api/students/:id', authenticate, studentController.getStudentById);
    app.put('/api/students/:id', authenticate, studentController.updateStudent);
    app.delete('/api/students/:id', authenticate, studentController.deleteStudent);
    
    // Global error handler
    app.use(errorHandler);
    
    // Start server
    app.listen(config.server.port, () => {
      console.log(`Server running on port ${config.server.port}`);
    });
    
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
})(); 