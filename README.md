# Huddle Up

Shared lists for anything you're planning together — moves, trips, events, renos, and more.

## Features

- **Named projects** — create a board for anything
- **Custom sections** — name your own tabs (Kitchen, Trip, Gear…)
- **Multi-participant** — share a 6-character invite code
- **Items** — checkbox, cost, budget, URL, photo, notes
- **Group decisions** — thumbs up/down + comments
- **Budget tracking** — per-item and overall project tally
- **Mobile-first** — matte neutral UI with neon accents

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or desktop.

### Using with your partner

1. One person creates a project and gets an **invite code**
2. Share the code — others tap **Join code** on the home screen
3. Everyone sees the same list (auto-refreshes every 3 seconds)

### Add to home screen (iOS)

Safari → Share → **Add to Home Screen** for an app-like experience.

## Project structure

```
src/
  app/           # Pages + API routes
  components/    # UI components
  lib/           # Types, utils, local DB
.data/           # JSON database (auto-created, gitignored)
public/uploads/  # Uploaded images (gitignored)
```

## Deploying

This app uses a local JSON file for storage — perfect for running on a single machine or VPS. For serverless (Vercel), upgrade to Supabase or a hosted database.

Run in production:

```bash
npm run build
npm start
```

## Design

- **Canvas:** `#E8E8E4` matte stone
- **Accent:** `#C8FF00` electric lime
- **Cards:** white, crisp borders, iOS-like feel
