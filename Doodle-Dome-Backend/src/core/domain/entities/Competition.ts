export class Competition {
  id?: number;
  name: string;
  description: string;
  startDate: Date;
  lastRegistrationDate: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    name: string,
    description: string,
    startDate: Date,
    lastRegistrationDate: Date,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.lastRegistrationDate = lastRegistrationDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
} 