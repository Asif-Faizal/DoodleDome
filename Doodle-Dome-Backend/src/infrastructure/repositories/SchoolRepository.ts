import { Connection, Repository } from 'typeorm';
import { School } from '../../core/domain/entities/School';
import { ISchoolRepository } from '../../core/domain/repositories/ISchoolRepository';
import { SchoolEntity } from '../entities/School.entity';

export class SchoolRepository implements ISchoolRepository {
  private repository: Repository<SchoolEntity>;

  constructor(connection: Connection) {
    this.repository = connection.getRepository(SchoolEntity);
  }

  async findById(id: number): Promise<School | null> {
    const schoolEntity = await this.repository.findOne({ where: { id } });
    if (!schoolEntity) return null;
    
    return this.mapToSchool(schoolEntity);
  }

  async findByUserId(userId: number): Promise<School | null> {
    const schoolEntity = await this.repository.findOne({ where: { userId } });
    if (!schoolEntity) return null;
    
    return this.mapToSchool(schoolEntity);
  }

  async findAll(): Promise<School[]> {
    const schoolEntities = await this.repository.find();
    return schoolEntities.map(entity => this.mapToSchool(entity));
  }

  async create(school: School): Promise<School> {
    const schoolEntity = this.repository.create({
      userId: school.userId,
      schoolName: school.schoolName,
      address: school.address,
      phone: school.phone
    });
    
    const savedEntity = await this.repository.save(schoolEntity);
    return this.mapToSchool(savedEntity);
  }

  async update(id: number, schoolData: Partial<School>): Promise<boolean> {
    const result = await this.repository.update(id, schoolData);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  private mapToSchool(entity: SchoolEntity): School {
    return new School(
      entity.userId,
      entity.schoolName,
      entity.address,
      entity.phone,
      entity.id
    );
  }
} 