import { Connection, Repository } from 'typeorm';
import { Student } from '../../core/domain/entities/Student';
import { IStudentRepository } from '../../core/domain/repositories/IStudentRepository';
import { StudentEntity } from '../entities/Student.entity';

export class StudentRepository implements IStudentRepository {
  private repository: Repository<StudentEntity>;

  constructor(connection: Connection) {
    this.repository = connection.getRepository(StudentEntity);
  }

  async findById(id: number): Promise<Student | null> {
    const studentEntity = await this.repository.findOne({ where: { id } });
    if (!studentEntity) return null;
    
    return this.mapToStudent(studentEntity);
  }

  async findByUserId(userId: number): Promise<Student | null> {
    const studentEntity = await this.repository.findOne({ where: { userId } });
    if (!studentEntity) return null;
    
    return this.mapToStudent(studentEntity);
  }

  async findBySchoolId(schoolId: number): Promise<Student[]> {
    const studentEntities = await this.repository.find({ where: { schoolId } });
    return studentEntities.map(entity => this.mapToStudent(entity));
  }

  async findAll(): Promise<Student[]> {
    const studentEntities = await this.repository.find();
    return studentEntities.map(entity => this.mapToStudent(entity));
  }

  async create(student: Student): Promise<Student> {
    const studentEntity = this.repository.create({
      userId: student.userId,
      schoolId: student.schoolId,
      grade: student.grade,
      age: student.age
    });
    
    const savedEntity = await this.repository.save(studentEntity);
    return this.mapToStudent(savedEntity);
  }

  async update(id: number, studentData: Partial<Student>): Promise<boolean> {
    const result = await this.repository.update(id, studentData);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  private mapToStudent(entity: StudentEntity): Student {
    return new Student(
      entity.userId,
      entity.schoolId,
      entity.grade,
      entity.age,
      entity.id
    );
  }
} 