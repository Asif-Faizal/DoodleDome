import { Student } from '../entities/Student';

export interface IStudentRepository {
  findById(id: number): Promise<Student | null>;
  findByUserId(userId: number): Promise<Student | null>;
  findBySchoolId(schoolId: number): Promise<Student[]>;
  findAll(): Promise<Student[]>;
  create(student: Student): Promise<Student>;
  update(id: number, student: Partial<Student>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
} 