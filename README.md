# Huddle Up

Shared lists for anything you're planning together — moves, trips, events, renos, and more.

**Domain:** [huddleup.wtf](https://huddleup.wtf)

## Features

- **Named projects** — create a board for anything
- **Custom sections** — name your own tabs (Kitchen, Trip, Gear…)
- **Multi-participant** — share a 6-character invite code
- **Items** — checkbox, cost, budget, URL, photo, notes
- **Group decisions** — thumbs up/down + comments
- **Budget tracking** — per-item and overall project tally
- **Mobile-first** — matte neutral UI with neon accents
- **Auth (v1.5)** — Google OAuth + email magic link via Supabase

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # optional — without it, runs in local JSON mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase env vars, the app uses `.data/db.json` and localStorage display names (v1 mode).

## Supabase setup (production)

1. Create a [Supabase](https://supabase.com) project
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable Google OAuth in Authentication → Providers
4. Add env vars (see `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose to client)
5. Set Site URL to `https://huddleup.wtf` and redirect URL to `https://huddleup.wtf/auth/callback`

## Hostinger deploy

| Setting | Value |
|---------|-------|
| Type | Node.js Web App |
| Repository | `https://github.com/karasu-kai/huddleup` |
| Branch | `main` |
| Node | **20** |
| Build | `npm run build` |
| Start | `npm run start` |

Add all Supabase env vars in the Hostinger panel. **Do not** deploy as static.

## Project structure

```
src/
  app/           # Pages + API routes
  components/    # UI components
  lib/           # Types, utils, DB layer
supabase/
  schema.sql     # Postgres schema + RLS
.data/           # Local JSON DB (dev fallback, gitignored)
```

## Design

- **Canvas:** `#E8E8E4` matte stone
- **Accent:** `#C8FF00` electric lime
- **Cards:** white, crisp borders, iOS-like feel
