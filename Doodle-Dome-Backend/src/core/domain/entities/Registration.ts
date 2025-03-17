export class Registration {
  id?: number;
  studentId: number;
  competitionId: number;
  registrationDate: Date;
  status: RegistrationStatus;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    studentId: number,
    competitionId: number,
    registrationDate: Date,
    status: RegistrationStatus = RegistrationStatus.PENDING,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.studentId = studentId;
    this.competitionId = competitionId;
    this.registrationDate = registrationDate;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
} 