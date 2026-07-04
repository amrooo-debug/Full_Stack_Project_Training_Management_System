# Training Management System

## Project Overview

This project is a backend system for managing training courses, users, lessons, tasks, submissions, feedback, and enrollments.

The project was built using **Kotlin**, **Spring Boot**, **PostgreSQL**, **Spring Security**, and **JWT Authentication**.

The system supports three user roles:

- `ADMIN`
- `TRAINER`
- `TRAINEE`

Each role has different permissions inside the system.

---

## Technologies Used

- Kotlin
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- PostgreSQL
- Gradle Kotlin
- Java 21
- Postman
- pgAdmin
- Git and GitHub
- IntelliJ IDEA

---

## Project Structure

The backend is organized using a clean layered structure:

```text
controller
service
repository
dto
entity
enums
config
```

- `controller`: receives API requests
- `service`: contains business logic
- `repository`: connects to the database
- `dto`: controls request and response data
- `entity`: represents database tables
- `enums`: contains user roles
- `config`: contains security and JWT setup

---

## Database

Database name:

```text
training_db
```

PostgreSQL port:

```text
5000
```

Tables created:

- `users`
- `courses`
- `lessons`
- `enrollments`
- `tasks`
- `submissions`
- `feedback`

---

## Environment Variables

The project uses environment variables to keep sensitive data safe.

Required variables:

```text
DB_PASSWORD
JWT_SECRET
```

Example:

```text
DB_PASSWORD=your_database_password;JWT_SECRET=your_jwt_secret_key
```

In `application.properties`, secrets are used like this:

```properties
spring.datasource.password=${DB_PASSWORD}
app.jwt.secret=${JWT_SECRET}
```

No real database password or JWT secret is stored in the code.

---

## Features Completed

### Courses

- Create course
- Get courses
- Get course by ID
- Update course
- Delete course

### Lessons

- Create lesson under a course
- Get lessons by course
- Get lesson by ID
- Update lesson
- Delete lesson

### Users

- Create user
- Get users
- Get user by ID
- Update user
- Delete user
- Support roles: `ADMIN`, `TRAINER`, `TRAINEE`

### Enrollments

- Enroll user in course
- Get enrollments
- Get enrollments by user
- Get enrollments by course
- Delete enrollment
- Prevent duplicate enrollment

### Tasks

- Create task under a course
- Get tasks by course
- Get task by ID
- Update task
- Delete task

### Submissions

- Trainee submits work for a task
- Get submissions by task
- Get submission by ID
- Get submissions by user
- Update submission
- Prevent duplicate submission

### Feedback

- Trainer gives feedback on a submission
- Get feedback by submission
- Get feedback by trainer
- Get feedback by ID
- Update feedback
- Prevent duplicate feedback

---

## Authentication and Security

The project includes authentication using **Spring Security** and **JWT**.

Completed security features:

- Password field added to users
- Passwords are hashed using BCrypt
- Login API created
- JWT token is returned after successful login
- APIs are protected using Bearer Token
- Role-based permissions are added

Login endpoint:

```text
POST /auth/login
```

Example login request:

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

Example login response:

```json
{
  "id": 1,
  "fullName": "Test Admin",
  "email": "admin@test.com",
  "role": "ADMIN",
  "token": "jwt-token-here",
  "message": "Login successful"
}
```

---

## Role-Based Permissions

### ADMIN

Admin can:

- Manage users
- Manage courses
- Manage lessons
- Manage tasks
- View submissions
- Manage feedback
- View and delete enrollments

### TRAINER

Trainer can:

- View courses
- Manage lessons
- Manage tasks
- View submissions
- Give and update feedback
- View enrollments

### TRAINEE

Trainee can:

- View courses
- View lessons
- View tasks
- Enroll in courses
- Submit work
- Update submission
- View feedback
- View own enrollments

---

## Main API Groups

```text
POST   /auth/login

/users
/courses
/courses/{courseId}/lessons
/enrollments
/courses/{courseId}/tasks
/tasks/{taskId}/submissions
/submissions/{submissionId}/feedback
```

The APIs were tested using Postman with different JWT tokens for:

- Admin
- Trainer
- Trainee

---

## How to Run the Project

1. Clone the repository:

```bash
git clone https://github.com/amrooo-debug/Full_Stack_Project_Training_Management_System.git
```

2. Open the project in IntelliJ IDEA.

3. Create a PostgreSQL database:

```text
training_db
```

4. Add environment variables in IntelliJ Run Configuration:

```text
DB_PASSWORD=your_database_password;JWT_SECRET=your_jwt_secret_key
```

5. Run:

```text
TrainingManagementSystemApplication.kt
```

The backend will run on:

```text
http://localhost:8080
```

---

## Testing

The project was tested using:

- Postman for API testing
- pgAdmin for database checking
- IntelliJ IDEA for running and debugging the backend

Common successful responses:

```text
200 OK
201 Created
204 No Content
```

Common security response:

```text
403 Forbidden
```

This means the user is logged in but does not have permission for that API.

---

## Project Status

Completed:

- Backend CRUD APIs
- Database relationships
- Authentication
- JWT login
- Role-based permissions
- PostgreSQL connection
- Postman testing
- GitHub version control

Still left:

- Export Postman collection
- Improve validation and error responses
- Build frontend website later
- Connect frontend with backend APIs

---

## GitHub Repository

```text
https://github.com/amrooo-debug/Full_Stack_Project_Training_Management_System
```