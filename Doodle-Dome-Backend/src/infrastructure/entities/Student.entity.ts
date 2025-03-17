import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from './User.entity';
import { SchoolEntity } from './School.entity';

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column()
  schoolId!: number;

  @ManyToOne(() => SchoolEntity)
  @JoinColumn({ name: 'schoolId' })
  school!: SchoolEntity;

  @Column({ nullable: true })
  grade!: string;

  @Column({ nullable: true })
  age!: number;
} 