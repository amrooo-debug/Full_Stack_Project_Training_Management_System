# Training Management System

## Project Overview

Training Management System is a full-stack web application for managing training courses, users, lessons, tasks, submissions, feedback, and enrollments.

The goal of this project is to practice a real full-stack development workflow using:

- Kotlin and Spring Boot for the backend
- PostgreSQL for the database
- React, TypeScript, and Vite for the frontend
- JWT authentication for secure login
- Role-based access for Admin, Trainer, and Trainee users

The system allows each user role to access only the features they are allowed to use.

---

## User Roles

The system supports three roles:

### ADMIN

Admin manages the main system data.

Admin can:

- Manage courses
- Manage users
- Create, edit, and delete users
- Assign user roles

### TRAINER

Trainer manages course content and trainee work.

Trainer can:

- View courses
- Manage lessons
- Manage tasks
- View trainee submissions
- Add, edit, and delete feedback

### TRAINEE

Trainee uses the system to learn and submit work.

Trainee can:

- View courses
- Enroll in courses
- View lessons
- View tasks
- Submit work
- Edit their own submission
- View trainer feedback

---

## Technologies Used

### Backend

- Kotlin
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- PostgreSQL
- Gradle Kotlin
- Java 21

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS

### Tools

- IntelliJ IDEA
- Postman
- pgAdmin
- Git
- GitHub
- npm

---

## Backend

The backend is responsible for:

- Handling API requests
- Connecting to the PostgreSQL database
- Managing users, courses, lessons, tasks, submissions, feedback, and enrollments
- Authenticating users with JWT
- Applying role-based permissions

Backend URL:

```text
http://localhost:8080
```

Database:

```text
training_db
```

PostgreSQL port:

```text
5000
```

Main backend folder:

```text
src/main/kotlin/com/example/trainingmanagementsystem
```

---

## Frontend

The frontend is responsible for:

- Showing the login page
- Redirecting users to the correct dashboard
- Calling backend APIs
- Displaying courses, lessons, tasks, submissions, feedback, and users
- Protecting dashboard routes based on user role

Frontend URL:

```text
http://localhost:5173
```

Main frontend folder:

```text
frontend
```

Main frontend source folder:

```text
frontend/src
```

Frontend routes:

```text
/login
/admin
/trainer
/trainee
```

---

## Authentication

The project uses JWT authentication.

Login flow:

1. User enters email and password.
2. Backend checks the user.
3. Backend returns a JWT token.
4. Frontend saves the token in localStorage.
5. Frontend sends the token with protected API requests.
6. Backend checks the token and user role before allowing access.

Login API:

```text
POST /auth/login
```

Example request:

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

---

## Environment Variables

The project uses environment variables to protect sensitive data.

Required variables:

```text
DB_PASSWORD
JWT_SECRET
```

Example IntelliJ Run Configuration format:

```text
DB_PASSWORD=your_database_password;JWT_SECRET=your_jwt_secret_key
```

The backend uses these placeholders in `application.properties`:

```properties
spring.datasource.password=${DB_PASSWORD}
app.jwt.secret=${JWT_SECRET}
```

Do not commit real passwords or real JWT secrets to GitHub.

---

## How to Run the Backend

1. Open the project in IntelliJ IDEA.

2. Make sure PostgreSQL is running.

3. Make sure the database exists:

```text
training_db
```

4. Add environment variables in IntelliJ Run Configuration:

```text
DB_PASSWORD=your_database_password;JWT_SECRET=your_jwt_secret_key
```

5. Run the backend application:

```text
TrainingManagementSystemApplication.kt
```

6. Backend should run on:

```text
http://localhost:8080
```

---

## How to Run the Frontend

1. Open IntelliJ Terminal.

2. Go to the frontend folder:

```bash
cd frontend
```

3. Install dependencies if needed:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

5. Frontend should run on:

```text
http://localhost:5173
```

---

## Test Login Accounts

### Admin

```text
Email: admin@test.com
Password: 123456
```

### Trainer

