package org.example.backend.service.impl;

import org.example.backend.dto.TourDto;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.Tour;
import org.example.backend.model.User;
import org.example.backend.repository.TourRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.TourService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business Layer Implementation - TourService
 * Contains business logic for managing tours.
 */
@Service
public class TourServiceImpl implements TourService {
    private static final Logger logger = LoggerFactory.getLogger(TourServiceImpl.class);
    private final TourRepository tourRepository;
    private final UserRepository userRepository;

    public TourServiceImpl(TourRepository tourRepository, UserRepository userRepository) {
        this.tourRepository = tourRepository;
        this.userRepository = userRepository;
        logger.info("Initializing TourService");
    }

    @Override
    public TourDto createTour(TourDto tourDto, Long userId) {
        logger.debug("Creating new tour for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("User not found for tour creation - ID: {}", userId);
                    return new ResourceNotFoundException("User not found");
                });

        Tour tour = new Tour();
        tour.setName(tourDto.getName());
        tour.setDescription(tourDto.getDescription());
        tour.setStartLocation(tourDto.getStartLocation());
        tour.setEndLocation(tourDto.getEndLocation());
        tour.setTransportType(tourDto.getTransportType());
        tour.setDistance(tourDto.getDistance());
        tour.setEstimatedTime(tourDto.getEstimatedTime());
        tour.setUser(user);

        Tour savedTour = tourRepository.save(tour);
        logger.info("Tour created successfully with ID: {}", savedTour.getId());

        return mapToDto(savedTour);
    }

    @Override
    public TourDto getTourById(Long id) {
        logger.debug("Fetching tour with ID: {}", id);
        return tourRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> {
                    logger.warn("Tour not found - ID: {}", id);
                    return new ResourceNotFoundException("Tour not found");
                });
    }

    @Override
    public List<TourDto> getUserTours(Long userId) {
        logger.debug("Fetching all tours for user ID: {}", userId);
        if (!userRepository.existsById(userId)) {
            logger.warn("User not found - ID: {}", userId);
            throw new ResourceNotFoundException("User not found");
        }
        List<Tour> tours = tourRepository.findByUserId(userId);
        logger.info("Found {} tours for user ID: {}", tours.size(), userId);
        return tours.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<TourDto> searchTours(Long userId, String searchTerm) {
        logger.debug("Searching tours for user ID: {} with term: {}", userId, searchTerm);
        List<Tour> tours = tourRepository.searchToursByName(userId, searchTerm);
        logger.info("Found {} tours matching search term: {}", tours.size(), searchTerm);
        return tours.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public TourDto updateTour(Long id, TourDto tourDto) {
        logger.debug("Updating tour with ID: {}", id);
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Tour not found for update - ID: {}", id);
                    return new ResourceNotFoundException("Tour not found");
                });

        tour.setName(tourDto.getName());
        tour.setDescription(tourDto.getDescription());
        tour.setStartLocation(tourDto.getStartLocation());
        tour.setEndLocation(tourDto.getEndLocation());
        tour.setTransportType(tourDto.getTransportType());
        tour.setDistance(tourDto.getDistance());
        tour.setEstimatedTime(tourDto.getEstimatedTime());

        Tour updatedTour = tourRepository.save(tour);
        logger.info("Tour with ID: {} updated successfully", id);

        return mapToDto(updatedTour);
    }

    @Override
    public void deleteTour(Long id) {
        logger.debug("Deleting tour with ID: {}", id);
        if (!tourRepository.existsById(id)) {
            logger.warn("Tour not found for deletion - ID: {}", id);
            throw new ResourceNotFoundException("Tour not found");
        }
        tourRepository.deleteById(id);
        logger.info("Tour with ID: {} deleted successfully", id);
    }

    private TourDto mapToDto(Tour tour) {
        return new TourDto(
                tour.getId(),
                tour.getName(),
                tour.getDescription(),
                tour.getStartLocation(),
                tour.getEndLocation(),
                tour.getTransportType(),
                tour.getDistance(),
                tour.getEstimatedTime()
        );
    }
}
