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

## Current Source Set

Structured curated adapters included now:

- `Sprudge`
- `Daily Coffee News`
- `European Coffee Trip`
- `CoffeeGeek`

## Next Upgrade Options

1. Move live geocoding/places behind a small backend for more reliable API behavior
2. Add more curated coffee sources
3. Store curated records outside code in a database or content file
