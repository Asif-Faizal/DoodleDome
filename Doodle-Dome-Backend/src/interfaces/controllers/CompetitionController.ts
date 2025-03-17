import { Request, Response, NextFunction } from 'express';
import { ICompetitionRepository } from '../../core/domain/repositories/ICompetitionRepository';
import { Competition } from '../../core/domain/entities/Competition';
import { AuthRequest } from '../middlewares/auth-middleware';
import { UserType } from '../../core/domain/entities/User';

export class CompetitionController {
  constructor(
    private competitionRepository: ICompetitionRepository
  ) {}

  // Get all competitions
  getAllCompetitions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const competitions = await this.competitionRepository.findAll();
      res.json(competitions);
    } catch (error) {
      next(error);
    }
  };

  // Get competition by ID
  getCompetitionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const competition = await this.competitionRepository.findById(id);
      
      if (!competition) {
        res.status(404).json({ message: 'Competition not found' });
        return;
      }
      
      res.json(competition);
    } catch (error) {
      next(error);
    }
  };

  // Get upcoming competitions (registration still open)
  getUpcomingCompetitions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const competitions = await this.competitionRepository.findUpcoming();
      res.json(competitions);
    } catch (error) {
      next(error);
    }
  };

  // Create new competition (admin only)
  createCompetition = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admin can create competitions
      if (req.user?.userType !== UserType.ADMIN) {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }
      
      const { name, description, startDate, lastRegistrationDate } = req.body;
      
      // Validate dates
      const startDateObj = new Date(startDate);
      const lastRegDateObj = new Date(lastRegistrationDate);
      
      if (isNaN(startDateObj.getTime()) || isNaN(lastRegDateObj.getTime())) {
        res.status(400).json({ message: 'Invalid date format' });
        return;
      }
      
      if (lastRegDateObj > startDateObj) {
        res.status(400).json({ message: 'Last registration date must be before start date' });
        return;
      }
      
      const competition = new Competition(
        name, 
        description, 
        startDateObj, 
        lastRegDateObj
      );
      
      const createdCompetition = await this.competitionRepository.create(competition);
      
      res.status(201).json({
        message: 'Competition created successfully',
        competitionId: createdCompetition.id
      });
    } catch (error) {
      next(error);
    }
  };

  // Update competition (admin only)
  updateCompetition = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admin can update competitions
      if (req.user?.userType !== UserType.ADMIN) {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }
      
      const id = parseInt(req.params.id);
      const { name, description, startDate, lastRegistrationDate } = req.body;
      
      const competition = await this.competitionRepository.findById(id);
      
      if (!competition) {
        res.status(404).json({ message: 'Competition not found' });
        return;
      }
      
      // Prepare update data
      const updateData: Partial<Competition> = {};
      
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      
      if (startDate) {
        const startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) {
          res.status(400).json({ message: 'Invalid start date format' });
          return;
        }
        updateData.startDate = startDateObj;
      }
      
      if (lastRegistrationDate) {
        const lastRegDateObj = new Date(lastRegistrationDate);
        if (isNaN(lastRegDateObj.getTime())) {
          res.status(400).json({ message: 'Invalid last registration date format' });
          return;
        }
        updateData.lastRegistrationDate = lastRegDateObj;
      }
      
      // Validate dates
      if (updateData.startDate && updateData.lastRegistrationDate) {
        if (updateData.lastRegistrationDate > updateData.startDate) {
          res.status(400).json({ message: 'Last registration date must be before start date' });
          return;
        }
      } else if (updateData.startDate && competition.lastRegistrationDate) {
        if (competition.lastRegistrationDate > updateData.startDate) {
          res.status(400).json({ message: 'Last registration date must be before start date' });
          return;
        }
      } else if (updateData.lastRegistrationDate && competition.startDate) {
        if (updateData.lastRegistrationDate > competition.startDate) {
          res.status(400).json({ message: 'Last registration date must be before start date' });
          return;
        }
      }
      
      const updated = await this.competitionRepository.update(id, updateData);
      
      if (updated) {
        res.json({ message: 'Competition updated successfully' });
      } else {
        res.status(400).json({ message: 'Failed to update competition' });
      }
    } catch (error) {
      next(error);
    }
  };

  // Delete competition (admin only)
  deleteCompetition = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admin can delete competitions
      if (req.user?.userType !== UserType.ADMIN) {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }
      
      const id = parseInt(req.params.id);
      
      const competition = await this.competitionRepository.findById(id);
      
      if (!competition) {
        res.status(404).json({ message: 'Competition not found' });
        return;
      }
      
      const deleted = await this.competitionRepository.delete(id);
      
      if (deleted) {
        res.json({ message: 'Competition deleted successfully' });
      } else {
        res.status(400).json({ message: 'Failed to delete competition' });
      }
    } catch (error) {
      next(error);
    }
  };
} 