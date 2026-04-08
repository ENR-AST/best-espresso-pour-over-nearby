# Best Espresso & Pour Over Nearby

## Purpose

`Best Espresso & Pour Over Nearby` is a web app that helps users find serious coffee-focused cafes and roasters near a location.

The app is intentionally not a generic "best coffee nearby" directory. It is designed to favor real specialty coffee signals such as:

- espresso quality
- pour-over quality
- roaster presence
- origin transparency
- editorial and enthusiast support
- coffee-first menus rather than broad cafe menus

The product goal is to help a user quickly answer:

- Where can I get serious coffee near me?
- Which places are likely to care about coffee craft, not just popularity?
- Why is this shop being recommended?

## Current Status

The app currently includes:

- live browser geolocation
- city and ZIP code search
- map-based results using Leaflet and OpenStreetMap
- coffee-first ranking logic
- chain exclusion for large commercial brands
- curated-source enrichment
- Supabase-backed curated records
- a lightweight in-app admin editor
- admin access controlled by Supabase email auth or passcode fallback
- saved `My Cities` shortcuts for home and travel use

## Main User Flows

### 1. Find coffee from current location

1. User opens the app
2. App attempts to use current browser location automatically
3. App finds nearby coffee places
4. Results are ranked by specialty score
5. User sees list + map + detail view

### 2. Search by city

1. User changes `Search by` to `City name`
2. User enters a city or neighborhood
3. App geocodes the text into coordinates
4. App looks up nearby cafes
5. Results are ranked and displayed

### 3. Search by ZIP code

1. User changes `Search by` to `Zip code`
2. User enters a 5-digit ZIP code
3. App geocodes the ZIP
4. App looks up nearby cafes
5. Results are ranked and displayed

### 4. Use `My Cities`

1. User taps a saved city chip
2. App runs a city-based search immediately
3. User can add a new travel city from `City name` mode
4. Saved cities persist in browser storage

### 5. Admin curation

1. Admin opens the `Admin` section
2. Admin signs in using an approved email or passcode fallback
3. Admin can add:
   - sources
   - cafes
   - source mentions
4. Curated data refreshes after save

## Product Principles

### Coffee-first

The app is built around the idea that coffee quality matters more than generic popularity.

The ranking favors shops that show signs of serious coffee work, including:

- single-origin pour-over offerings
- roast date or origin transparency
- traditional espresso drinks like cortado, macchiato, and flat white
- manual brew methods such as V60, Chemex, and Kalita
- flavor-note literacy
- short, focused menus

### Avoiding generic cafe bias

The ranking can penalize signals such as:

- dark roast / bold roast marketing without specialty context
- sugary drink-heavy positioning
- generic small / medium / large sizing applied to espresso drinks
- food-forward or broad beverage programs overshadowing coffee

### Explainability

Each result is meant to answer not only `what is good` but also `why it is good`.

The app surfaces:

- specialty score
- recommendation reason
- support labels
- source badges
- evidence and coffee-first signals in the detail view

## Architecture Overview

### Frontend

The app is a Vite + React single-page application.

Core frontend responsibilities:

- location input and geolocation flow
- search state and fallback handling
- ranking display
- map display
- detail modal
- admin editor UI

### Data Sources

The app currently combines two data layers:

1. live place lookup
   - browser geolocation
   - Nominatim / ZIP geocoding
   - Overpass / OpenStreetMap nearby cafes

2. curated specialty layer
   - bundled curated records in code
   - Supabase-backed curated sources, cafes, and mentions

### Ranking Model

The ranking system combines:

- source support score
- espresso evidence
- pour-over evidence
- roaster program strength
- credibility signals
- distance score
- coffee-focus bonus
- generic-cafe penalties

Results are sorted:

1. highest specialty score first
2. nearest distance second when scores tie

### Map Layer

The app uses:

- Leaflet
- react-leaflet
- OpenStreetMap tiles

The map is intended to match the result set currently shown to the user.

## Technical Stack

### Application stack

- React 18
- TypeScript
- Vite
- Leaflet
- react-leaflet
- Supabase JavaScript client

### Hosting

The live app is deployed on Vercel.

### Database

Supabase stores curated content in tables such as:

- `curated_sources`
- `curated_cafes`
- `curated_mentions`

## Curated Data Model

### curated_sources

Stores source definitions, such as:

- Sprudge
- Daily Coffee News
- Perfect Daily Grind
- CoffeeGeek

Fields include:

- `id`
- `name`
- `category`
- `home_url`

### curated_cafes

Stores cafe records.

Fields include:

- `id`
- `slug`
- `name`
- `city`
- `neighborhood`
- `tags`

### curated_mentions

Stores source evidence linking a source to a cafe.

Fields include:

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
- `signal_notes`
- `avoid_notes`
- `penalty_signals`

## Admin Authentication

The admin area supports two modes.

### Preferred mode: email auth

The recommended setup uses Supabase email magic-link auth.

Environment variables:

- `VITE_ADMIN_EMAIL_ALLOWLIST`
- `VITE_ADMIN_REDIRECT_URL`

This lets the app:

- send a magic link to an approved admin email
- restore a Supabase session in the browser
- unlock admin only for allowlisted email addresses

### Fallback mode: passcode

If email auth is not configured, the app can still use:

- `VITE_ADMIN_PASSCODE`

This is useful as a temporary fallback, but email auth is the stronger option.

## Current Priority Cities

The current product focus includes:

- New York City
- Jersey City
- Bethesda, Maryland
- Venice, Florida

The app now includes `My Cities` shortcuts for these places and added curated support for:

- Jersey City
- Bethesda
- Venice

## Current Curated Source Set

The source set currently includes:

- Sprudge
- Daily Coffee News
- European Coffee Trip
- CoffeeGeek
- Perfect Daily Grind
- Home-Barista
- Beanhunter
- Beanconqueror
- Roasters app
- Baristapp

## Operations Guide

### Local development

Run:

```powershell
npm run dev
```

### Production build

Run:

```powershell
npm run build
```

### Supabase seed

Run:

```powershell
npm run seed:supabase
```

### Important environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_ADMIN_EMAIL_ALLOWLIST`
- `VITE_ADMIN_REDIRECT_URL`
- `VITE_ADMIN_PASSCODE` optional fallback

## Known Limitations

- live place lookup depends on public third-party services
- curated coverage is still strongest in a limited set of cities
- admin editor currently supports add flows better than edit flows
- chain exclusion is rule-based rather than fully managed through admin
- live location quality can vary depending on browser and geocoding behavior

## Recommended Next Improvements

1. add edit and delete support in the admin panel
2. make chain exclusions editable in admin
3. expand curated coverage city by city
4. improve admin auditability and validation
5. consider moving more live lookups behind a backend for stability

## Suggested Documentation Set Later

As the app grows, it would make sense to split documentation into:

- product overview
- technical architecture
- admin operations guide
- data curation guide
- deployment guide
- roadmap

For now, this file is intended to be the single practical reference for the app.
