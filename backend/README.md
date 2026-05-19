# TourTracker — Backend

Spring Boot 4 REST API with JWT-based authentication, PostgreSQL, and Flyway migrations.

## Tech stack

- **Spring Boot 4.0.6** · Java 25
- **Spring Security 6** — stateless JWT authentication
- **JJWT 0.12.6** — JWT generation and validation (HMAC-SHA256)
- **BCrypt** — password hashing via Spring Security's `BCryptPasswordEncoder`
- **Spring Data JPA** + Hibernate (`ddl-auto: none` — Flyway owns the schema)
- **Bean Validation (Hibernate Validator)** — server-side input validation on all tour and log fields
- **Flyway** for database migrations (explicit `@Bean`, not autoconfiguration)
- **PostgreSQL 16** as the database
- **Lombok** to reduce boilerplate
- **Log4j2** for structured logging
- **springdoc-openapi** for Swagger UI

## Running locally (without Docker)

You need a running PostgreSQL instance and Java 25.

```bash
export DB_URL=jdbc:postgresql://localhost:5432/tour_tracker
export DB_USERNAME=your_pg_user
export DB_PASSWORD=your_pg_password
export JWT_SECRET=<base64-encoded-secret-at-least-32-bytes>

cd backend
./mvnw spring-boot:run
```

The application starts on port `8080` with context path `/api`.

## Layer architecture

```
controller/      Presentation layer — HTTP endpoints, request/response mapping
  AuthController   POST /auth/login, /auth/register (public)
  TourController   full tour + log CRUD (authenticated)
  ImageController  GET /images/{filename} (public)
service/         Business layer — interfaces + impl/ with business logic
  AuthService      login, register, JWT issuance, password hashing
  TourService      tour + tour-log CRUD, image path management
  ImageStorageService  filesystem write/delete/resolve
  impl/
repository/      Data access layer — Spring Data JPA repositories
model/           JPA entities (User, Tour, TourLog) + UserPrincipal record
dto/             Data transfer objects (AuthResponse, LoginRequest, UserDto, TourDto, TourLogDto)
config/          Spring configuration beans (CorsConfig, FlywayConfig, SecurityConfig, StorageProperties)
security/        JWT utilities (JwtUtils, JwtAuthFilter)
exception/       GlobalExceptionHandler + custom exceptions
```

## Authentication flow

1. Client calls `POST /api/auth/register` or `POST /api/auth/login`
2. On success, the server returns an `AuthResponse` containing a signed JWT valid for 24 hours
3. Client stores the token and attaches it as `Authorization: Bearer <token>` on every subsequent request
4. `JwtAuthFilter` validates the token, extracts `userId` + `username` from the JWT claims, and stores a `UserPrincipal` in the Spring Security context — **no database round-trip per request**
5. Tour and log endpoints read the `userId` from the security context; no userId is accepted as a request parameter, so cross-user access is impossible at the API level

## Database migrations

Flyway migrations live in `src/main/resources/db/migration/`:

| Version | File | Description |
|---|---|---|
| V1 | `V1__init.sql` | Creates `users`, `tours`, `tour_logs` tables |
| V2 | `V2__add_tour_extras.sql` | Adds coordinate columns, time strings, widens difficulty/rating |
| V3 | `V3__add_route_geometry.sql` | Adds `route_geometry TEXT` column to `tours` for cached ORS polyline data |
| V4 | `V4__add_map_image_path.sql` | Adds `map_image_path VARCHAR(512)` column to `tours` for filesystem image path |

Flyway is configured explicitly in `FlywayConfig.java` (Spring Boot 4's autoconfiguration order caused it not to run before JPA initialization, so a manual `@Bean` is used instead).

> **Note:** passwords are now stored as BCrypt hashes. Any user created before this change (plain-text password) must re-register.

## API endpoints

All routes are prefixed with `/api` (Spring `server.servlet.context-path`).

### Auth (public — no token required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user; validates email format and unique username; returns `{ token, id, username, email }` |
| `POST` | `/auth/login` | Authenticate; returns `{ token, id, username, email }` or 401 |

### Tours (requires valid JWT — scoped to the authenticated user)

| Method | Path | Description |
|---|---|---|
| `POST` | `/tours` | Create a tour — all fields validated; `transportType` must be one of `hiking`, `cycling`, `walking`, `driving` |
| `GET` | `/tours` | List all tours owned by the current user |
| `GET` | `/tours/{id}` | Get a tour by ID (ownership enforced) |
| `GET` | `/tours/search?searchTerm={q}` | Full-text search across name, description, start/end location, and log notes (case-insensitive) |
| `PUT` | `/tours/{id}` | Update tour — all fields validated (ownership enforced) |
| `DELETE` | `/tours/{id}` | Delete tour; also removes associated map image from filesystem |
| `POST` | `/tours/{id}/map-image` | Upload a map image (`multipart/form-data`, field: `file`); replaces existing image; returns updated tour |

### Images (public — no token required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/images/{filename}` | Serve a stored tour map image with correct `Content-Type` |

### Tour Logs (requires valid JWT — ownership enforced via parent tour)

| Method | Path | Description |
|---|---|---|
| `GET` | `/tours/{tourId}/logs` | List all log entries for a tour |
| `POST` | `/tours/{tourId}/logs` | Add a log entry — all fields validated |
| `PUT` | `/tours/{tourId}/logs/{logId}` | Update a log entry — all fields validated |
| `DELETE` | `/tours/{tourId}/logs/{logId}` | Delete a log entry |

Interactive documentation: **http://localhost:8080/api/docs**

## Configuration

Environment variables with defaults (for local dev without Docker):

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/tour_tracker` | JDBC connection URL |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | *(empty)* | Database password |
| `JWT_SECRET` | built-in dev key | Base64-encoded HMAC-SHA256 signing key — **always override in production** |
| `IMAGE_DIR` | `./tour-images` | Filesystem directory where uploaded tour map images are stored |

In Docker, these are injected by `docker-compose.yml` from the root `.env` file into the `backend` service. See the root `.env.example` for the full list of required variables.

## Logging

Log4j2 is configured in `src/main/resources/log4j2.xml`. Logs are written to:
- **Console** — all levels ≥ INFO
- **`logs/tourtracker.log`** — rolling daily, 30-day retention
- **`logs/tourtracker-error.log`** — errors only
