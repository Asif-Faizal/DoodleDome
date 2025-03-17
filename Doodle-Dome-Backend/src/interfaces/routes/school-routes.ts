import { Router } from 'express';
import { SchoolController } from '../controllers/SchoolController';
import { authenticate, authorizeAdmin } from '../middlewares/auth-middleware';
import { SchoolRepository } from '../../infrastructure/repositories/SchoolRepository';
import { getConnection } from 'typeorm';

const router = Router();

// Initialize repository
const connection = getConnection();
const schoolRepository = new SchoolRepository(connection);

// Create controller instance
const schoolController = new SchoolController(schoolRepository);

// Get all schools
router.get('/', authenticate, schoolController.getAllSchools);

// Get school by ID
router.get('/:id', authenticate, schoolController.getSchoolById);

// Update school
router.put('/:id', authenticate, schoolController.updateSchool);

// Delete school (admin only)
router.delete('/:id', authenticate, authorizeAdmin, schoolController.deleteSchool);

export const schoolRoutes = router; 