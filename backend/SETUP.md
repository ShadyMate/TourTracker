# Backend Setup Guide

## Quick Start

### Prerequisites
- Java 25 or higher
- Maven 3.6 or higher
- Git

### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. **Verify server is running**
   Navigate to: `http://localhost:8080/api/hello`
   
   Expected response: `TourTracker API is running!`

### API Documentation

Once the application is running, access the interactive API documentation:
- **Swagger UI**: http://localhost:8080/api/docs
- **API Endpoints**: See ARCHITECTURE.md for complete endpoint list

### Database Console (Development)

H2 Console is available at: `http://localhost:8080/api/h2-console`
- **JDBC URL**: `jdbc:h2:mem:tourtracker`
- **User**: `sa`
- **Password**: (leave empty)

### Logs

Application logs are stored in:
- **Console**: Real-time output
- **File logs**: `logs/tourtracker.log` (rotating daily)
- **Error logs**: `logs/tourtracker-error.log` (errors only)

### Configuration

Main configuration file: `src/main/resources/application.yml`

Key settings:
- Server port: `8080`
- API context path: `/api`
- Database: H2 (development)
- Logging level: INFO (root), DEBUG (application)

### Common Maven Commands

```bash
# Clean and build
mvn clean install

# Run tests
mvn test

# Run application
mvn spring-boot:run

# Package as JAR
mvn package

# Run packaged JAR
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Environment-Specific Profiles

Create environment-specific configurations:

**application-dev.yml** (for development)
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:tourtracker
```

**application-prod.yml** (for production)
```yaml
spring:
  datasource:
    url: jdbc:mysql://prod-server:3306/tourtracker
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

Then run with: `mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"`

## Architecture Overview

See **ARCHITECTURE.md** for detailed information about:
- Layer-based architecture (Presentation, Business, Data Access)
- Component structure
- Logging framework setup
- Configuration management
- Exception handling
- API endpoints

## Troubleshooting

### Port Already in Use
If port 8080 is already in use, change it in `application.yml`:
```yaml
server:
  port: 8081
```

### Database Issues
To reset the database, set `ddl-auto` to `create` (caution: deletes data):
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create
```

### Missing Dependencies
If Maven can't download dependencies:
```bash
mvn clean install -U  # -U forces update of snapshots
```

### Logs Not Appearing
Check `log4j2.xml` configuration and ensure `logs/` directory is writable.

## Next Steps

1. **Database Setup**: Switch from H2 to production database as needed
2. **Authentication**: Implement JWT or OAuth2 security
3. **Testing**: Add unit and integration tests
4. **Deployment**: Package and deploy to production server

---

For more details, see ARCHITECTURE.md