```text
Email: login.trainer@test.com
Password: 123456
```

### Trainee

```text
Email: login.trainee@test.com
Password: 123456
```

---

## Main Backend Features

### Courses

- Create courses
- View courses
- Update courses
- Delete courses

### Lessons

- Create lessons under a course
- View course lessons
- Update lessons
- Delete lessons

### Users

- Create users
- View users
- Update users
- Delete users
- Support Admin, Trainer, and Trainee roles

### Enrollments

- Enroll trainees in courses
- View enrollments by user
- View enrollments by course
- Prevent duplicate enrollment

### Tasks

- Create tasks under a course
- View course tasks
- Update tasks
- Delete tasks

### Submissions

- Trainees can submit work
- Trainees can edit their own submissions
- Trainers and admins can view submissions
- Duplicate submissions are prevented

### Feedback

- Trainers can give feedback on submissions
- Trainees can view feedback
- Feedback can be updated or deleted
- Duplicate feedback for the same submission is prevented

---

## Main Frontend Features

### Login Page

- Login with email and password
- Save JWT token
- Save user role
- Redirect user to the correct dashboard

### Protected Routes

The frontend protects dashboard pages:

- Not logged in users go to `/login`
- Admin users go to `/admin`
- Trainer users go to `/trainer`
- Trainee users go to `/trainee`
- Users cannot access dashboards for other roles

### Admin Dashboard

Admin can:

- View all courses
- Create courses
- Edit courses
- Delete courses
- View all users
- Create users
- Edit users
- Delete users

### Trainer Dashboard

Trainer can:

- View courses
- Select a course
- Manage lessons
- Manage tasks
- View submissions
- Add and manage feedback

### Trainee Dashboard

Trainee can:

- View courses
- Enroll in courses
- See enrolled status
- Select a course
- View lessons
- View tasks
- Submit work
- Edit submission
- View feedback

---

## Shared Frontend API Helper

The frontend uses a shared API helper:

```text
frontend/src/api.ts
```

This file helps with:

- Backend base URL
- GET requests
- POST requests
- PUT requests
- DELETE requests
- Sending the JWT Bearer Token automatically
- Handling backend responses

---

## Project Structure

```text
training-management-system
│
├── src
│   └── main
│       └── kotlin
│           └── com.example.trainingmanagementsystem
│               ├── config
│               ├── controller
│               ├── dto
│               ├── entity
│               ├── enums
│               ├── exception
│               ├── repository
│               └── service
│
├── frontend
│   ├── src
│   │   ├── AdminDashboard.tsx
│   │   ├── TrainerDashboard.tsx
│   │   ├── TraineeDashboard.tsx
│   │   ├── LoginPage.tsx
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── package.json
│   └── package-lock.json
│
├── README.md
├── build.gradle.kts
└── settings.gradle.kts
```

---

## Common URLs

Backend:

```text
http://localhost:8080
```

Frontend:

```text
http://localhost:5173
```

Login:

```text
http://localhost:5173/login
```

Admin Dashboard:

```text
http://localhost:5173/admin
```

Trainer Dashboard:

```text
http://localhost:5173/trainer
```

Trainee Dashboard:

```text
http://localhost:5173/trainee
```

---

## Completed Project Work

Completed so far:

- Backend CRUD APIs
- PostgreSQL database connection
- JWT login
- Password hashing
- Role-based backend permissions
- Cleaner backend error responses
- React frontend setup
- Frontend login page
- React Router
- Protected frontend routes
- Shared frontend API helper
- Admin Dashboard
- Trainer Dashboard
- Trainee Dashboard
- Frontend UI design improvement
- GitHub commits and pushes

---

## Future Improvements

Optional improvements that can be added later:

- Add screenshots to the README
- Create shared TypeScript model types
- Create reusable frontend components
- Improve success and error messages
- Add admin enrollment management
- Add backend tests
- Add frontend tests
- Prepare the project for deployment

---

## GitHub Repository

```text
https://github.com/amrooo-debug/Full_Stack_Project_Training_Management_System
```