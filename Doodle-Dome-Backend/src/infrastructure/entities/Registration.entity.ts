import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StudentEntity } from './Student.entity';
import { CompetitionEntity } from './Competition.entity';
import { RegistrationStatus } from '../../core/domain/entities/Registration';

@Entity('registrations')
export class RegistrationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  studentId!: number;

  @ManyToOne(() => StudentEntity)
  @JoinColumn({ name: 'studentId' })
  student!: StudentEntity;

  @Column()
  competitionId!: number;

  @ManyToOne(() => CompetitionEntity)
  @JoinColumn({ name: 'competitionId' })
  competition!: CompetitionEntity;

  @Column()
  registrationDate!: Date;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING
  })
  status!: RegistrationStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 