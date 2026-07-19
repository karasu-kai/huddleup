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

On first visit, **create an account** with your email and password. Sign back in anytime — your projects stay tied to your email.

- **Email + password** — your account (stored securely on the server)
- **Project invite code** (6 chars) — join a specific list

## Design

- **Canvas:** matte stone `#E8E8E4`
- **Accent:** neon lime `#C8FF00` (buttons, progress bars, logo UP)
- **Logo:** black app tile with neon house mark + dark **Huddle Up** wordmark (neon accent only in the icon)

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

### Persistent storage (required for production)

Hostinger **rebuilds the app folder on every deploy**. If the database lives inside that folder (default `.data/`), **accounts, projects, and lists are wiped** each time.

Set these **environment variables** in Hostinger → Node.js Web App → Environment (paths **outside** the deploy folder):

| Variable | Purpose |
|----------|---------|
| `HUDDLEUP_DATA_DIR` | `db.json` — users, accounts, projects, items |
| `HUDDLEUP_UPLOADS_DIR` | Item photos (optional; defaults to in-app `public/uploads`) |

Example paths (adjust for your Hostinger account):

```bash
HUDDLEUP_DATA_DIR=/home/YOUR_USER/domains/huddleup.wtf/private/huddleup-data
HUDDLEUP_UPLOADS_DIR=/home/YOUR_USER/domains/huddleup.wtf/private/huddleup-uploads
```

One-time setup via SSH:

```bash
bash scripts/hostinger-persistent-data.sh
```

The app also keeps `db.json.bak` and restores from it if the main file is missing or corrupt after a bad deploy.

**After a deploy:** Hard-refresh once if you see an old UI. Accounts only persist if `HUDDLEUP_DATA_DIR` still points at the same folder as before.

## Project structure

```
src/
  app/           # Pages + API routes
  components/    # UI components
  lib/           # Types, utils, session, local DB
.data/           # JSON database (gitignored)
public/uploads/  # Uploaded images (gitignored)
```
