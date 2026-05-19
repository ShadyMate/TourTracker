package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.dto.TourDto;
import org.example.backend.dto.TourLogDto;
import org.example.backend.model.UserPrincipal;
import org.example.backend.service.ImageStorageService;
import org.example.backend.service.TourService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Presentation Layer - TourController
 * All endpoints are protected; userId is always derived from the validated JWT principal
 * so clients cannot impersonate another user by supplying a different ID.
 */
@RestController
@RequestMapping("/tours")
public class TourController {
    private static final Logger logger = LoggerFactory.getLogger(TourController.class);
    private final TourService tourService;
    private final ImageStorageService imageStorageService;

    public TourController(TourService tourService, ImageStorageService imageStorageService) {
        this.tourService = tourService;
        this.imageStorageService = imageStorageService;
        logger.info("Initializing TourController");
    }

    // ── Tour CRUD ──────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<TourDto> createTour(@Valid @RequestBody TourDto tourDto, Authentication auth) {
        Long userId = userId(auth);
        logger.info("POST /tours - user {}", userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(tourService.createTour(tourDto, userId));
    }

    @GetMapping
    public ResponseEntity<List<TourDto>> getUserTours(Authentication auth) {
        Long userId = userId(auth);
        logger.info("GET /tours - user {}", userId);
        return ResponseEntity.ok(tourService.getUserTours(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDto> getTourById(@PathVariable Long id, Authentication auth) {
        logger.info("GET /tours/{}", id);
        return ResponseEntity.ok(tourService.getTourById(id, userId(auth)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TourDto>> searchTours(@RequestParam String searchTerm, Authentication auth) {
        Long userId = userId(auth);
        logger.info("GET /tours/search - user {} term '{}'", userId, searchTerm);
        return ResponseEntity.ok(tourService.searchTours(userId, searchTerm));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourDto> updateTour(@PathVariable Long id,
                                              @Valid @RequestBody TourDto tourDto,
                                              Authentication auth) {
        logger.info("PUT /tours/{}", id);
        return ResponseEntity.ok(tourService.updateTour(id, tourDto, userId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id, Authentication auth) {
        logger.info("DELETE /tours/{}", id);
        tourService.deleteTour(id, userId(auth));
        return ResponseEntity.noContent().build();
    }

    // ── Map image upload ───────────────────────────────────────────────────────

    /**
     * Upload a map image for a tour (multipart/form-data, field name "file").
     * The previous image is deleted from the filesystem before the new one is stored.
     * Returns the updated tour with the new mapImagePath populated.
     */
    @PostMapping("/{id}/map-image")
    public ResponseEntity<TourDto> uploadMapImage(@PathVariable Long id,
                                                  @RequestParam MultipartFile file,
                                                  Authentication auth) {
        Long userId = userId(auth);
        logger.info("POST /tours/{}/map-image - user {}", id, userId);

        String existing = tourService.getMapImagePath(id, userId);
        if (existing != null) {
            imageStorageService.delete(existing);
        }

        String filename = imageStorageService.store(file);
        return ResponseEntity.ok(tourService.setMapImage(id, filename, userId));
    }

    // ── Tour Log CRUD ──────────────────────────────────────────────────────────

    @GetMapping("/{tourId}/logs")
    public ResponseEntity<List<TourLogDto>> getLogs(@PathVariable Long tourId, Authentication auth) {
        logger.info("GET /tours/{}/logs", tourId);
        return ResponseEntity.ok(tourService.getLogsForTour(tourId, userId(auth)));
    }

    @PostMapping("/{tourId}/logs")
    public ResponseEntity<TourLogDto> addLog(@PathVariable Long tourId,
                                             @Valid @RequestBody TourLogDto logDto,
                                             Authentication auth) {
        logger.info("POST /tours/{}/logs", tourId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tourService.addTourLog(tourId, logDto, userId(auth)));
    }

    @PutMapping("/{tourId}/logs/{logId}")
    public ResponseEntity<TourLogDto> updateLog(@PathVariable Long tourId,
                                                @PathVariable Long logId,
                                                @Valid @RequestBody TourLogDto logDto,
                                                Authentication auth) {
        logger.info("PUT /tours/{}/logs/{}", tourId, logId);
        return ResponseEntity.ok(tourService.updateTourLog(tourId, logId, logDto, userId(auth)));
    }

    @DeleteMapping("/{tourId}/logs/{logId}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long tourId,
                                          @PathVariable Long logId,
                                          Authentication auth) {
        logger.info("DELETE /tours/{}/logs/{}", tourId, logId);
        tourService.deleteTourLog(tourId, logId, userId(auth));
        return ResponseEntity.noContent().build();
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    private Long userId(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).id();
    }
}
