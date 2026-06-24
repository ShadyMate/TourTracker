package org.example.backend.service.impl;

import org.example.backend.dto.TourDto;
import org.example.backend.dto.TourLogDto;
import org.example.backend.exception.BusinessRuleException;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.Tour;
import org.example.backend.model.TourLog;
import org.example.backend.model.User;
import org.example.backend.repository.TourLogRepository;
import org.example.backend.repository.TourRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.ImageStorageService;
import org.example.backend.service.TourMetricsCalculator;
import org.example.backend.service.TourService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.OptionalDouble;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Business Layer Implementation - TourService
 * Enforces ownership: every write operation verifies the requesting user owns the resource.
 */
@Service
public class TourServiceImpl implements TourService {
    private static final Logger logger = LoggerFactory.getLogger(TourServiceImpl.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final TourRepository tourRepository;
    private final TourLogRepository tourLogRepository;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;
    private final TourMetricsCalculator metricsCalculator;

    public TourServiceImpl(TourRepository tourRepository,
                           TourLogRepository tourLogRepository,
                           UserRepository userRepository,
                           ImageStorageService imageStorageService,
                           TourMetricsCalculator metricsCalculator) {
        this.tourRepository = tourRepository;
        this.tourLogRepository = tourLogRepository;
        this.userRepository = userRepository;
        this.imageStorageService = imageStorageService;
        this.metricsCalculator = metricsCalculator;
        logger.info("Initializing TourService");
    }

    @Override
    @Transactional
    public TourDto createTour(TourDto tourDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Tour tour = new Tour();
        applyDtoToEntity(tourDto, tour);
        tour.setUser(user);
        Tour saved = tourRepository.save(tour);
        logger.info("Tour {} created for user {}", saved.getId(), userId);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TourDto getTourById(Long id, Long userId) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));
        requireOwnership(tour, userId);
        return mapToDto(tour);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourDto> getUserTours(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        return tourRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourDto> searchTours(Long userId, String searchTerm, String sort, Double userLat, Double userLng) {
        String q = (searchTerm == null || searchTerm.isBlank()) ? null : searchTerm.toLowerCase();
        List<TourDto> results = tourRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .filter(t -> q == null || matchesSearch(t, q))
                .collect(Collectors.toList());
        results.sort(comparatorFor(sort, userLat, userLng));
        return results;
    }

    /** 2-arg convenience overload: full-text search with default name-ascending sort, no geo. */
    public List<TourDto> searchTours(Long userId, String searchTerm) {
        return searchTours(userId, searchTerm, null, null, null);
    }

    /**
     * Build a comparator from a "field+direction" token (e.g. "ratingDesc").
     * Unknown/blank field → name. Null sort-keys always sort last, in both directions.
     */
    private Comparator<TourDto> comparatorFor(String sort, Double userLat, Double userLng) {
        boolean desc = sort != null && sort.endsWith("Desc");
        String field = sort == null ? "" : sort.replaceFirst("(Asc|Desc)$", "");

        Function<TourDto, Double> key = switch (field) {
            case "distance"          -> TourDto::getDistance;
            case "rating"            -> this::averageRating;
            case "childFriendliness" -> t -> toDouble(t.getChildFriendliness());
            case "popularity"        -> TourDto::getPopularity;
            case "distanceFromUser"  -> t -> distanceFromUser(t, userLat, userLng);
            default                  -> null; // name (default)
        };

        if (key == null) {
            Comparator<String> order = desc
                    ? String.CASE_INSENSITIVE_ORDER.reversed()
                    : String.CASE_INSENSITIVE_ORDER;
            return Comparator.comparing(TourDto::getName, Comparator.nullsLast(order));
        }
        Comparator<Double> order = desc ? Comparator.<Double>reverseOrder() : Comparator.<Double>naturalOrder();
        return Comparator.comparing(key, Comparator.nullsLast(order));
    }

    private static Double toDouble(Integer i) {
        return i == null ? null : i.doubleValue();
    }

    /** Average of all non-null log ratings, or null when the tour has no rated logs. */
    private Double averageRating(TourDto t) {
        if (t.getLogs() == null) return null;
        OptionalDouble avg = t.getLogs().stream()
                .map(TourLogDto::getRating)
                .filter(java.util.Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average();
        return avg.isPresent() ? avg.getAsDouble() : null;
    }

    /** Haversine distance (km) from the user to a tour's start point; null if any coordinate is missing. */
    private Double distanceFromUser(TourDto t, Double userLat, Double userLng) {
        if (userLat == null || userLng == null || t.getFromLat() == null || t.getFromLng() == null) {
            return null;
        }
        double dLat = Math.toRadians(t.getFromLat() - userLat);
        double dLng = Math.toRadians(t.getFromLng() - userLng);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(userLat)) * Math.cos(Math.toRadians(t.getFromLat()))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 6371.0 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /** True if any searchable text on the tour — including computed values — contains q. */
    private boolean matchesSearch(TourDto t, String q) {
        if (contains(t.getName(), q)) return true;
        if (contains(t.getDescription(), q)) return true;
        if (contains(t.getStartLocation(), q)) return true;
        if (contains(t.getEndLocation(), q)) return true;
        if (contains(t.getChildFriendlinessLabel(), q)) return true;
        if (t.getPopularity() != null && String.valueOf(t.getPopularity()).contains(q)) return true;
        if (t.getLogs() != null) {
            for (TourLogDto l : t.getLogs()) {
                if (contains(l.getNotes(), q)) return true;
            }
        }
        return false;
    }

    private boolean contains(String value, String lowerQuery) {
        return value != null && value.toLowerCase().contains(lowerQuery);
    }

    @Override
    @Transactional
    public TourDto updateTour(Long id, TourDto tourDto, Long userId) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));
        requireOwnership(tour, userId);
        applyDtoToEntity(tourDto, tour);
        return mapToDto(tourRepository.save(tour));
    }

    @Override
    @Transactional
    public void deleteTour(Long id, Long userId) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));
        requireOwnership(tour, userId);
        // Delete associated image from filesystem before removing the DB record
        if (tour.getImagePath() != null) {
            imageStorageService.delete(tour.getImagePath());
        }
        tourRepository.deleteById(id);
        logger.info("Tour {} deleted by user {}", id, userId);
    }

    // ── Image management ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public TourDto setImage(Long tourId, String filename, Long userId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));
        requireOwnership(tour, userId);
        tour.setImagePath(filename);
        Tour saved = tourRepository.save(tour);
        logger.info("Image set for tour {}: {}", tourId, filename);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public String getImagePath(Long tourId, Long userId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));
        requireOwnership(tour, userId);
        return tour.getImagePath();
    }

    // ── Tour Log operations ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<TourLogDto> getLogsForTour(Long tourId, Long userId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));
        requireOwnership(tour, userId);
        return tourLogRepository.findByTourId(tourId).stream()
                .map(this::mapLogToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TourLogDto addTourLog(Long tourId, TourLogDto logDto, Long userId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found"));
        requireOwnership(tour, userId);
        TourLog log = new TourLog();
        applyLogDtoToEntity(logDto, log);
        log.setTour(tour);
        TourLog saved = tourLogRepository.save(log);
        logger.info("TourLog {} added to tour {} by user {}", saved.getId(), tourId, userId);
        return mapLogToDto(saved);
    }

    @Override
    @Transactional
    public TourLogDto updateTourLog(Long tourId, Long logId, TourLogDto logDto, Long userId) {
        TourLog log = tourLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour log not found"));
        if (!log.getTour().getId().equals(tourId)) {
            throw new ResourceNotFoundException("Tour log does not belong to this tour");
        }
        requireOwnership(log.getTour(), userId);
        applyLogDtoToEntity(logDto, log);
        return mapLogToDto(tourLogRepository.save(log));
    }

    @Override
    @Transactional
    public void deleteTourLog(Long tourId, Long logId, Long userId) {
        TourLog log = tourLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour log not found"));
        if (!log.getTour().getId().equals(tourId)) {
            throw new ResourceNotFoundException("Tour log does not belong to this tour");
        }
        requireOwnership(log.getTour(), userId);
        tourLogRepository.deleteById(logId);
        logger.info("TourLog {} deleted by user {}", logId, userId);
    }

    // ── Ownership guard ────────────────────────────────────────────────────────

    private void requireOwnership(Tour tour, Long userId) {
        if (!tour.getUser().getId().equals(userId)) {
            logger.warn("User {} attempted to access tour {} owned by user {}",
                    userId, tour.getId(), tour.getUser().getId());
            throw new BusinessRuleException("Access denied: tour belongs to another user");
        }
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
        tour.setRouteGeometry(dto.getRouteGeometry());
        // imagePath is intentionally excluded — managed only via setImage()
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
        TourDto dto = new TourDto(
                tour.getId(), tour.getName(), tour.getDescription(),
                tour.getStartLocation(), tour.getEndLocation(), tour.getTransportType(),
                tour.getDistance(), tour.getEstimatedTime(), tour.getSelectedImage(),
                tour.getFromLat(), tour.getFromLng(), tour.getToLat(), tour.getToLng(),
                tour.getRouteGeometry(), tour.getImagePath(),
                logs, null, null, null);
        int childScore = metricsCalculator.childFriendliness(tour.getLogs());
        dto.setPopularity(metricsCalculator.popularity(tour.getLogs()));
        dto.setChildFriendliness(childScore);
        dto.setChildFriendlinessLabel(metricsCalculator.childFriendlinessLabel(childScore));
        return dto;
    }

    private TourLogDto mapLogToDto(TourLog log) {
        String dateStr = log.getLogDate() != null ? log.getLogDate().format(DATE_FMT) : null;
        return new TourLogDto(
                log.getId(), log.getTour().getId(), dateStr,
                log.getStartTime(), log.getEndTime(), log.getTotalTimeStr(),
                log.getTotalDistance(), log.getDifficulty(), log.getRating(), log.getNotes());
    }
}
