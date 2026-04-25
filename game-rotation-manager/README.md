# Game Rotation Manager

A small local web app for managing a video game backlog, maintaining an active game rotation, and deciding what to play next.

## Version

v0.2.0

## Purpose

This project helps manage a growing game backlog by separating:

- Game type
- Current rotation slot
- Progress status

It is designed around a simple active trio:

- Main
- Side
- Casual

Games outside the active trio can sit in:

- Backlog
- Paused
- Completed

## Features

- Add, edit, and delete games
- Track game type, rotation slot, status, progress, and notes
- Original 9 game categories:
  - Stealth
  - TTRPG
  - Turn Based
  - Open World
  - Story-Based
  - Survival
  - Rogue
  - Souls-like
  - Horror
- Active rotation slots:
  - Main
  - Side
  - Casual
- Backlog and paused game management
- One active game per Main / Side / Casual slot
- Smart rotation suggestion
- Apply suggested rotation
- Preserve existing active games when suggesting a new rotation
- Focus Mode to show only active rotation games
- Progress controls:
  - -10%
  - +5%
  - +10%
  - Set 100%
- Search and filters
- Local browser saving with `localStorage`
- Export backup as JSON
- Import backup from JSON

## How to Run

Open `index.html` in a browser.

No server, build step, or installation is required.

## Data Model

Each game stores:

```js
{
  id: string,
  title: string,
  gameType: string,
  rotationSlot: string,
  status: string,
  progress: number,
  notes: string
}
```

## Rotation Logic

The app supports two recommendation modes.

### What should I play now?

This recommends from the current active rotation first.

If no active games exist, it considers playable backlog and paused games.

### Suggest Rotation

This maintains the active trio.

It preserves existing playable Main / Side / Casual games and only fills missing slots from the backlog or paused games.

For example, if Main is completed but Side and Casual are still active, the app will suggest a new Main while keeping the existing Side and Casual.

## Backup System

Use Export Backup to download your current game data as a JSON file.

Use Import Backup to restore a previous backup.

## Current Limitations
- Data is local to the browser unless exported manually
- No cloud sync
- No Steam API integration
- No date tracking or play history
- No charts yet

## Future Ideas
- Last played date
- Rotation history
- Steam store/library links
- Completion notes
- Dashboard charts
- Achievement tracking
- Deployed hosted version