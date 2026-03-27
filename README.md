# CareerX-AI

<p align="center">
  <img src="image.png" alt="landing page" width="90%"/>
</p>

---

## Overview

Approximately 75% of resumes are filtered out by Applicant Tracking Systems (ATS) before reaching a human reviewer.

ResumeATS Pro is designed to help candidates optimize their resumes to pass ATS screening.

---

## Features

- Analyzes resumes using ATS-like logic
- Provides actionable feedback
- Helps optimize resumes for ATS compatibility
- Includes a chat feature for personalized guidance

---

## Contribution

Contributions are welcome.

### Steps

1. Fork the repository
2. Create a feature branch:

```bash
git checkout -b feature/my-new-feature
```

---

# CareerX-AI — Full Stack Setup

This project includes:

- backend/ — Spring Boot API (JWT authentication and secured endpoints)
- frontend/ — React + Vite + Tailwind UI

---

## Folder Structure

```
application/
  backend/
  frontend/
  README.md
```

---

## Prerequisites

### Backend

- Java 21 (JDK)
- Maven 3.9+
- MySQL 8.x

### Frontend

- Node.js 18+ (recommended 20+)
- npm

---

## Configuration (Environment Variables)

### Required

- `DB_USERNAME` (default: root)
- `DB_PASSWORD` (required)
- `JWT_SECRET` (minimum 32 characters)

### Optional

- `DB_URL`
- `JWT_EXPIRATION_MS`

---

### Windows (PowerShell)

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "<your-mysql-password>"
$env:JWT_SECRET = "<32+ character secret>"
```

### Windows (CMD)

```bat
set DB_USERNAME=root
set DB_PASSWORD=<your-mysql-password>
set JWT_SECRET=<32+ character secret>
```

### macOS / Linux

```bash
export DB_USERNAME=root
export DB_PASSWORD='<your-mysql-password>'
export JWT_SECRET='<32+ character secret>'
```

---

## Recommended Local Development Setup

Use Spring profile `local`.

### Step 1: Copy configuration file

```powershell
Copy-Item backend\src\main\resources\application-local.properties.example backend\src\main\resources\application-local.properties
```

### Step 2: Edit configuration

Set:

- Database password
- JWT secret

### Step 3: Run backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

---

## Running from VS Code

1. Create `application-local.properties`
2. Open Run and Debug
3. Select "Backend (local profile)"
4. Run

Benefits:

- Secrets are not committed to version control
- Easier local setup
- Production environments can still use environment variables

---

## MySQL Setup

```sql
CREATE DATABASE login_system;
```

---

## Running the Project

### Backend

```bash
cd backend
mvn spring-boot:run
```

Runs at: http://localhost:8080

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at: http://localhost:5173

---

## Testing and Build

### Backend

```bash
mvn test
```

Uses H2 in-memory database for testing.

---

### Frontend

```bash
npm run lint
npm run build
```

---

## API Reference

### Register

POST `/api/v1/auth/register`

```json
{
  "firstName": "Noorain",
  "lastName": "K",
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "<jwt>"
}
```

---

### Login

POST `/api/v1/auth/login`

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "<jwt>"
}
```

---

### Current User

GET `/api/v1/users/me`

Header:

```
Authorization: Bearer <jwt>
```

Response:

```json
{
  "email": "user@example.com",
  "firstName": "Noorain",
  "lastName": "K",
  "role": "USER"
}
```

---

## Troubleshooting

### MySQL Error: Access denied / using password: NO

Cause:

- `DB_PASSWORD` is not set

Fix:

- Set environment variables in the same terminal or IDE configuration

---

### JWT Error: Secret too short

Fix:

- Use a secret with at least 32 characters

---

## Notes

- Do not commit secrets to version control
- Prefer local configuration files or environment variables
- Maintain a clean project structure
- Follow proper commit practices
