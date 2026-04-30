package org.example.backend.controller;

import org.example.backend.dto.TourDto;
import org.example.backend.service.TourService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Presentation Layer - TourController
 * Handles HTTP requests related to tours.
 */
@RestController
@RequestMapping("/tours")
public class TourController {
    private static final Logger logger = LoggerFactory.getLogger(TourController.class);
    private final TourService tourService;

    public TourController(TourService tourService) {
        this.tourService = tourService;
        logger.info("Initializing TourController");
    }

    @PostMapping
    public ResponseEntity<TourDto> createTour(@RequestBody TourDto tourDto, 
                                               @RequestParam Long userId) {
        logger.info("POST /tours - Creating new tour for user ID: {}", userId);
        try {
            TourDto created = tourService.createTour(tourDto, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            logger.error("Error creating tour for user ID: {}", userId, e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDto> getTourById(@PathVariable Long id) {
        logger.info("GET /tours/{} - Retrieving tour", id);
        try {
            TourDto tour = tourService.getTourById(id);
            return ResponseEntity.ok(tour);
        } catch (Exception e) {
            logger.error("Error retrieving tour with ID: {}", id, e);
            throw e;
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TourDto>> getUserTours(@PathVariable Long userId) {
        logger.info("GET /tours/user/{} - Retrieving all tours for user", userId);
        try {
            List<TourDto> tours = tourService.getUserTours(userId);
            return ResponseEntity.ok(tours);
        } catch (Exception e) {
            logger.error("Error retrieving tours for user ID: {}", userId, e);
            throw e;
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<TourDto>> searchTours(@RequestParam Long userId, 
                                                      @RequestParam String searchTerm) {
        logger.info("GET /tours/search - Searching tours for user ID: {} with term: {}", userId, searchTerm);
        try {
            List<TourDto> tours = tourService.searchTours(userId, searchTerm);
            return ResponseEntity.ok(tours);
        } catch (Exception e) {
            logger.error("Error searching tours", e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourDto> updateTour(@PathVariable Long id, @RequestBody TourDto tourDto) {
        logger.info("PUT /tours/{} - Updating tour", id);
        try {
            TourDto updated = tourService.updateTour(id, tourDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating tour with ID: {}", id, e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        logger.info("DELETE /tours/{} - Deleting tour", id);
        try {
            tourService.deleteTour(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting tour with ID: {}", id, e);
            throw e;
        }
    }
}
