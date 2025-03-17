import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './User.entity';

@Entity('schools')
export class SchoolEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column()
  schoolName!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  phone!: string;
} 