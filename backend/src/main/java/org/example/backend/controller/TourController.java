package org.example.backend.controller;

import org.example.backend.dto.TourDto;
import org.example.backend.dto.TourLogDto;
import org.example.backend.service.TourService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Presentation Layer - TourController
 * Handles HTTP requests related to tours and their logs.
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

    // ── Tour CRUD ──────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<TourDto> createTour(@RequestBody TourDto tourDto,
                                              @RequestParam Long userId) {
        logger.info("POST /tours - Creating tour for user ID: {}", userId);
        TourDto created = tourService.createTour(tourDto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDto> getTourById(@PathVariable Long id) {
        logger.info("GET /tours/{}", id);
        return ResponseEntity.ok(tourService.getTourById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TourDto>> getUserTours(@PathVariable Long userId) {
        logger.info("GET /tours/user/{}", userId);
        return ResponseEntity.ok(tourService.getUserTours(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TourDto>> searchTours(@RequestParam Long userId,
                                                     @RequestParam String searchTerm) {
        logger.info("GET /tours/search - user: {} term: {}", userId, searchTerm);
        return ResponseEntity.ok(tourService.searchTours(userId, searchTerm));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourDto> updateTour(@PathVariable Long id,
                                              @RequestBody TourDto tourDto) {
        logger.info("PUT /tours/{}", id);
        return ResponseEntity.ok(tourService.updateTour(id, tourDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        logger.info("DELETE /tours/{}", id);
        tourService.deleteTour(id);
        return ResponseEntity.noContent().build();
    }

    // ── Tour Log CRUD ──────────────────────────────────────────────────────────

    @PostMapping("/{tourId}/logs")
    public ResponseEntity<TourLogDto> addLog(@PathVariable Long tourId,
                                             @RequestBody TourLogDto logDto) {
        logger.info("POST /tours/{}/logs", tourId);
        TourLogDto created = tourService.addTourLog(tourId, logDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{tourId}/logs/{logId}")
    public ResponseEntity<TourLogDto> updateLog(@PathVariable Long tourId,
                                                @PathVariable Long logId,
                                                @RequestBody TourLogDto logDto) {
        logger.info("PUT /tours/{}/logs/{}", tourId, logId);
        return ResponseEntity.ok(tourService.updateTourLog(tourId, logId, logDto));
    }

    @DeleteMapping("/{tourId}/logs/{logId}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long tourId,
                                          @PathVariable Long logId) {
        logger.info("DELETE /tours/{}/logs/{}", tourId, logId);
        tourService.deleteTourLog(tourId, logId);
        return ResponseEntity.noContent().build();
    }
}
