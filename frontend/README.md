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

# Create the root .env (one level up) if you haven't already
cp ../.env.example ../.env
# → edit ../.env and set VITE_ORS_API_KEY, DB_*, and JWT_SECRET

# Start dev server (hot reload on http://localhost:4200)
npm start
```

The `npm start` command runs `load-env.js` first, which reads the root `.env`, filters to `VITE_`-prefixed variables only, and writes `public/env.json` so the API key is available at runtime without baking it into TypeScript source. DB credentials are never written to `public/env.json`.

## Structure

```
src/
├── app/
│   ├── app.routes.ts               # Route definitions (auth-guarded routes)
│   └── app.config.ts               # Angular providers (HttpClient + auth interceptor)
├── components/
│   └── location-autocomplete/      # Reusable geocoding input with dropdown
├── environments/
│   ├── environment.ts              # Dev config (backend + ORS URLs)
│   └── environment.prod.ts         # Prod config (same URLs, production flag)
├── guards/
│   └── auth.guard.ts               # CanActivateFn — guards /tour/:id, /settings, /account; redirects to /login
├── interceptors/
│   └── auth.interceptor.ts         # HttpInterceptorFn — attaches Authorization: Bearer header
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
    ├── auth.service.ts             # Login, register, logout; stores JWT in localStorage
    ├── tour.service.ts             # Tour + log CRUD → Spring Boot REST API
    ├── map.service.ts              # Leaflet init, ORS geocoding, ORS routing
    ├── config.service.ts           # ORS API key read/write
    └── storage.service.ts          # localStorage helpers
```

## Authentication

Authentication is JWT-based. The full flow:

1. User submits the login or register form on `/login`
2. `AuthService` calls `POST /api/auth/login` (or `/api/auth/register`)
3. The backend returns `{ token, id, username, email }` on success
4. `AuthService` stores the JWT in `localStorage` under `authToken` and the user profile under `currentUser`, then sets the reactive `isAuthenticated` signal to `true`
5. `authInterceptor` reads the token on every outgoing request and adds the header `Authorization: Bearer <token>` — except on the auth endpoints themselves
6. `authGuard` protects `/tour/:id`, `/settings`, and `/account`; the home page (`/`) is publicly accessible. Unauthenticated users who click **Add Tour** on the home page are redirected to `/login` instead
7. The login/register page includes a **← Back to Home** link so unauthenticated visitors can return to browse without signing in
8. Logout clears both localStorage keys and resets the signal, redirecting to `/login`

## Key design decisions

**Signals everywhere** — All component state uses Angular signals (`signal()`, `computed()`). `ChangeDetectionStrategy.OnPush` is set on every component; `markForCheck()` is called after async operations.

**Functional interceptor and guard** — Both `authInterceptor` and `authGuard` are plain functions (Angular 17+ `HttpInterceptorFn` / `CanActivateFn`), registered in `app.config.ts` via `provideHttpClient(withInterceptors([authInterceptor]))`. No class-based interceptors or `CanActivate` classes needed.

**JWT stored in localStorage** — The token is persisted so sessions survive page refresh. On startup, `AuthService` restores the user from `currentUser` in localStorage and marks the session as authenticated without requiring a new login.

**No userId in tour API calls** — The backend resolves the current user from the JWT on every request. `TourService` never sends a `userId` parameter; the interceptor's Bearer token is the only credential needed.

**Soft auth on home page** — The home route has no route guard so unauthenticated users can browse it freely. The `Add Tour` button is the only entry point to protected functionality; it checks `isLoggedIn()` and redirects to `/login` if the user has no active session. Tour detail, settings, and account routes remain fully guarded.

**Map div stays in DOM** — The Leaflet map container (`#tour-map`) is always rendered; loading and error states are absolutely-positioned overlays. This prevents Leaflet losing its DOM reference when Angular conditionally removes and recreates the element.

**Coordinates stored at selection time** — When a user picks a location from the autocomplete dropdown, `[lat, lng]` coordinates are saved alongside the label. On the tour detail view, `getRouteByCoords()` is called directly, skipping a second geocoding round-trip.

**Route geometry cached in the backend** — After ORS returns a route, `tour-map.component` emits a `routeLoaded` event with the full coordinate array. `tour-details.component` stores this as `routeGeometry` on the tour and includes it when saving. On subsequent opens, the saved geometry is rendered directly by Leaflet — no ORS call is made. Changing either location clears the cached geometry and triggers a fresh ORS fetch.

**ORS `/geojson` endpoint** — Both `getRoute()` and `getRouteByCoords()` POST to `/v2/directions/{profile}/geojson`. This returns coordinates as plain `[lng, lat]` arrays instead of encoded polylines, so no decoder is needed.

## API key configuration

All credentials live in a single **root `.env`** file (never committed). The flow differs by environment:

- **Docker**: `docker-compose.yml` reads `VITE_ORS_API_KEY` from root `.env` and passes it as a build argument. The Dockerfile writes it into a temporary `.env` inside the container before running `npm run build`.
- **Local dev**: `load-env.js` (run by `npm start` / `npm run build`) walks up from `frontend/scripts/` to find the root `.env`, then writes only `VITE_`-prefixed variables to `public/env.json`. The Angular app fetches this file at startup and stores the key in `localStorage`.

Users can also enter or update the key at runtime via the **Settings** page, where it is persisted to `localStorage`.
