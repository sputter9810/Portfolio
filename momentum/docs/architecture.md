# Architecture – Momentum

## Objective

This document defines the high-level technical architecture for Momentum.

The goal is to choose an approach that is:
- realistic for a portfolio project
- aligned with common industry practices
- achievable within the 3-month project window
- strong for interview discussion

---

# 1. Architectural Style

Momentum will use a **client-server architecture** with a separated frontend and backend.

## Structure
- Frontend: React single-page application
- Backend: Spring Boot REST API
- Database: PostgreSQL
- Storage: Local file storage for MVP
- Infrastructure: Docker for local development

---

# 2. Why This Architecture

Using React + Spring Boot provides:
- clear separation of concerns
- API-first design
- strong industry relevance
- better portfolio value

---

# 3. High-Level System Components

Frontend:
- UI rendering
- API calls
- routing and state management

Backend:
- authentication
- business logic
- validation
- database interaction

Database:
- persistent storage for all entities

File Storage:
- stores uploaded files outside database

---

# 4. Technology Decisions

Frontend:
- React (JavaScript)
- Axios / Fetch

Backend:
- Java
- Spring Boot
- Spring Security
- JPA

Database:
- PostgreSQL

Infrastructure:
- Docker / Docker Compose

---

# 5. API Design

RESTful API with endpoints:
- /api/auth
- /api/tasks
- /api/events
- /api/sessions
- /api/resources

Use:
- GET, POST, PUT/PATCH, DELETE
- JSON responses
- proper HTTP status codes

---

# 6. Security

- JWT authentication
- BCrypt password hashing
- user-specific data access

---

# 7. Data Access Layers

- Controller
- Service
- Repository
- DTO
- Model

---

# 8. Validation & Errors

- frontend + backend validation
- global exception handling
- consistent error responses

---

# 9. File Storage

- store files on disk
- store metadata in database

---

# 10. Deployment Direction

- Frontend: Netlify / Vercel
- Backend: Render / Railway
- DB: PostgreSQL service

---

# 11. Backend Structure

com/momentum/
- controller
- service
- repository
- model
- dto
- security
- config
- exception

---

# 12. Frontend Structure

src/
- api
- components
- features
- pages
- routes
- styles

---

# Summary

Modern full-stack architecture using:
React + Spring Boot + PostgreSQL + Docker

Designed for:
- real-world relevance
- scalability
- strong portfolio impact
