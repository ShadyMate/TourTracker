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
    List<TourDto> searchTours(Long userId, String searchTerm);
    TourDto updateTour(Long id, TourDto tourDto, Long userId);
    void deleteTour(Long id, Long userId);

    TourLogDto addTourLog(Long tourId, TourLogDto logDto, Long userId);
    TourLogDto updateTourLog(Long tourId, Long logId, TourLogDto logDto, Long userId);
    void deleteTourLog(Long tourId, Long logId, Long userId);
}
