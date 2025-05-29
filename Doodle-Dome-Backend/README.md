# Doodle Dome Backend

A Node.js/TypeScript backend API for managing art competitions, schools, students, and registrations.

## Overview

Doodle Dome is a competition management system that allows:

- **Admins** to manage competitions, schools, and users
- **Schools** to manage their students and register them for competitions
- **Students** to view competitions and manage their own registrations

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** for API framework
- **MySQL** with **TypeORM** for database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Helmet** for security
- **CORS** for cross-origin requests

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (create `.env` file):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=doodle_dome
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. Run the application:

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Authorization

All endpoints except `/api/users/login` require authentication via JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### User Types

- **ADMIN**: Full access to all resources
- **SCHOOL**: Can manage their own students and registrations
- **STUDENT**: Can view competitions and manage own registrations

## API Endpoints

### Authentication

#### POST `/api/users/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "userType": "ADMIN"
  }
}
```

---

### User Management

#### POST `/api/users/schools` 🔒 Admin Only

Create a new school user account.

**Request Body:**

```json
{
  "email": "school@example.com",
  "password": "password123",
  "name": "School Admin Name",
  "schoolName": "Example School",
  "address": "123 School St",
  "phone": "+1234567890"
}
```

#### POST `/api/users/students` 🔒 Authenticated

Create a new student user account.

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "Student Name",
  "schoolId": 1,
  "grade": "5th Grade",
  "age": 11
}
```

#### GET `/api/users` 🔒 Admin Only

Get all users in the system.

**Response:**

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "userType": "ADMIN",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### PUT `/api/users/:id` 🔒 Admin or Self

Update user information.

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

#### DELETE `/api/users/:id` 🔒 Admin Only

Delete a user account.

---

### School Management

#### GET `/api/schools` 🔒 Authenticated

Get all schools.

#### GET `/api/schools/:id` 🔒 Authenticated

Get school by ID.

#### PUT `/api/schools/:id` 🔒 Authenticated

Update school information.

**Request Body:**

```json
{
  "name": "Updated School Name",
  "address": "New Address",
  "phone": "+1234567890"
}
```

#### DELETE `/api/schools/:id` 🔒 Admin Only

Delete a school.

---

### Student Management

#### GET `/api/students` 🔒 Admin Only

Get all students in the system.

#### GET `/api/students/school/:schoolId` 🔒 School Access

Get all students from a specific school.

#### GET `/api/students/:id` 🔒 School Access

Get student by ID.

#### POST `/api/students` 🔒 School Access

Create a new student (school can create students directly).

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "Student Name",
  "schoolId": 1,
  "grade": "5th Grade",
  "age": 11
}
```

#### PUT `/api/students/:id` 🔒 School Access

Update student information.

**Request Body:**

```json
{
  "name": "Updated Student Name",
  "grade": "6th Grade",
  "age": 12
}
```

#### DELETE `/api/students/:id` 🔒 School Access

Delete a student.

---

### Competition Management

#### GET `/api/competitions` 🔒 Authenticated

Get all competitions.

#### GET `/api/competitions/upcoming` 🔒 Authenticated

Get competitions with open registration.

#### GET `/api/competitions/:id` 🔒 Authenticated

Get competition by ID.

#### POST `/api/competitions` 🔒 Admin Only

Create a new competition.

**Request Body:**

```json
{
  "name": "Spring Art Competition",
  "description": "Annual spring art competition for all ages",
  "startDate": "2024-05-01T10:00:00.000Z",
  "lastRegistrationDate": "2024-04-15T23:59:59.000Z"
}
```

#### PUT `/api/competitions/:id` 🔒 Admin Only

Update competition information.

**Request Body:**

```json
{
  "name": "Updated Competition Name",
  "description": "Updated description",
  "startDate": "2024-05-01T10:00:00.000Z",
  "lastRegistrationDate": "2024-04-15T23:59:59.000Z"
}
```

#### DELETE `/api/competitions/:id` 🔒 Admin Only

Delete a competition.

---

### Registration Management

#### GET `/api/competitions/:competitionId/registrations` 🔒 Admin Only

Get all registrations for a specific competition.

#### GET `/api/students/:studentId/registrations` 🔒 Authorized Access

Get all registrations for a specific student.

- **Students** can only view their own registrations
- **Schools** can view registrations for their students
- **Admins** can view all registrations

#### POST `/api/registrations` 🔒 Authenticated

Register a student for a competition.

**Request Body:**

```json
{
  "studentId": 1,
  "competitionId": 1
}
```

**Access Rules:**

- **Students** can only register themselves
- **Schools** can register their students
- **Admins** can register any student

#### PUT `/api/registrations/:id/cancel` 🔒 Authorized Access

Cancel a registration.

**Access Rules:**

- **Students** can only cancel their own registrations
- **Schools** can cancel registrations for their students
- **Admins** can cancel any registration

#### GET `/api/competitions/:competitionId/enrollments` 🔒 Admin Only

Get detailed enrollment information for a competition (admin view).

#### GET `/api/competitions/:competitionId/school-enrollments` 🔒 Authenticated

Get enrollment information filtered by school access.

---

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

Error response format:

```json
{
  "message": "Error description"
}
```

## Authorization Matrix

| Endpoint | Admin | School | Student |
|----------|-------|--------|---------|
| Login | ✅ | ✅ | ✅ |
| Create School | ✅ | ❌ | ❌ |
| Create Student | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| View Schools | ✅ | ✅ | ✅ |
| Manage Schools | ✅ | Own Only | ❌ |
| View Students | ✅ | Own School | ❌ |
| Manage Students | ✅ | Own School | ❌ |
| View Competitions | ✅ | ✅ | ✅ |
| Manage Competitions | ✅ | ❌ | ❌ |
| View Registrations | ✅ | Own Students | Own Only |
| Manage Registrations | ✅ | Own Students | Own Only |

## Development

- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Development Server**: `npm run dev`

## Database

The application uses TypeORM with MySQL. Entities include:

- **User** - Base user accounts
- **School** - School profiles
- **Student** - Student profiles
- **Competition** - Art competitions
- **Registration** - Student competition registrations

Default admin user is created automatically on first startup.
