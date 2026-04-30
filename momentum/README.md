# Momentum

Momentum is a full-stack productivity application designed to help users manage tasks, events, and focused work sessions.

This project is being developed as part of a structured portfolio roadmap to demonstrate real-world backend and full-stack development skills.

---

## 🚀 Features (Current)

### 🔐 Authentication System
- User registration
- User login
- Password hashing using BCrypt
- Validation using annotations
- Structured error handling with HTTP status codes

### 🧱 Backend Architecture
- Spring Boot REST API
- Layered architecture:
  - Controller
  - Service
  - Repository
  - DTO
  - Exception handling

### 🗄️ Database
- PostgreSQL (Dockerised)
- JPA / Hibernate integration
- Automatic schema generation

---

## 🧪 API Endpoints

### Health Check
GET /api/health

---

### Register User
POST /api/auth/register


**Request Body**
```json
{
  "name": "Sam Briggs",
  "email": "sam@example.com",
  "password": "password123"
}
```

### Login User
POST /api/auth/login

**Request Body**
```json
{
  "email": "sam@example.com",
  "password": "password123"
}
```

---

### Create Task
POST /api/tasks

```json
{
  "title": "Example task",
  "description": "Task description",
  "userId": 1
}
```

---

## 📊 Expected Responses

### ✅ Success (Register/Login)
```json
{
  "message": "Success message",
  "userId": 1,
  "name": "Sam Briggs",
  "email": "sam@example.com"
}
```

### ❌ Error Response
```json
{
  "timestamp": "2026-04-21T13:10:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation or error message",
  "path": "/api/auth/register"
}
```
---

## 🛠️ Tech Stack
Java 17
Spring Boot
Spring Security
PostgreSQL
Docker
Maven

## ⚙️ Running the Project
**1. Start database**
docker compose up -d

**2. Run backend**
cd backend
./mvnw spring-boot:run

**3. Test API**
Open in browser or Postman:
http://localhost:8080/api/health

## 📁 Project Structure
backend/src/main/java/com/momentum/app
├── config
├── controller
├── dto
├── exception
├── model
├── repository
├── service
└── MomentumApplication.java

## 📌 Future Improvements
JWT authentication
Task management system
Event scheduling
Frontend integration (React)
Dashboard & analytics

## 📖 Purpose

This project is part of a structured 9-month portfolio roadmap focused on building production-ready applications using modern development practices.

👤 Author

Sam Briggs
Bachelor of Software Engineering – University of Newcastle