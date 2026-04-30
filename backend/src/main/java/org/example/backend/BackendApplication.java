package org.example.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.example.backend.config.ApplicationProperties;

/**
 * Spring Boot Application Entry Point
 * Initializes the TourTracker Backend Application with layer-based architecture:
 * - Presentation Layer: Controllers (REST endpoints)
 * - Business Layer: Services (business logic)
 * - Data Access Layer: Repositories (database operations)
 * 
 * Configuration is externalized via application.yml
 * Logging is configured via log4j2.xml
 */
@SpringBootApplication
@EnableConfigurationProperties(ApplicationProperties.class)
public class BackendApplication {
    private static final Logger logger = LoggerFactory.getLogger(BackendApplication.class);

    public static void main(String[] args) {
        logger.info("Starting TourTracker Backend Application...");
        try {
            SpringApplication app = new SpringApplication(BackendApplication.class);
            app.run(args);
            logger.info("TourTracker Backend Application started successfully!");
        } catch (Exception e) {
            logger.error("Failed to start TourTracker Backend Application", e);
            System.exit(1);
        }
    }
}
