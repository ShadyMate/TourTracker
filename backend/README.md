# TourTracker — Backend

Spring Boot 4 REST API with PostgreSQL, managed by Flyway migrations.

## Tech stack

- **Spring Boot 4.0.6** · Java 25
- **Spring Data JPA** + Hibernate (ddl-auto: none — Flyway owns the schema)
- **Flyway** for database migrations (explicit `@Bean`, not autoconfiguration)
- **PostgreSQL 16** as the database
- **Lombok** to reduce boilerplate
- **Log4j2** for structured logging
- **springdoc-openapi** for Swagger UI

## Running locally (without Docker)

You need a running PostgreSQL instance and Java 25.

```bash
# Set environment variables (or export them in your shell)
export DB_URL=jdbc:postgresql://localhost:5432/tour_tracker
export DB_USERNAME=your_pg_user
export DB_PASSWORD=your_pg_password

cd backend
./mvnw spring-boot:run
```

The application starts on port `8080` with context path `/api`.

## Layer architecture

```
controller/      Presentation layer — HTTP endpoints, request/response mapping
service/         Business layer — interfaces + impl/ with business logic
  impl/
repository/      Data access layer — Spring Data JPA repositories
model/           JPA entities (User, Tour, TourLog)
dto/             Data transfer objects (UserDto, TourDto, TourLogDto, LoginRequest)
config/          Spring configuration beans (CorsConfig, FlywayConfig, ApplicationProperties)
exception/       GlobalExceptionHandler + custom exceptions
```

## Database migrations

Flyway migrations live in `src/main/resources/db/migration/`:

| Version | File | Description |
|---|---|---|
| V1 | `V1__init.sql` | Creates `users`, `tours`, `tour_logs` tables |
| V2 | `V2__add_tour_extras.sql` | Adds coordinate columns, time strings, widens difficulty/rating |

Flyway is configured explicitly in `FlywayConfig.java` (Spring Boot 4's autoconfiguration order caused it not to run before JPA initialization, so a manual `@Bean` is used instead).

## API endpoints

All routes are prefixed with `/api` (Spring `server.servlet.context-path`).

### Users
| Method | Path | Description |
|---|---|---|
| `POST` | `/users/register` | Register a new user |
| `POST` | `/users/login` | Authenticate (returns UserDto or 401) |
| `GET` | `/users/{id}` | Get user by ID |
| `DELETE` | `/users/{id}` | Delete user |

### Tours
| Method | Path | Description |
|---|---|---|
| `POST` | `/tours?userId={id}` | Create a tour |
| `GET` | `/tours/{id}` | Get tour by ID (includes logs) |
| `GET` | `/tours/user/{userId}` | List all tours for a user |
| `GET` | `/tours/search?userId={id}&searchTerm={q}` | Full-text search |
| `PUT` | `/tours/{id}` | Update tour |
| `DELETE` | `/tours/{id}` | Delete tour |

### Tour Logs
| Method | Path | Description |
|---|---|---|
| `POST` | `/tours/{tourId}/logs` | Add a log entry |
| `PUT` | `/tours/{tourId}/logs/{logId}` | Update a log entry |
| `DELETE` | `/tours/{tourId}/logs/{logId}` | Delete a log entry |

Interactive documentation: **http://localhost:8080/api/docs**

## Configuration

Environment variables with defaults (for local dev without Docker):

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/tour_tracker` | JDBC connection URL |
| `DB_USERNAME` | `luisbohler` | Database user |
| `DB_PASSWORD` | *(empty)* | Database password |

In Docker these are set by `docker-compose.yml` pointing to the `postgres` service.

## Logging

Log4j2 is configured in `src/main/resources/log4j2.xml`. Logs are written to:
- **Console** — all levels ≥ INFO
- **`logs/tourtracker.log`** — rolling daily, 30-day retention
- **`logs/tourtracker-error.log`** — errors only
