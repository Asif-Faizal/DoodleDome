export enum UserType {
  ADMIN = 'admin',
  SCHOOL = 'school',
  STUDENT = 'student'
}

export class User {
  id?: number;
  email: string;
  password: string;
  name: string;
  userType: UserType;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    email: string,
    password: string,
    name: string,
    userType: UserType,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.userType = userType;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
} 