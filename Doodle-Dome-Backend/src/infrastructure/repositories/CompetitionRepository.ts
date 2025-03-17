import { Connection, MoreThanOrEqual, Repository } from 'typeorm';
import { Competition } from '../../core/domain/entities/Competition';
import { ICompetitionRepository } from '../../core/domain/repositories/ICompetitionRepository';
import { CompetitionEntity } from '../entities/Competition.entity';

export class CompetitionRepository implements ICompetitionRepository {
  private repository: Repository<CompetitionEntity>;

  constructor(connection: Connection) {
    this.repository = connection.getRepository(CompetitionEntity);
  }

  async findById(id: number): Promise<Competition | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    
    return this.mapToCompetition(entity);
  }

  async findAll(): Promise<Competition[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.mapToCompetition(entity));
  }
  
  async findUpcoming(): Promise<Competition[]> {
    const entities = await this.repository.find({
      where: {
        lastRegistrationDate: MoreThanOrEqual(new Date())
      },
      order: {
        startDate: 'ASC'
      }
    });
    return entities.map(entity => this.mapToCompetition(entity));
  }

  async create(competition: Competition): Promise<Competition> {
    const entity = this.repository.create({
      name: competition.name,
      description: competition.description,
      startDate: competition.startDate,
      lastRegistrationDate: competition.lastRegistrationDate
    });
    
    const savedEntity = await this.repository.save(entity);
    return this.mapToCompetition(savedEntity);
  }

  async update(id: number, competition: Partial<Competition>): Promise<boolean> {
    const result = await this.repository.update(id, competition);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  private mapToCompetition(entity: CompetitionEntity): Competition {
    return new Competition(
      entity.name,
      entity.description,
      entity.startDate,
      entity.lastRegistrationDate,
      entity.id,
      entity.createdAt,
      entity.updatedAt
    );
  }
} 