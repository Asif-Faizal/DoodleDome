export class Student {
  id?: number;
  userId: number;
  schoolId: number;
  grade?: string;
  age?: number;

  constructor(
    userId: number,
    schoolId: number,
    grade?: string,
    age?: number,
    id?: number
  ) {
    this.id = id;
    this.userId = userId;
    this.schoolId = schoolId;
    this.grade = grade;
    this.age = age;
  }
} 