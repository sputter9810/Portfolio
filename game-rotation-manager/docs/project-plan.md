# Game Rotation Manager Project Plan

## Project Type

Small personal productivity tool / portfolio mini project.

## Goal

Create a lightweight web app to manage a video game backlog and maintain a focused play rotation.

## Core Problem

The user has many games across different genres and wants a simple way to decide what to focus on without constantly reshuffling the backlog manually.

## Design Principle

Separate what a game is from how it is currently being treated.

## Game Type

The stable category of the game.

Supported categories:

- Stealth
- TTRPG
- Turn Based
- Open World
- Story-Based
- Survival
- Rogue
- Souls-like
- Horror

## Rotation Slot

The current focus state of the game.

Supported slots:

- Main
- Side
- Casual
- Backlog
- Paused
- Completed

## Status

The actual progress state.

Supported statuses:

- Not Started
- Playing
- Paused
- Completed
- 100% Complete

## Completed Milestones

### Day 1

- Created folder structure
- Built static HTML/CSS/JS app
- Added seed game data
- Rendered game cards
- Added localStorage persistence

### Day 2

- Removed unnecessary platform field
- Added editing
- Added search
- Added basic filtering

### Day 3

- Improved recommendation scoring
- Added recommendation reasons
- Added visual rotation tags

### Day 4

- Refactored data model
- Split game type from rotation slot
- Restored original 9 game categories
- Added quick rotation controls

### Day 5

- Added smart rotation planner
- Added apply suggested rotation
- Added focus mode
- Added improved progress controls
- Enforced one Main / Side / Casual game at a time

### Wrap-up

- Added export backup
- Added import backup
- Updated project documentation

## Final Current Version

v0.2.0

## Portfolio Notes

This project demonstrates:

- DOM manipulation
- Local state management
- localStorage persistence
- Data migration
- Filtering and searching
- Recommendation/scoring logic
- Simple UX design
- Backup/import functionality
- Incremental feature development

## Future Scope

This project is considered complete for now.

Possible later upgrades:

- Convert to React
- Add play session logging
- Add charts
- Add Steam integration
- Add cloud sync
- Deploy as a hosted static app