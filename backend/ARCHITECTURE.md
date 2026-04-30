# TourTracker Backend - Architecture Overview

## Project Structure

The backend follows a **layer-based architecture** with clear separation of concerns:

### 1. Presentation Layer (Controllers)
**Location:** `src/main/java/org/example/backend/controller/`

Handles HTTP requests and responses. Controllers delegate business logic to services.

- **IndexController**: Health check and info endpoints
- **TodoController**: REST endpoints for todo operations
- **UserController**: REST endpoints for user management (registration, retrieval)
- **TourController**: REST endpoints for tour operations

**Key Features:**
- Request validation and parameter extraction
- HTTP status code management
- Centralized logging via SLF4J

### 2. Business Layer (Services)
**Location:** `src/main/java/org/example/backend/service/`

Contains business logic and rules. Services coordinate between controllers and repositories.

**Service Interfaces:**
- `TodoService`: Operations for todo management
- `UserService`: User operations (registration, retrieval, deletion)
- `TourService`: Tour operations (CRUD, search)

**Service Implementations:** (`service/impl/`)
- All business logic is implemented here
- Includes transaction management
- Exception handling with custom exceptions
- Comprehensive logging for debugging

**Key Features:**
- Dependency injection via constructor
- Pure business logic separation
- Data validation and business rules enforcement
- Custom exception handling

### 3. Data Access Layer (Repositories)
**Location:** `src/main/java/org/example/backend/repository/`

Handles all database interactions using Spring Data JPA.

**Repositories:**
- `UserRepository`: JpaRepository for User entity with custom queries
- `TourRepository`: JpaRepository for Tour entity with search functionality
- `TourLogRepository`: JpaRepository for TourLog entity

**Key Features:**
- Extends `JpaRepository` for CRUD operations
- Custom query methods using `@Query` annotation
- No raw SQL - uses Spring Data specifications

### 4. Model/Entity Layer
**Location:** `src/main/java/org/example/backend/model/`

JPA entities mapped to database tables.

- **User**: User account information
- **Tour**: Tour details and route information
- **TourLog**: Logs of tour executions

**Features:**
- JPA annotations for ORM mapping
- Lombok for reducing boilerplate
- Automatic timestamp management (@PrePersist)

### 5. Data Transfer Objects (DTOs)
**Location:** `src/main/java/org/example/backend/dto/`

Separate objects for API communication.

- **UserDto**: User information for API responses
- **TourDto**: Tour information for API responses
- **TourLogDto**: Tour log information for API responses
- **TodoDto**: Todo information for API responses

## Configuration Management

### External Configuration
Configuration is separated from source code via `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:tourtracker
    driverClassName: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: update
```

### Application Properties Class
`src/main/java/org/example/backend/config/ApplicationProperties.java`

- Centralizes configuration management
- Type-safe configuration properties
- Easy switching between environments
- No hardcoded values in code

**Properties managed:**
- Database connection settings
- Logging configuration
- Server settings (port, context path)

## Logging Framework

### Log4j2 Configuration
**Location:** `src/main/resources/log4j2.xml`

Comprehensive logging setup with:

- **Console Appender**: Real-time log output to console
- **File Appender**: Rolling file appender (10MB size limit, 30-day retention)
- **Error File Appender**: Separate error log file
- **Log Levels**: Configurable per package
  - `root`: INFO
  - `org.example.backend`: DEBUG
  - `org.springframework.web`: INFO
  - `org.springframework.security`: DEBUG
  - `org.hibernate.SQL`: DEBUG

### Logging Usage
All components use SLF4J:
```java
private static final Logger logger = LoggerFactory.getLogger(ClassName.class);

logger.info("User registered successfully with ID: {}", userId);
logger.debug("Processing request with parameters: {}", params);
logger.warn("Business rule violation: {}", message);
logger.error("Error occurred", exception);
```

## Exception Handling

### Custom Exceptions
1. **ResourceNotFoundException**: Used when entities are not found
2. **BusinessRuleException**: Used for business logic violations

### Global Exception Handler
`src/main/java/org/example/backend/exception/GlobalExceptionHandler.java`

- Centralized exception handling
- Consistent error responses across API
- Automatic logging of all exceptions
- Custom `ErrorResponse` DTO for error messages

## API Structure

All API endpoints are prefixed with `/api` (configurable via `server.servlet.context-path`)

### Example Endpoints:

**Todos:**
- `POST /api/todos` - Create
- `GET /api/todos/{id}` - Read
- `GET /api/todos` - List all
- `PUT /api/todos/{id}` - Update
- `DELETE /api/todos/{id}` - Delete

**Users:**
- `POST /api/users/register` - Register new user
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/username/{username}` - Get user by username
- `DELETE /api/users/{id}` - Delete user

**Tours:**
- `POST /api/tours?userId={userId}` - Create tour
- `GET /api/tours/{id}` - Get tour by ID
- `GET /api/tours/user/{userId}` - Get all user tours
- `GET /api/tours/search?userId={userId}&searchTerm={term}` - Search tours
- `PUT /api/tours/{id}` - Update tour
- `DELETE /api/tours/{id}` - Delete tour

**Health:**
- `GET /api/hello` - Health check
- `GET /api/health` - Health status

## Dependency Injection

The application uses Spring's constructor injection pattern:

```java
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

This makes dependencies explicit and testable.

## Database

### Default Configuration (H2)
For development and testing, the application uses H2 in-memory database:
- **URL**: `jdbc:h2:mem:tourtracker`
- **Console**: Available at `http://localhost:8080/api/h2-console`
- **Hibernate**: Auto-creates tables on startup (`ddl-auto: update`)

### Production Switching
To switch to a different database (e.g., MySQL), simply update `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tourtracker
    driverClassName: com.mysql.cj.jdbc.Driver
    username: root
    password: password
```

## Build & Run

### Build
```bash
mvn clean install
```

### Run
```bash
mvn spring-boot:run
```

### Test
```bash
mvn test
```

## Documentation

API documentation is available via Swagger UI:
- **Swagger UI**: `http://localhost:8080/api/docs`
- **OpenAPI JSON**: `http://localhost:8080/api/api-docs`

---

## Summary

This architecture provides:
✅ **Clear separation of concerns** - Each layer has a specific responsibility  
✅ **Easy testing** - Layers can be tested independently  
✅ **Maintainability** - Changes are isolated to specific layers  
✅ **Scalability** - New features can be added without affecting existing code  
✅ **Logging** - Comprehensive logging via Log4j2  
✅ **Configuration Management** - Externalized configuration  
✅ **Error Handling** - Consistent, centralized exception handling  
✅ **Type Safety** - Strong typing throughout the application  
