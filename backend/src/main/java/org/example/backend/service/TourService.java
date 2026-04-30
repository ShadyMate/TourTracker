package org.example.backend.service;

import org.example.backend.dto.TourDto;
import java.util.List;

/**
 * Business Layer - TourService Interface
 * Defines operations for managing tours.
 */
public interface TourService {
    TourDto createTour(TourDto tourDto, Long userId);
    TourDto getTourById(Long id);
    List<TourDto> getUserTours(Long userId);
    List<TourDto> searchTours(Long userId, String searchTerm);
    TourDto updateTour(Long id, TourDto tourDto);
    void deleteTour(Long id);
}
