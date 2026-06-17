# Best Espresso & Pour Over Nearby

A production-minded specialty coffee finder with live location lookup, a real map, and curated coffee-source enrichment.

## Deploy

The current app is ready for static deployment.

### Vercel

1. Push the project to GitHub
2. Import the repo into Vercel
3. Framework preset: `Vite`
4. Build command: `npm run build`
5. Output directory: `dist`

### Cloudflare Pages

1. Push the project to GitHub
2. Create a new Pages project
3. Framework preset: `Vite`
4. Build command: `npm run build`
5. Build output directory: `dist`

## Notes

- Browser geolocation requires `https` or `localhost`
- The app now tries automatic geolocation on first load
- If live lookup fails, the UI clearly marks results as `Fallback results`
- Static hosting is enough for this version because live lookup happens in the browser
- Curated records now support `Supabase` with bundled-file fallback

## Supabase Setup

The app can now load curated records from Supabase when these env vars are present:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL_ALLOWLIST` for real admin email gating
- `SUPABASE_SERVICE_ROLE_KEY` for seeding

Files added for this:

- `.env.example`
- `supabase/schema.sql`
- `src/lib/supabaseClient.ts`
- `src/lib/curatedSourceStore.ts`
- `src/data/curatedSeed.ts`

Suggested setup:

1. Create a Supabase project
2. Run the SQL in `supabase/schema.sql`
3. Copy `.env.example` to `.env`
4. Fill in your Supabase URL, anon key, and service role key
5. Run `npm run seed:supabase`
6. Restart the dev server

### Admin Auth

You can now protect the in-app editor with a real Supabase email sign-in flow.

Set:

- `VITE_ADMIN_EMAIL_ALLOWLIST=enriqueasturizaga@gmail.com`
- `VITE_ADMIN_REDIRECT_URL=https://best-espresso-pour-over-nearby.vercel.app`

Then the app will:

1. send a magic link to that email
2. accept the Supabase session in the browser
3. unlock the admin panel only for allowlisted emails

If you request the magic link from a local dev session, set `VITE_ADMIN_REDIRECT_URL` so the email always returns to your live Vercel site instead of `localhost`.

If `VITE_ADMIN_EMAIL_ALLOWLIST` is not set, the app falls back to `VITE_ADMIN_PASSCODE`.

If Supabase is not configured, the app still works using the bundled curated records in `src/data/curated`

## Seed Strategy

The repo now includes a normalized seed builder:

- `src/data/curatedSeed.ts`

It derives three payloads from the curated source files:

- `sources`
- `cafes`
- `mentions`

This matches the Supabase schema directly and is the intended bridge for moving from hardcoded records to database rows.

The next step when you are ready:

1. export the seed payload
2. insert `sources`
3. insert `cafes`
4. insert `mentions`

That means we do not need to retype curated records by hand.

You can now seed Supabase with:

```powershell
npm run seed:supabase
```

## Current Source Set

Structured curated adapters included now:

- `Sprudge`
- `Daily Coffee News`
- `European Coffee Trip`
- `CoffeeGeek`
- `Perfect Daily Grind`
- `Home-Barista`
- `Beanhunter`
- `Beanconqueror`
- `Roasters app`
- `Baristapp`
- regional priority records for `Jersey City`, `Bethesda`, and `Venice`

## Coffee-First Rules

The app is intentionally biased toward serious coffee programs rather than generic cafe popularity.

Signals the ranking now rewards:

- single-origin pour-over options
- roast date or origin transparency
- traditional espresso drink language
- real manual brew methods like `V60`, `Chemex`, or `Kalita`
- flavor-note literacy
- short coffee-focused menus

Signals the ranking can penalize:

- dark or bold roast language without specialty context
- sugary or non-coffee-heavy menu language
- generic small / medium / large sizing for espresso drinks
- food or beverage programs that appear to dominate coffee craft

## Supabase Migration Path

When you are ready to stop hardcoding curated records, the clean migration path is:

1. Create a `curated_sources` table
2. Create a `curated_cafes` table
3. Create a `curated_mentions` table
4. Move each adapter record into rows
5. Fetch curated evidence from Supabase instead of importing local arrays

Suggested columns:

`curated_sources`
- `id`
- `name`
- `category`
- `home_url`

`curated_cafes`
- `id`
- `name`
- `city`
- `neighborhood`

`curated_mentions`
- `id`
- `source_id`
- `cafe_id`
- `confidence`
- `evidence_note`
- `source_url`
- `espresso_boost`
- `pour_over_boost`
- `roaster_boost`
- `credibility_boost`
- `coffee_focus_boost`
- `transparency_boost`
- `signal_notes` as text array / json
- `avoid_notes` as text array / json
- `penalty_signals` as text array / json

## Next Upgrade Options

1. Move live geocoding/places behind a small backend for more reliable API behavior
2. Add more curated coffee sources
3. Store curated records outside code in a database or content file

## Full Documentation

- `docs/APP_DOCUMENTATION.md`
