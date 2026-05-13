package org.example.backend.service.impl;

import org.example.backend.dto.TourDto;
import org.example.backend.dto.TourLogDto;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.Tour;
import org.example.backend.model.TourLog;
import org.example.backend.model.User;
import org.example.backend.repository.TourLogRepository;
import org.example.backend.repository.TourRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.TourService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business Layer Implementation - TourService
 */
@Service
public class TourServiceImpl implements TourService {
    private static final Logger logger = LoggerFactory.getLogger(TourServiceImpl.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final TourRepository tourRepository;
    private final TourLogRepository tourLogRepository;
    private final UserRepository userRepository;

    public TourServiceImpl(TourRepository tourRepository,
                           TourLogRepository tourLogRepository,
                           UserRepository userRepository) {
        this.tourRepository = tourRepository;
        this.tourLogRepository = tourLogRepository;
        this.userRepository = userRepository;
        logger.info("Initializing TourService");
    }

    @Override
    @Transactional
    public TourDto createTour(TourDto tourDto, Long userId) {
        logger.debug("Creating new tour for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Tour tour = new Tour();
        applyDtoToEntity(tourDto, tour);
        tour.setUser(user);

        Tour saved = tourRepository.save(tour);
        logger.info("Tour created with ID: {}", saved.getId());
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TourDto getTourById(Long id) {
        logger.debug("Fetching tour ID: {}", id);
        return tourRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourDto> getUserTours(Long userId) {
        logger.debug("Fetching tours for user ID: {}", userId);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        return tourRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourDto> searchTours(Long userId, String searchTerm) {
        logger.debug("Searching tours for user ID: {} term: {}", userId, searchTerm);
        return tourRepository.searchToursByName(userId, searchTerm).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TourDto updateTour(Long id, TourDto tourDto) {
        logger.debug("Updating tour ID: {}", id);
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));
        applyDtoToEntity(tourDto, tour);
        return mapToDto(tourRepository.save(tour));
    }

    @Override
    @Transactional
    public void deleteTour(Long id) {
        logger.debug("Deleting tour ID: {}", id);
        if (!tourRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tour not found");
        }
        tourRepository.deleteById(id);
        logger.info("Tour {} deleted", id);
    }

    // ── Tour Log operations ────────────────────────────────────────────────────

    @Override
    @Transactional
    public TourLogDto addTourLog(Long tourId, TourLogDto logDto) {
        logger.debug("Adding log to tour ID: {}", tourId);
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));

        TourLog log = new TourLog();
        applyLogDtoToEntity(logDto, log);
        log.setTour(tour);

        TourLog saved = tourLogRepository.save(log);
        logger.info("TourLog {} added to tour {}", saved.getId(), tourId);
        return mapLogToDto(saved);
    }

    @Override
    @Transactional
    public TourLogDto updateTourLog(Long tourId, Long logId, TourLogDto logDto) {
        logger.debug("Updating log ID: {} on tour ID: {}", logId, tourId);
        TourLog log = tourLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour log not found"));

        if (!log.getTour().getId().equals(tourId)) {
            throw new ResourceNotFoundException("Tour log does not belong to this tour");
        }
        applyLogDtoToEntity(logDto, log);
        return mapLogToDto(tourLogRepository.save(log));
    }

    @Override
    @Transactional
    public void deleteTourLog(Long tourId, Long logId) {
        logger.debug("Deleting log ID: {} from tour ID: {}", logId, tourId);
        TourLog log = tourLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour log not found"));

        if (!log.getTour().getId().equals(tourId)) {
            throw new ResourceNotFoundException("Tour log does not belong to this tour");
        }
        tourLogRepository.deleteById(logId);
        logger.info("TourLog {} deleted", logId);
    }

    // ── Mapping helpers ────────────────────────────────────────────────────────

    private void applyDtoToEntity(TourDto dto, Tour tour) {
        tour.setName(dto.getName());
        tour.setDescription(dto.getDescription());
        tour.setStartLocation(dto.getStartLocation());
        tour.setEndLocation(dto.getEndLocation());
        tour.setTransportType(dto.getTransportType());
        tour.setDistance(dto.getDistance());
        tour.setEstimatedTime(dto.getEstimatedTime());
        tour.setSelectedImage(dto.getSelectedImage());
        tour.setFromLat(dto.getFromLat());
        tour.setFromLng(dto.getFromLng());
        tour.setToLat(dto.getToLat());
        tour.setToLng(dto.getToLng());
    }

    private void applyLogDtoToEntity(TourLogDto dto, TourLog log) {
        if (dto.getLogDate() != null) {
            log.setLogDate(LocalDate.parse(dto.getLogDate(), DATE_FMT).atStartOfDay());
        }
        log.setStartTime(dto.getStartTime());
        log.setEndTime(dto.getEndTime());
        log.setTotalTimeStr(dto.getTotalTime());
        log.setTotalDistance(dto.getActualDistance());
        log.setDifficulty(dto.getDifficulty());
        log.setRating(dto.getRating());
        log.setNotes(dto.getNotes());
    }

    private TourDto mapToDto(Tour tour) {
        List<TourLogDto> logs = tour.getLogs().stream()
                .map(this::mapLogToDto)
                .collect(Collectors.toList());

        return new TourDto(
                tour.getId(),
                tour.getName(),
                tour.getDescription(),
                tour.getStartLocation(),
                tour.getEndLocation(),
                tour.getTransportType(),
                tour.getDistance(),
                tour.getEstimatedTime(),
                tour.getSelectedImage(),
                tour.getFromLat(),
                tour.getFromLng(),
                tour.getToLat(),
                tour.getToLng(),
                logs
        );
    }

    private TourLogDto mapLogToDto(TourLog log) {
        String dateStr = log.getLogDate() != null
                ? log.getLogDate().format(DATE_FMT)
                : null;

        return new TourLogDto(
                log.getId(),
                log.getTour().getId(),
                dateStr,
                log.getStartTime(),
                log.getEndTime(),
                log.getTotalTimeStr(),
                log.getTotalDistance(),
                log.getDifficulty(),
                log.getRating(),
                log.getNotes()
        );
    }
}
