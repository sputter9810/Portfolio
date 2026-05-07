
# Momentum

Momentum is a full-stack productivity application designed to help users manage tasks, events, and focused work sessions.

This project is being developed as part of a structured portfolio roadmap to demonstrate real-world backend and full-stack development skills.

---

## 🚀 Features (Current)

### 🔐 Authentication System
- User registration
- User login
- JWT authentication
- Protected API endpoints
- Password hashing using BCrypt
- Stateless authentication flow
- Validation using annotations
- Structured error handling with HTTP status codes

### ✅ Task Management System
- Create tasks
- View authenticated user tasks
- Filter tasks by status
- Update tasks
- Delete tasks
- JWT-secured task ownership
- Task status support:
  - TODO
  - IN_PROGRESS
  - DONE

### 🧱 Backend Architecture
- Spring Boot REST API
- Layered architecture:
  - Controller
  - Service
  - Repository
  - DTO
  - Exception handling
  - Security layer

### 🗄️ Database
- PostgreSQL (Dockerised)
- JPA / Hibernate integration
- Automatic schema generation

---

## 🔐 JWT Authentication

After registration or login, the API returns a JWT token.

Example:

```json
{
  "message": "Login successful",
  "userId": 1,
  "name": "Sam Briggs",
  "email": "sam@example.com",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

Protected endpoints require:

```text
Authorization: Bearer YOUR_TOKEN
```

---

## 🧪 API Endpoints

### Health Check

```http
GET /api/health
```

---

## 🔐 Authentication

### Register User

```http
POST /api/auth/register
```

Request Body:

```json
{
  "name": "Sam Briggs",
  "email": "sam@example.com",
  "password": "password123"
}
```

---

### Login User

```http
POST /api/auth/login
```

Request Body:

```json
{
  "email": "sam@example.com",
  "password": "password123"
}
```

---

## ✅ Tasks

### Create Task

```http
POST /api/tasks
```

Headers:

```text
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

Body:

```json
{
  "title": "JWT secured task",
  "description": "This task belongs to the authenticated user"
}
```

---

### Get Tasks

```http
GET /api/tasks
```

Headers:

```text
Authorization: Bearer YOUR_TOKEN
```

---

### Filter Tasks by Status

```http
GET /api/tasks?status=TODO
```

Headers:

```text
Authorization: Bearer YOUR_TOKEN
```

---

### Get Task by ID

```http
GET /api/tasks/{id}
```

Headers:

```text
Authorization: Bearer YOUR_TOKEN
```

---

### Update Task

```http
PUT /api/tasks/{id}
```

Headers:

```text
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

Body:

```json
{
  "title": "Updated JWT task",
  "description": "Updated using authenticated user context",
  "status": "IN_PROGRESS"
}
```

---

### Delete Task

```http
DELETE /api/tasks/{id}
```

Headers:

```text
Authorization: Bearer YOUR_TOKEN
```

Expected Response:

```text
204 No Content
```

---

## 📊 Response Format

### ✅ Success Response

```json
{
  "message": "Success message",
  "userId": 1,
  "name": "Sam Briggs",
  "email": "sam@example.com",
  "token": "eyJ..."
}
```

---

### ❌ Error Response

```json
{
  "timestamp": "2026-05-01T21:48:05",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation or error message",
  "path": "/api/tasks"
}
```

---

## 🛠️ Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Security
- JWT (jjwt)
- PostgreSQL
- Hibernate / JPA
- Maven

### DevOps & Tooling
- Docker
- Docker Compose
- Postman
- Git & GitHub

---

## ⚙️ Running the Project

### 1. Start PostgreSQL container

```bash
docker compose up -d
```

---

### 2. Run backend

```bash
cd backend
./mvnw spring-boot:run
```

---

### 3. Test API

Open in browser:

```text
http://localhost:8080/api/health
```

Or use Postman for authenticated endpoints.

---

## 📁 Project Structure

```text
backend/src/main/java/com/momentum/app
├── config
├── controller
├── dto
│   ├── auth
│   └── task
├── exception
├── model
├── repository
├── security
├── service
└── MomentumApplication.java
```

---

## 📌 Future Improvements

### Frontend
- React frontend
- Dashboard UI
- Responsive design
- Protected frontend routes

### Features
- Task priorities
- Due dates
- Event scheduling
- Calendar integration
- Productivity analytics

### Backend Improvements
- Refresh tokens
- Role-based permissions
- Rate limiting
- Deployment configuration
- CI/CD pipeline

---

## 📖 Purpose

This project is part of a structured 9-month portfolio roadmap focused on building production-ready applications using modern development practices.

The goal is to simulate real-world software engineering practices outside of university coursework.

---

## 👤 Author

Sam Briggs  
Bachelor of Software Engineering – University of Newcastle
