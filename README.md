# Huddle Up

Mobile-first shared list app. Create named projects, organize items into custom tabs, and collaborate via 6-character invite codes.

## Stack

- **Next.js** (App Router, webpack build)
- **Node.js 20**
- **Tailwind CSS 3**
- **File DB** at `.data/db.json` (requires persistent server)

## Features

- Named projects with 6-char invite codes
- Custom sections/tabs per project
- Items: checkbox, cost, budget, URL, photo, comments, thumbs up
- Auto-save on every change

## Scripts

```bash
npm install
npm run dev      # local dev (webpack)
npm run build    # production build
npm run start    # production server
```

## Hostinger deploy

| Setting | Value |
|---------|-------|
| Build | `npm run build` |
| Start | `npm run start` |
| Node | **20** |

Ensure `.data/` persists across redeploys so list data is not lost.

## Domain

[huddleup.wtf](https://huddleup.wtf)
