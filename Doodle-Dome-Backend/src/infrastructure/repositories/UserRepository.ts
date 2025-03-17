import { Connection, Repository } from 'typeorm';
import { User, UserType } from '../../core/domain/entities/User';
import { IUserRepository } from '../../core/domain/repositories/IUserRepository';
import { UserEntity } from '../entities/User.entity';
import bcrypt from 'bcrypt';

export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor(connection: Connection) {
    this.repository = connection.getRepository(UserEntity);
  }

  async findById(id: number): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { id } });
    if (!userEntity) return null;
    
    return this.mapToUser(userEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { email } });
    if (!userEntity) return null;
    
    return this.mapToUser(userEntity);
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.repository.find();
    return userEntities.map(entity => this.mapToUser(entity));
  }

  async create(user: User): Promise<User> {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const userEntity = this.repository.create({
      email: user.email,
      password: hashedPassword,
      name: user.name,
      userType: user.userType
    });
    
    const savedEntity = await this.repository.save(userEntity);
    return this.mapToUser(savedEntity);
  }

  async update(id: number, userData: Partial<User>): Promise<boolean> {
    // If password is being updated, hash it first
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const result = await this.repository.update(id, userData);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async createAdminIfNotExists(): Promise<void> {
    try {
      // Check if admin already exists
      const adminExists = await this.repository.findOne({ 
        where: { userType: UserType.ADMIN }
      });

      if (!adminExists) {
        // Create default admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = this.repository.create({
          email: 'admin@example.com',
          password: adminPassword,
          name: 'Admin User',
          userType: UserType.ADMIN
        });
        
        try {
          await this.repository.save(admin);
          console.log('Default admin user created');
        } catch (error: any) {
          // If error is due to duplicate email, it means admin exists but with a different userType
          if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage?.includes('admin@example.com')) {
            console.log('Admin user already exists with this email');
            
            // Try to update the existing user to have admin rights if needed
            const existingUser = await this.repository.findOne({ where: { email: 'admin@example.com' } });
            if (existingUser && existingUser.userType !== UserType.ADMIN) {
              existingUser.userType = UserType.ADMIN;
              await this.repository.save(existingUser);
              console.log('Existing user updated to admin role');
            }
          } else {
            // For other errors, re-throw
            throw error;
          }
        }
      } else {
        console.log('Admin user already exists');
      }
    } catch (error) {
      console.error('Error checking/creating admin user:', error);
      // Don't throw here to prevent app startup failure
    }
  }

  private mapToUser(entity: UserEntity): User {
    return new User(
      entity.email,
      entity.password,
      entity.name,
      entity.userType,
      entity.id,
      entity.createdAt,
      entity.updatedAt
    );
  }
} 