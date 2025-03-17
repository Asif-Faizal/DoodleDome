import { createConnection, Connection } from 'typeorm';
import { config } from '../config/env';
import { UserEntity } from '../entities/User.entity';
import { SchoolEntity } from '../entities/School.entity';
import { StudentEntity } from '../entities/Student.entity';
import { CompetitionEntity } from '../entities/Competition.entity';
import { RegistrationEntity } from '../entities/Registration.entity';

export async function connectToDatabase(): Promise<Connection> {
  try {
    const connection = await createConnection({
      type: 'mysql',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.name,
      entities: [
        UserEntity, 
        SchoolEntity, 
        StudentEntity, 
        CompetitionEntity, 
        RegistrationEntity
      ],
      synchronize: true, // Set to false in production
      logging: true,
    });
    
    console.log('Database connection established successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
} 