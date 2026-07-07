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
- Create enrollments
- View enrollments
- Delete enrollments

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
- See enrolled status
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
- Returning cleaner error responses for common API errors

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
- Displaying courses, lessons, tasks, submissions, feedback, users, and enrollments
- Protecting dashboard routes based on user role
- Reusing shared TypeScript types
- Reusing shared UI components such as the dashboard header

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
5. Frontend saves the user role in localStorage.
6. Frontend sends the token with protected API requests.
7. Backend checks the token and user role before allowing access.

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

## How to Build the Frontend

To check that the frontend builds successfully, run:

```bash
cd frontend
npm run build
```

This runs TypeScript checking and creates a production build.

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
- View course by ID
- Update courses
- Delete courses

### Lessons

- Create lessons under a course
- View course lessons
- View lesson by ID
- Update lessons
- Delete lessons

### Users

- Create users
- View users
- View user by ID
- Update users
- Delete users
- Support Admin, Trainer, and Trainee roles

### Enrollments

- Create enrollments
- Allow Admin to create enrollments from the Admin Dashboard
- Allow Trainees to enroll themselves from the Trainee Dashboard
- View all enrollments
- View enrollments by user
- View enrollments by course
- Delete enrollments
- Prevent duplicate enrollment

### Tasks

- Create tasks under a course
- View course tasks
- View task by ID
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

## Backend Permissions

The backend uses Spring Security and method-level role checks.

Important enrollment permissions:

- Admin and Trainee can create enrollments
- Admin and Trainer can view all enrollments
- Admin, Trainer, and Trainee can view enrollments by user
- Admin and Trainer can view enrollments by course
- Admin can delete enrollments

This allows the Trainee Dashboard to support self-enrollment and the Admin Dashboard to support full enrollment management.

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
- Create enrollments
- View all enrollments
- Delete enrollments

### Trainer Dashboard

Trainer can:

- View courses
- Select a course
- Manage lessons
- Manage tasks
- View trainee submissions
- Add feedback
- Edit feedback
- Delete feedback

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

## Shared Frontend Types

The frontend uses shared TypeScript types:

```text
frontend/src/types.ts
```

This file includes common types such as:

- User
- UserRole
- Course
- Lesson
- Task
- Enrollment
- Submission
- Feedback

Using shared types keeps the dashboard files cleaner and avoids repeating the same type definitions in many places.

---

## Reusable Frontend Components

The frontend includes reusable components.

Current reusable component:

```text
frontend/src/components/DashboardHeader.tsx
```

This component is used by:

- Admin Dashboard
- Trainer Dashboard
- Trainee Dashboard

It shows:

- Dashboard title
- Welcome message
- Role badge
- Logout button

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
│   │   ├── components
│   │   │   └── DashboardHeader.tsx
│   │   │
│   │   ├── AdminDashboard.tsx
│   │   ├── TrainerDashboard.tsx
│   │   ├── TraineeDashboard.tsx
│   │   ├── LoginPage.tsx
│   │   ├── api.ts
│   │   ├── types.ts
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
- Backend permission update for admin enrollment creation
- Cleaner backend error responses
- React frontend setup
- Frontend login page
- React Router
- Protected frontend routes
- Shared frontend API helper
- Shared frontend TypeScript types
- Reusable dashboard header component
- Admin Dashboard
- Admin course management
- Admin user management
- Admin create enrollment action
- Admin enrollment view
- Admin delete enrollment action
- Trainer Dashboard
- Trainer lesson management
- Trainer task management
- Trainer submission view
- Trainer feedback management
- Trainee Dashboard
- Trainee course enrollment
- Trainee submission workflow
- Trainee feedback view
- Frontend UI design improvement
- GitHub commits and pushes

---

## Future Improvements

Optional improvements that can be added later:

- Add screenshots to the README
- Create more reusable frontend components
- Improve success and error messages
- Add better loading states
- Add backend tests
- Add frontend tests
- Prepare the project for deployment

---

## GitHub Repository

```text
https://github.com/amrooo-debug/Full_Stack_Project_Training_Management_System
```