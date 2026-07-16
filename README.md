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

Enter your display name on first visit. Your session is stored server-side in `.data/db.json`.

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

**After a deploy:** If you still see old colours or the old logo once, hard-refresh the page (or clear site data if you added Huddle Up to your home screen). The app now sends no-cache headers so future visits should always pick up the latest version.

## Project structure

```
src/
  app/           # Pages + API routes
  components/    # UI components
  lib/           # Types, utils, session, local DB
.data/           # JSON database (gitignored)
public/uploads/  # Uploaded images (gitignored)
```
