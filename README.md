# Huddle Up

Shared lists for anything you're planning together.

**Domain:** [huddleup.wtf](https://huddleup.wtf)

## Built-in storage — no external services

Everything runs on the server:

- **Database:** `.data/db.json` (users, sessions, projects, items, votes, comments)
- **Sessions:** HTTP-only cookies — no browser localStorage, no Supabase
- **Photos:** `public/uploads/` on disk

## Quick start

```bash
npm install
npm run dev
```

On first visit, enter your display name and **save your 8-character personal code**. That code is your permanent identity — use it to sign back in on a new browser or after your cookie expires.

- **Personal code** (8 chars) — restores your identity so you don't appear as a new collaborator
- **Project invite code** (6 chars) — lets someone join a specific list

Sessions are stored server-side in `.data/db.json` via HTTP-only cookies.

## Hostinger deploy

| Setting | Value |
|---------|-------|
| Type | Node.js Web App |
| Repository | `https://github.com/karasu-kai/huddleup` |
| Branch | `main` |
| Node | **20** |
| Build | `npm run build` |
| Start | `npm run start` |

**Do not** deploy as static.

**Critical:** Ensure `.data/` and `public/uploads/` persist across redeploys, or all lists and photos will be wiped.

No env vars required.

## Project structure

```
src/
  app/           # Pages + API routes
  components/    # UI components
  lib/           # Types, utils, session, local DB
.data/           # JSON database (gitignored)
public/uploads/  # Uploaded images (gitignored)
```
