# TourTracker

A full-stack web application for planning and logging hiking, cycling, and walking tours. Users create tours with geocoded start/end locations, view interactive route maps, and keep a personal log of completed trips.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17+ · TypeScript · Leaflet · SCSS |
| Backend | Spring Boot 4 · Java 25 · JPA/Hibernate |
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
cp frontend/.env.example .env
```

Open `.env` and replace the placeholder with your ORS API key:

```env
ORS_API_KEY=your_actual_api_key_here
```

> `.env` is listed in `.gitignore` — your key will never be committed.

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

- **Authentication** — Register and log in; each user's tours are private
- **Tour management** — Create, edit, and delete tours with name, description, transport type, and estimated distance/time
- **Geocoding autocomplete** — Type a location and pick from live ORS suggestions; coordinates are stored so routes load instantly
- **Interactive maps** — Leaflet renders the full route using ORS directions; supports hiking, cycling, walking, and driving profiles
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
