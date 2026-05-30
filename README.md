# Nestly

A calm, offline-first PWA for two parents to track baby feeds, nappies, and sleep together.

## What it does

- Log feeds (bottle ml or breast side + duration), nappy changes, and sleep sessions
- Both carers see the same shared log, always in sync
- Works fully offline — logs save locally and sync when connection returns
- Calm, minimal UI designed for exhausted parents at 3am

## Tech Stack

- **Frontend:** Vite + React 18 (JavaScript) + Tailwind CSS
- **Local Storage:** Dexie.js (IndexedDB)
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **PWA:** vite-plugin-pwa (Workbox)
- **Analytics:** PostHog EU
- **Errors:** Sentry

## Local Development

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase account

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment file:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in your Supabase credentials in `.env.local`
5. Apply database migrations:
   - Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor
   - Run `supabase/migrations/002_rls_policies.sql` in Supabase SQL Editor
6. Start dev server:
   ```bash
   npm run dev
   ```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Deployment

- **Frontend:** Deploy to Vercel as a static site
- **Backend:** Supabase (hosted)
- **Edge Functions:** Deploy via Supabase CLI: `npx supabase functions deploy delete-account`

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking |
| `VITE_POSTHOG_KEY` | PostHog project API key |

## License

Private — All rights reserved.
