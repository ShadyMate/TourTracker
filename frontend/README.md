# TourTracker — Frontend

Angular 17+ single-page application served by Nginx inside Docker.

## Tech stack

- **Angular 17+** with standalone components and signals
- **TypeScript** with strict mode
- **Leaflet** for interactive maps
- **OpenRouteService** for geocoding autocomplete and routing
- **SCSS** for styling (no Tailwind, component-scoped styles)
- **RxJS** for debounced autocomplete streams

## Local development (without Docker)

```bash
# Install dependencies
npm install

# Create a local .env with your ORS API key
cp .env.example .env
# → edit .env and set VITE_ORS_API_KEY=your_key

# Start dev server (hot reload on http://localhost:4200)
npm start
```

The `npm run build` command runs `load-env.js` first, which reads `.env` and writes `public/env.json` so the API key is available at runtime without baking it into TypeScript source.

## Structure

```
src/
├── app/
│   ├── app.routes.ts               # Route definitions
│   └── app.config.ts               # Angular providers
├── components/
│   └── location-autocomplete/      # Reusable geocoding input with dropdown
├── environments/
│   ├── environment.ts              # Dev config (backend + ORS URLs)
│   └── environment.prod.ts         # Prod config (same URLs, production flag)
├── models/
│   ├── tour.model.ts               # Tour and TourLog interfaces
│   └── user.model.ts               # User interface
├── pages/
│   ├── home/                       # Tour list sidebar + location map
│   ├── login/                      # Login + register (single page, toggle)
│   ├── tour-details/               # Tour info panel, route map, log entries
│   │   ├── tour-details.component  # Parent with edit/save logic
│   │   └── tour-map.component      # Leaflet map (always in DOM, overlay states)
│   ├── account/                    # User account settings
│   └── settings/                   # App preferences (dark mode, API key)
└── services/
    ├── auth.service.ts             # Login, register, session (localStorage)
    ├── tour.service.ts             # Tour + log CRUD → Spring Boot REST API
    ├── map.service.ts              # Leaflet init, ORS geocoding, ORS routing
    ├── config.service.ts           # ORS API key read/write
    └── storage.service.ts          # localStorage helpers
```

## Key design decisions

**Signals everywhere** — All component state uses Angular signals (`signal()`, `computed()`). `ChangeDetectionStrategy.OnPush` is set on every component; `markForCheck()` is called after async operations.

**Map div stays in DOM** — The Leaflet map container (`#tour-map`) is always rendered; loading and error states are absolutely-positioned overlays. This prevents Leaflet losing its DOM reference when Angular conditionally removes and recreates the element.

**Coordinates stored at selection time** — When a user picks a location from the autocomplete dropdown, `[lat, lng]` coordinates are saved alongside the label. On the tour detail view, `getRouteByCoords()` is called directly, skipping a second geocoding round-trip.

**ORS `/geojson` endpoint** — Both `getRoute()` and `getRouteByCoords()` POST to `/v2/directions/{profile}/geojson`. This returns coordinates as plain `[lng, lat]` arrays instead of encoded polylines, so no decoder is needed.

## API key configuration

In Docker, the key is injected as a build argument (`ORS_API_KEY`) passed from `docker-compose.yml`, which reads it from the root `.env` file. The Dockerfile writes it into `frontend/.env` before running `npm run build`.

For local development, create `frontend/.env`:
```env
VITE_ORS_API_KEY=your_key_here
```

Users can also enter or update the key at runtime via the **Settings** page, where it is persisted to `localStorage`.
