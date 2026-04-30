package org.example.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Presentation Layer - IndexController
 * Handles basic health check and info endpoints.
 */
@RestController
public class IndexController {
    private static final Logger logger = LoggerFactory.getLogger(IndexController.class);

    public IndexController() {
        logger.info("Initializing IndexController");
    }

    @GetMapping("/hello")
    public String hello() {
        logger.info("GET /hello - Health check endpoint");
        return "TourTracker API is running!";
    }

    @GetMapping("/health")
    public String health() {
        logger.info("GET /health - Health check endpoint");
        return "OK";
    }
}
