import { User } from '../entities/User';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailRaw(email: string): Promise<any>;
  findAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(id: number, user: Partial<User>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  createAdminIfNotExists(): Promise<void>;
} 