export class School {
  id?: number;
  userId: number;
  schoolName: string;
  address?: string;
  phone?: string;

  constructor(
    userId: number,
    schoolName: string,
    address?: string,
    phone?: string,
    id?: number
  ) {
    this.id = id;
    this.userId = userId;
    this.schoolName = schoolName;
    this.address = address;
    this.phone = phone;
  }
} 