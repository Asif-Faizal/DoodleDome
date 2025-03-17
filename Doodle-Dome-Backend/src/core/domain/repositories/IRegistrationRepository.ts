import { Registration } from '../entities/Registration';

export interface IRegistrationRepository {
  findById(id: number): Promise<Registration | null>;
  findByStudentId(studentId: number): Promise<Registration[]>;
  findByCompetitionId(competitionId: number): Promise<Registration[]>;
  findByStudentAndCompetition(studentId: number, competitionId: number): Promise<Registration | null>;
  create(registration: Registration): Promise<Registration>;
  update(id: number, registration: Partial<Registration>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
} 