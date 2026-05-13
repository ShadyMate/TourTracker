package org.example.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication
public class BackendApplication {
    private static final Logger logger = LoggerFactory.getLogger(BackendApplication.class);

    public static void main(String[] args) {
        logger.info("Starting TourTracker Backend Application...");
        try {
            SpringApplication app = new SpringApplication(BackendApplication.class);
            app.run(args);
            logger.info("");
            logger.info("╔══════════════════════════════════════════════════════╗");
            logger.info("║          TourTracker started successfully!           ║");
            logger.info("╠══════════════════════════════════════════════════════╣");
            logger.info("║  Frontend  →  http://localhost:4200/                 ║");
            logger.info("║  Backend   →  http://localhost:8080/api              ║");
            logger.info("║  API Docs  →  http://localhost:8080/api/docs         ║");
            logger.info("╚══════════════════════════════════════════════════════╝");
            logger.info("");
        } catch (Exception e) {
            logger.error("Failed to start TourTracker Backend Application", e);
            System.exit(1);
        }
    }
}
