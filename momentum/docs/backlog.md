# Backlog – Momentum

## Objective

This backlog breaks the Momentum MVP into implementation-ready epics and tasks.

It is designed to:
- provide a realistic development order
- keep scope controlled
- support iterative delivery
- prepare the project for Week 2 development

---

# Delivery Approach

The MVP will be built in phases:

1. Project setup and foundation
2. Authentication
3. Tasks
4. Calendar events
5. Focus sessions
6. Resources
7. Dashboard
8. Deployment and polish

Each epic includes a goal, key tasks, and a rough priority.

---

# Epic 1 – Project Setup and Foundation

## Goal
Establish the backend, frontend, database, and development environment.

## Priority
Highest

## Tasks
- Create root project structure
- Create backend Spring Boot application
- Create frontend React application
- Configure PostgreSQL with Docker Compose
- Configure backend database connection
- Set up environment variables
- Confirm backend runs locally
- Confirm frontend runs locally
- Configure CORS between frontend and backend
- Create initial README run instructions

## Definition of Done
- frontend boots locally
- backend boots locally
- database container runs successfully
- frontend can reach backend

---

# Epic 2 – Authentication

## Goal
Allow users to register, log in, and access only their own data.

## Priority
Highest

## Tasks
- Create User entity
- Create User repository
- Create auth DTOs
- Implement registration endpoint
- Implement login endpoint
- Configure password hashing with BCrypt
- Configure Spring Security
- Implement JWT generation and validation
- Add authenticated route protection on frontend
- Store token on frontend
- Add logout flow

## Definition of Done
- user can register
- user can log in
- protected endpoints require authentication
- user-specific access is enforced

---

# Epic 3 – Task Management

## Goal
Allow users to manage tasks.

## Priority
High

## Tasks
- Create Task entity
- Create Task repository
- Create task DTOs
- Create task service
- Create task controller
- Implement create task endpoint
- Implement get all tasks endpoint
- Implement get task by id endpoint
- Implement update task endpoint
- Implement delete task endpoint
- Add user ownership checks
- Build task list page in frontend
- Build create/edit task forms
- Add task status and priority controls

## Definition of Done
- authenticated user can create, read, update, and delete their own tasks
- tasks display correctly in frontend

---

# Epic 4 – Calendar Events

## Goal
Allow users to manage scheduled events.

## Priority
High

## Tasks
- Create CalendarEvent entity
- Create event repository
- Create event DTOs
- Create event service
- Create event controller
- Implement CRUD endpoints for events
- Add validation for start and end times
- Add user ownership checks
- Build event list/calendar page in frontend
- Build create/edit event forms
- Add weekly view display

## Definition of Done
- authenticated user can manage their own events
- events appear in a usable weekly calendar view

---

# Epic 5 – Focus Sessions

## Goal
Allow users to create and manage focused work sessions.

## Priority
High

## Tasks
- Create FocusSession entity
- Create session repository
- Create session DTOs
- Create session service
- Create session controller
- Implement CRUD endpoints for sessions
- Add optional link from session to task
- Add user ownership checks
- Build session list page in frontend
- Build create/edit session forms
- Display linked task where applicable

## Definition of Done
- authenticated user can manage their own sessions
- sessions can optionally be linked to tasks

---

# Epic 6 – Resource Management

## Goal
Allow users to upload and manage files linked to work items.

## Priority
Medium-High

## Tasks
- Create Resource entity
- Create resource repository
- Create resource DTOs
- Create resource service
- Implement file upload handling
- Save file metadata in database
- Save files to local storage
- Implement file download endpoint
- Implement delete resource endpoint
- Add optional link to task
- Add optional link to session
- Add file validation rules
- Build resource upload UI
- Build resource list page

## Definition of Done
- authenticated user can upload, view, download, and delete their own files
- resources can optionally be linked to tasks or sessions

---

# Epic 7 – Dashboard

## Goal
Provide a central overview of user activity.

## Priority
Medium

## Tasks
- Design dashboard layout
- Create backend endpoint for dashboard summary or aggregate multiple endpoints on frontend
- Display upcoming tasks
- Display upcoming events
- Display planned sessions
- Add quick navigation to core areas

## Definition of Done
- user lands on a dashboard with meaningful summary information
- dashboard helps navigation and visibility

---

# Epic 8 – Validation, Error Handling, and Security Hardening

## Goal
Improve reliability and professionalism of the system.

## Priority
Medium

## Tasks
- Add Bean Validation annotations to DTOs
- Add global exception handler
- Standardise error response structure
- Handle invalid login/register states
- Handle missing resource access
- Validate ownership in all service methods
- Improve frontend form validation
- Improve empty/error states in UI

## Definition of Done
- invalid requests return consistent errors
- app behaves predictably under bad input
- user cannot access another user's data

---

# Epic 9 – UI Polish and Usability

## Goal
Make the product presentable as a portfolio piece.

## Priority
Medium

## Tasks
- Create consistent layout and navigation
- Improve spacing, typography, and responsiveness
- Add loading states
- Add success and error messages
- Improve forms and page clarity
- Add empty-state messaging

## Definition of Done
- app looks coherent and intentional
- user experience is smooth enough for demo use

---

# Epic 10 – Deployment and Documentation

## Goal
Prepare the project for public portfolio use.

## Priority
Medium

## Tasks
- Prepare backend for deployment
- Prepare frontend for deployment
- Configure production environment variables
- Deploy database
- Deploy backend
- Deploy frontend
- Update README with setup steps
- Add architecture diagram later if desired
- Add screenshots/gif demo
- Document key technical decisions

## Definition of Done
- project is deployed
- repo is understandable to recruiters/interviewers
- a working demo is available

---

# Suggested Build Order

## Phase 1
- Epic 1: Project Setup and Foundation
- Epic 2: Authentication

## Phase 2
- Epic 3: Task Management
- Epic 4: Calendar Events

## Phase 3
- Epic 5: Focus Sessions
- Epic 6: Resource Management

## Phase 4
- Epic 7: Dashboard
- Epic 8: Validation, Error Handling, and Security Hardening
- Epic 9: UI Polish and Usability

## Phase 5
- Epic 10: Deployment and Documentation

---

# Week 2 Recommended Starting Tasks

These should be your immediate next implementation steps:

1. Create the project repo structure
2. Scaffold backend Spring Boot app
3. Scaffold frontend React app
4. Create docker-compose for PostgreSQL
5. Confirm local boot for all services
6. Start User entity and authentication flow

---

# MVP Milestones

## Milestone 1 – Environment Ready
- frontend, backend, and database all running locally

## Milestone 2 – Auth Complete
- registration and login working

## Milestone 3 – Core Productivity Features
- tasks, events, and sessions working end-to-end

## Milestone 4 – Resource Support
- uploads and downloads working

## Milestone 5 – Portfolio-Ready MVP
- dashboard, polish, deployment, docs complete

---

# Summary

This backlog gives Momentum a realistic development pathway.

It helps ensure:
- the foundation is built first
- risky areas are tackled early
- features are implemented in a sensible order
- the project stays aligned with a production-style workflow
