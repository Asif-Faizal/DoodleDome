import { Connection, Repository } from 'typeorm';
import { Registration, RegistrationStatus } from '../../core/domain/entities/Registration';
import { IRegistrationRepository } from '../../core/domain/repositories/IRegistrationRepository';
import { RegistrationEntity } from '../entities/Registration.entity';

export class RegistrationRepository implements IRegistrationRepository {
  private repository: Repository<RegistrationEntity>;

  constructor(connection: Connection) {
    this.repository = connection.getRepository(RegistrationEntity);
  }

  async findById(id: number): Promise<Registration | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    
    return this.mapToRegistration(entity);
  }

  async findByStudentId(studentId: number): Promise<Registration[]> {
    const entities = await this.repository.find({ 
      where: { studentId },
      relations: ['competition'] 
    });
    return entities.map(entity => this.mapToRegistration(entity));
  }

  async findByCompetitionId(competitionId: number): Promise<Registration[]> {
    const entities = await this.repository.find({ 
      where: { competitionId },
      relations: ['student', 'student.user'] 
    });
    return entities.map(entity => this.mapToRegistration(entity));
  }
  
  async findByStudentAndCompetition(studentId: number, competitionId: number): Promise<Registration | null> {
    const entity = await this.repository.findOne({ 
      where: { studentId, competitionId } 
    });
    if (!entity) return null;
    
    return this.mapToRegistration(entity);
  }

  async create(registration: Registration): Promise<Registration> {
    const entity = this.repository.create({
      studentId: registration.studentId,
      competitionId: registration.competitionId,
      registrationDate: registration.registrationDate,
      status: registration.status
    });
    
    const savedEntity = await this.repository.save(entity);
    return this.mapToRegistration(savedEntity);
  }

  async update(id: number, registration: Partial<Registration>): Promise<boolean> {
    const result = await this.repository.update(id, registration);
    return result.affected !== undefined && result.affected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  private mapToRegistration(entity: RegistrationEntity): Registration {
    return new Registration(
      entity.studentId,
      entity.competitionId,
      entity.registrationDate,
      entity.status,
      entity.id,
      entity.createdAt,
      entity.updatedAt
    );
  }
} 