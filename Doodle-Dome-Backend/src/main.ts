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
import { authenticate, authorizeAdmin, authorizeSchool } from './interfaces/middlewares/auth-middleware';
import { CompetitionRepository } from './infrastructure/repositories/CompetitionRepository';
import { RegistrationRepository } from './infrastructure/repositories/RegistrationRepository';
import { CompetitionController } from './interfaces/controllers/CompetitionController';
import { RegistrationController } from './interfaces/controllers/RegistrationController';

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
    const competitionRepository = new CompetitionRepository(connection);
    const registrationRepository = new RegistrationRepository(connection);
    
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
    
    const competitionController = new CompetitionController(
      competitionRepository
    );
    
    const registrationController = new RegistrationController(
      registrationRepository,
      competitionRepository,
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
    app.get('/api/students/school/:schoolId', authenticate, authorizeSchool, studentController.getStudentsBySchool);
    app.get('/api/students/:id', authenticate, authorizeSchool, studentController.getStudentById);
    app.put('/api/students/:id', authenticate, authorizeSchool, studentController.updateStudent);
    app.delete('/api/students/:id', authenticate, authorizeSchool, studentController.deleteStudent);
    
    // Let schools create students directly
    app.post('/api/students', authenticate, authorizeSchool, studentController.createStudent);
    
    // Competition routes
    app.get('/api/competitions', authenticate, competitionController.getAllCompetitions);
    app.get('/api/competitions/upcoming', authenticate, competitionController.getUpcomingCompetitions);
    app.get('/api/competitions/:id', authenticate, competitionController.getCompetitionById);
    app.post('/api/competitions', authenticate, authorizeAdmin, competitionController.createCompetition);
    app.put('/api/competitions/:id', authenticate, authorizeAdmin, competitionController.updateCompetition);
    app.delete('/api/competitions/:id', authenticate, authorizeAdmin, competitionController.deleteCompetition);
    
    // Registration routes
    app.get('/api/competitions/:competitionId/registrations', authenticate, registrationController.getRegistrationsByCompetition);
    app.get('/api/students/:studentId/registrations', authenticate, registrationController.getStudentRegistrations);
    app.post('/api/registrations', authenticate, registrationController.registerStudent);
    app.put('/api/registrations/:id/cancel', authenticate, registrationController.cancelRegistration);
    
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