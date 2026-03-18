## Bot Flow Studio

Edit chatbot flows (text, images, buttons) with live preview and a Publish action that writes versioned flow JSON.

## Getting Started

Run the dev server:

```bash
cd bot-flow-studio
npm run dev -- --port 3005
```

Open `http://localhost:3005` (it redirects to `/studio`).

### Where flows live

- Drafts: `flows/drafts/*.json`
- Published versions: `flows/published/*`

Publish creates a versioned JSON copy and bumps the draft version.

## Deploy (Public URL) on Vercel

### 1) Push the repo to GitHub

Vercel deploys from Git repos. Create a GitHub repo and push this project.

### 2) Create a Vercel project

- In Vercel: **New Project** → import the GitHub repo
- **Root Directory**: `bot-flow-studio`
- Framework preset should auto-detect **Next.js**
- Deploy

You’ll get a public URL you can share with your managers.

### Important note about persistence on Vercel

This app currently stores flows on the server filesystem (`flows/…`). On Vercel (serverless), filesystem writes are **not guaranteed to persist** across restarts/deploys.

If you need “draft edits + publish” to reliably persist for real usage, switch storage to a DB (e.g. Vercel Postgres / Supabase). For a quick demo to share, Vercel is fine.

# BOT_Preview
fca99a333b5908c035041f9289be75736fbcc0eb
