# Local Demo Runbook — Training Management System

## 1. Purpose

This document is a step-by-step guide for running the **Training Management
System** locally for a tutor / demo presentation. Follow it on demo day to start
the project cleanly and present all three roles (Admin, Trainer, Trainee) without
surprises.

---

## 2. Required apps / services

Make sure all of the following are available before you begin:

- **PostgreSQL** running on port **5000** (database: `training_db`)
- **Backend** (Spring Boot) on port **8080**
- **Frontend** (React + Vite) on port **5173**
- A **browser** (Chrome recommended)

---

## 3. Demo day startup order

Start everything in this exact order:

1. **Start PostgreSQL first** (must be up before the backend).
2. **Start the backend second** (see Section 4).
3. **Start the frontend third** (see Section 5).
4. **Open** http://localhost:5173 in the browser.

> Order matters: if PostgreSQL is not running first, the backend will fail to
> start.

---

## 4. Backend startup commands

Open a **PowerShell** terminal and run, from the project root:

```powershell
cd "C:\Users\Amro Folowise\IdeaProjects\training-management-system"
$env:JWT_SECRET="my-local-training-management-system-secret-key-123456789"
$env:DB_PASSWORD="123321"
$env:SPRING_DATASOURCE_PASSWORD="123321"
.\gradlew bootRun --no-daemon
```

Wait until you see the message **"Started TrainingManagementSystemApplicationKt"**.
The backend is then running on:

- http://localhost:8080

> Keep this terminal open for the whole demo.

---

## 5. Frontend startup commands

Open a **second PowerShell** terminal and run, from the `frontend` folder:

```powershell
cd "C:\Users\Amro Folowise\IdeaProjects\training-management-system\frontend"
npm run dev
```

Wait until Vite prints **"Local: http://localhost:5173/"**, then open:

- http://localhost:5173

> Keep this terminal open for the whole demo.

---

## 6. Demo login accounts

All accounts use the password `123456`:

| Role    | Email                     | Password |
| ------- | ------------------------- | -------- |
| Admin   | admin@test.com            | 123456   |
| Trainer | login.trainer@test.com    | 123456   |
| Trainee | login.trainee@test.com    | 123456   |

> **Important:** Use **Logout → Login** when switching between roles. This gives
> each role a fresh JWT token and avoids stale-token errors (a stale token causes
> a 403 on edits/saves).

---

## 7. Clean demo data to expect

When logged in, you should see this clean data:

**Course**
- Kotlin Backend Basics
- Build REST APIs with Kotlin, Spring Boot, and PostgreSQL.

**Lessons (3 total)**
- Lesson 1 - Introduction to Spring Boot
- Working with Spring Data JPA
- Securing Endpoints with JWT

**Tasks (2 total)**
- Add JWT Authentication to an Endpoint
- Build a CRUD REST API

---

## 8. Quick pre-demo checks

Run through this checklist before presenting:

- [ ] `git status` is clean
- [ ] Backend opens on http://localhost:8080
- [ ] Frontend opens on http://localhost:5173
- [ ] PostgreSQL is running (port 5000)
- [ ] Use the **`login.*`** trainer/trainee accounts
- [ ] Avoid using the duplicate `trainer2@test.com` / `trainee@test.com` users

---

## 9. Common issues and fixes

| Issue | Fix |
| ----- | --- |
| **Frontend starts on 5174 instead of 5173** | Stop the old frontend process, free port 5173, and restart `npm run dev` so it uses 5173. (CORS only allows 5173.) |
| **Login fails** | Confirm the backend is running on 8080 and the frontend is on 5173. |
| **Save / edit gets a 403** | Logout, hard-refresh the page (Ctrl+Shift+R), then log in again to get a fresh token. |
| **Backend fails to start** | Confirm PostgreSQL is running on 5000 and the `JWT_SECRET` / `DB_PASSWORD` environment variables are set. |
| **E2E test data appears** | Do not run E2E right before the demo. Run E2E earlier only, then leave the database untouched. |

---

## 10. What not to do during the demo

- ❌ Do **not** delete the main course ("Kotlin Backend Basics").
- ❌ Do **not** run E2E tests during the live demo.
- ❌ Do **not** change ports (keep backend on 8080, frontend on 5173).
- ❌ Do **not** use the duplicate demo users (`trainer2@test.com`, `trainee@test.com`).
- ❌ Do **not** close the backend or frontend terminals while presenting.
