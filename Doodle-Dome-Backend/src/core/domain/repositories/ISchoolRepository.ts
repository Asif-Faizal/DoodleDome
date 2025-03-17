import { School } from '../entities/School';

export interface ISchoolRepository {
  findById(id: number): Promise<School | null>;
  findByUserId(userId: number): Promise<School | null>;
  findAll(): Promise<School[]>;
  create(school: School): Promise<School>;
  update(id: number, school: Partial<School>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
} 