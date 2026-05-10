# LifeStack

**LifeStack** is a personal progress scheduler for organising projects, hobbies, training, meals, tasks, and general life admin.

It is built as a local-first React app for personal use, with scheduling tools designed around consistency, progression, and weekly planning.

## Current Version

**v1.0.0 — MVP**

## Features

- Create, edit, and delete activities
- Set activity category, priority, frequency, duration, and preferred time
- Assign preferred days
- Lock activities to specific days
- Generate a weekly schedule
- Move generated sessions manually
- Mark sessions as complete
- Weekly reset tools
- Export and import backups
- Quick Capture inbox for thoughts and ideas
- AI Planner prompt generator
- LocalStorage persistence

## Example Uses

LifeStack can be used to organise:

- software projects
- climbing sessions
- calisthenics
- walking/cardio
- meal planning
- hobbies
- game rotation
- D&D planning
- general personal tasks

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- LocalStorage

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Data Storage

LifeStack stores data locally in the browser using `localStorage`.

This means:

- no account is required
- no backend is required
- data stays on the current device/browser
- clearing browser storage will delete your data

Use the built-in **Export Backup** feature regularly to save your data as a JSON file.

## Backup and Restore

From the Dashboard:

- **Export Backup** downloads your LifeStack data as a JSON file
- **Import Backup** restores activities, schedule, and inbox captures from a previous export

## AI Planner

LifeStack does not currently use a paid API.

Instead, it generates a structured prompt that can be copied into ChatGPT or another AI assistant for schedule review.

The AI prompt includes:

- activities
- locked sessions
- generated weekly schedule
- unprocessed inbox captures
- planning goals

## Roadmap

Planned future updates:

### v1.1.0 — Projects Module

- project list
- project status
- notes
- milestones
- next actions

### v1.2.0 — Training Module

- climbing log
- calisthenics tracking
- cardio/walking tracking
- progression notes

### v1.3.0 — Meals Module

- meal list
- weekly meal planning
- calories/protein notes
- grocery support

### v1.4.0 — Analytics

- weekly completion rate
- activity consistency
- workload summaries
- category breakdowns

### v2.0.0 — Advanced Version

Potential future upgrades:

- database persistence
- authentication
- hosted backend
- deeper AI scheduling
- calendar integration

## Deployment

LifeStack can be deployed as a static site using services like Netlify or Vercel.

Recommended deploy command:

```bash
npm run build
```

Recommended publish directory:

```txt
dist
```

## Notes

LifeStack v1.0.0 is designed as a personal MVP. The goal is not to replace full project management tools, but to provide a lightweight personal system for staying consistent across multiple areas of life.
