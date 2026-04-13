# MVP Scope – Momentum

## 🎯 Objective

The goal of the Minimum Viable Product (MVP) is to deliver a functional, usable version of Momentum that allows users to manage tasks, schedule events, plan focused sessions, and organise resources in a single system.

The MVP prioritises **core functionality and usability** over advanced features.

---

## ✅ Core Features (MVP)

### 1. Authentication

* User registration
* User login/logout
* Secure password handling

---

### 2. Task Management

* Create tasks
* Edit tasks
* Delete tasks
* Update task status (e.g. pending, in-progress, completed)
* Set due dates and priorities

---

### 3. Calendar Events

* Create calendar events
* Edit events
* Delete events
* View events in a weekly calendar format

---

### 4. Focus Sessions

* Create focus sessions
* Edit sessions
* Delete sessions
* Link sessions to tasks (optional)
* Track session status (planned, completed)

---

### 5. Resource Management

* Upload files
* View uploaded resources
* Delete resources
* Store metadata (file name, size, type)
* Link resources to tasks or sessions (optional)

---

### 6. Dashboard

* Overview of:

  * Upcoming tasks
  * Scheduled sessions
  * Calendar events
* Simple summary view for user activity

---

## 🚫 Out of Scope (Post-MVP)

The following features are intentionally excluded from the MVP to maintain focus and reduce complexity:

* Real-time collaboration
* Notifications and reminders
* AI recommendations or automation
* Mobile application
* Sharing or multi-user workspaces
* Advanced analytics or reporting
* Role-based access control

---

## ⚙️ Non-Functional Requirements

### Performance

* Application should respond within reasonable time (<500ms for most requests)

### Security

* Passwords must be hashed
* User data must be isolated per account

### Usability

* Interface should be simple and intuitive
* Navigation should be clear and consistent

### Reliability

* Basic error handling must be implemented
* System should not crash on invalid input

---

## 🧱 Technical Scope

### Backend

* REST API with Spring Boot
* CRUD operations for all core entities
* Database integration (PostgreSQL)

### Frontend

* Web interface (React planned)
* Forms for CRUD operations
* Basic calendar and dashboard views

### Infrastructure

* Local development using Docker (PostgreSQL)
* Initial deployment planned in later phase

---

## 📌 Success Criteria

The MVP will be considered complete when:

* All core features are functional end-to-end
* Users can fully manage their tasks, sessions, events, and resources
* The system is stable and usable without major bugs
* The application is ready for deployment

---

## 📈 Future Expansion

After MVP completion, the system can evolve to include:

* AI-driven scheduling suggestions
* Notifications and reminders
* Analytics dashboards
* Collaboration features

---

## 🧠 Summary

The MVP focuses on delivering a **complete, usable product** with strong foundations, rather than attempting to build a feature-heavy system.

This approach ensures:

* faster development
* higher quality implementation
* clearer demonstration of engineering skills
