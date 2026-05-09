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

### ✅ Task Management System
- Create tasks
- View tasks by user
- Filter tasks by status (TODO / IN_PROGRESS / DONE)
- Update tasks
- Delete tasks
- Tasks linked to specific users

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

### 🔐 Authentication

#### Register User
POST /api/auth/register

Request Body:
{
  "name": "Sam Briggs",
  "email": "sam@example.com",
  "password": "password123"
}

---

#### Login User
POST /api/auth/login

Request Body:
{
  "email": "sam@example.com",
  "password": "password123"
}

---

### ✅ Tasks

#### Create Task
POST /api/tasks

{
  "title": "Example task",
  "description": "Task description",
  "userId": 1
}

---

#### Get Tasks
GET /api/tasks?userId=1

Optional filter:
GET /api/tasks?userId=1&status=TODO

---

#### Get Task by ID
GET /api/tasks/{id}?userId=1

---

#### Update Task
PUT /api/tasks/{id}?userId=1

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS"
}

---

#### Delete Task
DELETE /api/tasks/{id}?userId=1

---

## 📊 Response Format

### ✅ Success Response
{
  "message": "Success message",
  "userId": 1,
  "name": "Sam Briggs",
  "email": "sam@example.com"
}

### ❌ Error Response
{
  "timestamp": "2026-04-29T16:34:46",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation or error message",
  "path": "/api/tasks"
}

---

## 🛠️ Tech Stack

- Java 17
- Spring Boot
- Spring Security
- PostgreSQL
- Docker
- Maven

---

## ⚙️ Running the Project

### 1. Start database
docker compose up -d

### 2. Run backend
cd backend
./mvnw spring-boot:run

### 3. Test API
http://localhost:8080/api/health

---

## 📁 Project Structure

backend/src/main/java/com/momentum/app
├── config
├── controller
├── dto
│   ├── auth
│   └── task
├── exception
├── model
├── repository
├── service
└── MomentumApplication.java

---

## 📌 Future Improvements

- JWT authentication (remove manual userId handling)
- Frontend integration (React)
- Task deadlines and priorities
- Event scheduling system
- Dashboard and analytics

---

## 📖 Purpose

This project is part of a structured 9-month portfolio roadmap focused on building production-ready applications using modern development practices.

---

## 👤 Author

Sam Briggs  
Bachelor of Software Engineering – University of Newcastle
