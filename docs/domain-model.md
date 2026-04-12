# Domain Model – Momentum

## Objective

This document defines the core domain entities for Momentum, their responsibilities, key attributes, and relationships.

The goal is to create a domain model that supports the MVP while remaining flexible for future expansion.

---

## Domain Overview

Momentum is a productivity platform that allows users to manage:

- tasks
- calendar events
- focus sessions
- uploaded resources

All primary records belong to a specific user.

The domain is centred around personal organisation, where a user creates and manages planning items and can attach resources to support their work.

---

# Core Entities

## 1. User

### Purpose
Represents an individual account in the system. Every major item in the application belongs to a user.

### Key Attributes
- id
- name
- email
- passwordHash
- createdAt
- updatedAt

### Notes
- Email should be unique
- Passwords should never be stored in plain text
- A user owns tasks, calendar events, focus sessions, and resources

---

## 2. Task

### Purpose
Represents a piece of work the user wants to complete.

### Key Attributes
- id
- userId
- title
- description
- dueDateTime
- status
- priority
- createdAt
- updatedAt

### Suggested Status Values
- PENDING
- IN_PROGRESS
- COMPLETED

### Suggested Priority Values
- LOW
- MEDIUM
- HIGH

### Notes
- Tasks belong to one user
- A task may optionally be linked to one or more focus sessions
- A task may optionally have resources linked to it

---

## 3. CalendarEvent

### Purpose
Represents a scheduled commitment or time-based event on the user’s calendar.

### Key Attributes
- id
- userId
- title
- description
- startDateTime
- endDateTime
- type
- location
- createdAt
- updatedAt

### Suggested Type Values
- PERSONAL
- STUDY
- WORK
- DEADLINE
- OTHER

### Notes
- Events belong to one user
- Events are independent calendar items
- For MVP, events do not need advanced recurrence support

---

## 4. FocusSession

### Purpose
Represents a planned or completed block of dedicated work time.

### Key Attributes
- id
- userId
- title
- description
- startDateTime
- endDateTime
- status
- linkedTaskId
- createdAt
- updatedAt

### Suggested Status Values
- PLANNED
- COMPLETED
- CANCELLED

### Notes
- Sessions belong to one user
- A session may optionally be linked to a task
- Sessions support structured work and planning
- A session may also have linked resources

---

## 5. Resource

### Purpose
Represents a file uploaded by a user for later access or for linking to a task or session.

### Key Attributes
- id
- userId
- storedFileName
- originalFileName
- contentType
- fileSize
- storagePath
- linkedTaskId
- linkedSessionId
- uploadedAt
- updatedAt

### Notes
- Resources belong to one user
- A resource may optionally be linked to a task
- A resource may optionally be linked to a focus session
- Files should be stored outside the database, while metadata is stored in the database

---

# Relationships

## User Relationships
- One User can have many Tasks
- One User can have many CalendarEvents
- One User can have many FocusSessions
- One User can have many Resources

## Task Relationships
- One Task belongs to one User
- One Task can have many FocusSessions
- One Task can have many Resources

## CalendarEvent Relationships
- One CalendarEvent belongs to one User

## FocusSession Relationships
- One FocusSession belongs to one User
- One FocusSession may belong to one Task
- One FocusSession can have many Resources

## Resource Relationships
- One Resource belongs to one User
- One Resource may belong to one Task
- One Resource may belong to one FocusSession

---

# Relationship Summary

## One-to-Many
- User → Tasks
- User → CalendarEvents
- User → FocusSessions
- User → Resources
- Task → FocusSessions
- Task → Resources
- FocusSession → Resources

## Optional Relationships
- FocusSession → Task
- Resource → Task
- Resource → FocusSession

---

# Design Decisions

## 1. User Ownership
All core data is owned by a user. This simplifies authorisation and keeps the MVP focused on single-user workflows.

## 2. Focus Sessions as Separate Entities
Focus sessions are separate from tasks because they represent scheduled work blocks rather than work items themselves.

This allows a user to:
- create multiple sessions for one task
- create sessions that are not linked to any task
- track work habits more clearly in future versions

## 3. Calendar Events Separate from Focus Sessions
Calendar events and focus sessions are similar but should remain separate in the MVP.

Reason:
- calendar events represent commitments
- focus sessions represent deliberate work blocks

Keeping them separate improves clarity and supports future feature growth.

## 4. Resources Store Metadata, Not File Content
The system stores file metadata in the database and file content on disk or object storage.

This is more realistic for production systems and keeps the database smaller and easier to manage.

## 5. Optional Linking
Tasks, sessions, and resources can be linked, but these links are optional.

This gives users flexibility:
- a task can exist without a session
- a session can exist without a task
- a resource can be uploaded without being linked immediately

---

# Entity Diagram (Text Version)

User
- id
- name
- email
- passwordHash
- createdAt
- updatedAt

Task
- id
- userId
- title
- description
- dueDateTime
- status
- priority
- createdAt
- updatedAt

CalendarEvent
- id
- userId
- title
- description
- startDateTime
- endDateTime
- type
- location
- createdAt
- updatedAt

FocusSession
- id
- userId
- title
- description
- startDateTime
- endDateTime
- status
- linkedTaskId
- createdAt
- updatedAt

Resource
- id
- userId
- storedFileName
- originalFileName
- contentType
- fileSize
- storagePath
- linkedTaskId
- linkedSessionId
- uploadedAt
- updatedAt

---

# Future Domain Expansion

Possible future entities:
- Tag
- Reminder
- Notification
- RecurringEvent
- ProductivityInsight
- Workspace

These are intentionally excluded from the MVP to avoid unnecessary complexity.

---

# Summary

The Momentum domain model is built around a simple but realistic productivity system.

It supports:
- strong user ownership
- clean separation of responsibilities
- flexible relationships between work items and resources
- realistic backend implementation using Spring Boot and JPA

This model will be used to guide:
- database schema design
- Java entity creation
- repository structure
- service-layer logic