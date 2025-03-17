import { Competition } from '../entities/Competition';

export interface ICompetitionRepository {
  findById(id: number): Promise<Competition | null>;
  findAll(): Promise<Competition[]>;
  findUpcoming(): Promise<Competition[]>;
  create(competition: Competition): Promise<Competition>;
  update(id: number, competition: Partial<Competition>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
} 