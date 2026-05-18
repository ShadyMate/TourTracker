# TourTracker

A full-stack web application for planning and logging hiking, cycling, and walking tours. Users create tours with geocoded start/end locations, view interactive route maps, and keep a personal log of completed trips.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17+ · TypeScript · Leaflet · SCSS |
| Backend | Spring Boot 4 · Java 25 · Spring Security · JPA/Hibernate |
| Auth | JWT (JJWT 0.12) · BCrypt password hashing |
| Database | PostgreSQL 16 |
| Maps | OpenRouteService (geocoding + routing) · Leaflet |
| Infrastructure | Docker · Docker Compose · Nginx |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A free [OpenRouteService API key](https://openrouteservice.org/dev/#/signup)

## Setup

**1. Clone the repository**

```bash
git clone <your-repo-url>
cd TourTracker
```

**2. Create your environment file**

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Database
DB_NAME=tour_tracker
DB_USERNAME=your_pg_user
DB_PASSWORD=your_pg_password
DB_URL=jdbc:postgresql://postgres:5432/tour_tracker

# JWT — generate with: openssl rand -base64 48
JWT_SECRET=your_base64_encoded_secret_at_least_32_bytes

# OpenRouteService — get a free key at https://openrouteservice.org/dev/#/signup
VITE_ORS_API_KEY=your_ors_api_key_here
```

> `.env` is listed in `.gitignore` — your secrets will never be committed.

**3. Start the stack**

```bash
docker compose up --build
```

The first build takes a few minutes (Maven downloads dependencies, npm installs packages). On subsequent starts without code changes, drop `--build`.

**4. Open the app**

Once the backend logs the success banner, everything is ready:

```
╔══════════════════════════════════════════════════════╗
║          TourTracker started successfully!           ║
╠══════════════════════════════════════════════════════╣
║  Frontend  →  http://localhost:4200/                 ║
║  Backend   →  http://localhost:8080/api              ║
║  API Docs  →  http://localhost:8080/api/docs         ║
╚══════════════════════════════════════════════════════╝
```

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/api/docs |

## Features

- **Authentication** — Self-registration (email + username + password, all validated) and login with JWT; sessions are token-based (24 h expiry), passwords are BCrypt-hashed, and all tour data is strictly private to its creator. The home page is publicly visible; protected actions (Add Tour, tour details, settings) prompt unauthenticated users to log in
- **Tour management** — Create, edit, and delete tours with name, description, transport type, and estimated distance/time
- **Geocoding autocomplete** — Type a location and pick from live ORS suggestions; coordinates are stored so routes load instantly
- **Interactive maps** — Leaflet renders the full route using ORS directions; supports hiking, cycling, walking, and driving profiles. Route geometry is saved to the database on first load, so opening a saved tour never calls the external API again
- **Tour logs** — Record completed trips with date, start/end time, actual distance, difficulty (1–10), rating, and notes
- **Computed attributes** — Popularity and child-friendliness are derived automatically from tour logs
- **Dark mode** — Toggle between light and dark themes; preference is persisted

## Stopping and resetting

```bash
# Stop containers, keep data
docker compose down

# Stop containers and delete all data (full reset)
docker compose down -v
```

## Project layout

```
TourTracker/
├── docker-compose.yml
├── .env                  ← your secrets (gitignored)
├── frontend/             ← Angular app (see frontend/README.md)
└── backend/              ← Spring Boot API (see backend/README.md)
```
