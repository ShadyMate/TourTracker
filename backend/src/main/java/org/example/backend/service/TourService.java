package org.example.backend.service;

import org.example.backend.dto.TourDto;
import org.example.backend.dto.TourLogDto;
import java.util.List;

/**
 * Business Layer - TourService Interface
 * Defines operations for managing tours and their logs.
 */
public interface TourService {
    TourDto createTour(TourDto tourDto, Long userId);
    TourDto getTourById(Long id);
    List<TourDto> getUserTours(Long userId);
    List<TourDto> searchTours(Long userId, String searchTerm);
    TourDto updateTour(Long id, TourDto tourDto);
    void deleteTour(Long id);

    // Tour Log operations
    TourLogDto addTourLog(Long tourId, TourLogDto logDto);
    TourLogDto updateTourLog(Long tourId, Long logId, TourLogDto logDto);
    void deleteTourLog(Long tourId, Long logId);
}
