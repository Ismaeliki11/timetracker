# TimeTracker — Deployment & Stack

## Hosting

Deployed on **Vercel**.
**Production URL**: [https://time-tracker-ismaeliki.vercel.app](https://time-tracker-ismaeliki.vercel.app)
SPA routing is handled via `vercel.json` at the project root, which rewrites all routes to `/index.html`.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | ^19.2.0 |
| Build tool | Vite | ^6.2.0 |
| Language | TypeScript | ~5.8.2 |
| Router | React Router DOM | ^7.11.0 |
| Backend / Auth / DB | Supabase JS | ^2.88.0 |

## Build

```bash
npm run build   # outputs to /dist
npm run dev     # local dev server on port 3000
npm run preview # preview production build locally
```

Vercel detects the `dist` output directory automatically via `vercel.json`.

## Environment Variables

Set in the Vercel dashboard under Project → Settings → Environment Variables:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key
- `GEMINI_API_KEY` — Google Gemini API key (exposed via `vite.config.ts`)

> Never commit `.env` files. All secrets are managed through the Vercel dashboard.

## Development Guidelines

- **Bilingual Requirement**: All UI changes, content, and features must be implemented in both Spanish and English using the existing translation system.
  - Translations are managed in the `translations` object within `context/AppProviders.tsx`.
  - Always add new keys to both `en` and `es` sections.
  - Use the `t()` function from `useLocalization()` to display text in the UI.
  - It is mandatory that all updates remain bilingual.
