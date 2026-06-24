package org.example.backend.service;

import org.example.backend.dto.TourDto;
import org.example.backend.dto.TourLogDto;

import java.util.List;

/**
 * Business Layer - TourService Interface
 * All operations take a userId so ownership is enforced at the service layer.
 */
public interface TourService {
    TourDto createTour(TourDto tourDto, Long userId);
    TourDto getTourById(Long id, Long userId);
    List<TourDto> getUserTours(Long userId);
    /**
     * Full-text search over a user's tours (incl. computed attributes and log notes),
     * optionally sorted. {@code sort} is a field+direction token e.g. "ratingDesc";
     * userLat/userLng are only required for the "distanceFromUser" sort.
     */
    List<TourDto> searchTours(Long userId, String searchTerm, String sort, Double userLat, Double userLng);
    TourDto updateTour(Long id, TourDto tourDto, Long userId);
    void deleteTour(Long id, Long userId);

    List<TourLogDto> getLogsForTour(Long tourId, Long userId);
    TourLogDto addTourLog(Long tourId, TourLogDto logDto, Long userId);
    TourLogDto updateTourLog(Long tourId, Long logId, TourLogDto logDto, Long userId);
    void deleteTourLog(Long tourId, Long logId, Long userId);

    /** Persist the filename of a newly uploaded image and return the updated tour. */
    TourDto setImage(Long tourId, String filename, Long userId);

    /** Return the current imagePath for a tour, or null if none is set. */
    String getImagePath(Long tourId, Long userId);
}
