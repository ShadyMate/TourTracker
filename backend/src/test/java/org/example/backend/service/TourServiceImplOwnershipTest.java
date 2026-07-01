package org.example.backend.service;

import org.example.backend.dto.TourLogDto;
import org.example.backend.exception.BusinessRuleException;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.Tour;
import org.example.backend.model.TourLog;
import org.example.backend.model.User;
import org.example.backend.repository.TourLogRepository;
import org.example.backend.repository.TourRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.impl.TourServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

class TourServiceImplOwnershipTest {

    private TourRepository tourRepository;
    private TourLogRepository tourLogRepository;
    private TourServiceImpl service;
    private ImageStorageService imageStorageService;

    private User owner;
    private User otherUser;
    private Tour tour;

    @BeforeEach
    void setUp() {
        tourRepository = Mockito.mock(TourRepository.class);
        tourLogRepository = Mockito.mock(TourLogRepository.class);
        UserRepository userRepo = Mockito.mock(UserRepository.class);
        imageStorageService = Mockito.mock(ImageStorageService.class);
        service = new TourServiceImpl(tourRepository, tourLogRepository, userRepo, imageStorageService,
                new TourMetricsCalculator(), new ObjectMapper(),
                jakarta.validation.Validation.buildDefaultValidatorFactory().getValidator());

        // Owner who owns the tour
        owner = new User();
        owner.setId(1L);

        // Other user who doesn't own the tour and wants to access it
        otherUser = new User();
        otherUser.setId(2L);

        tour = new Tour();
        tour.setId(10L);
        tour.setName("Test Tour");
        tour.setUser(owner);
    }

    @Test
    void getTourByIdWithWrongOwnerThrowsException() {
        when(tourRepository.findById(10L)).thenReturn(Optional.of(tour));

        assertThatThrownBy(() -> service.getTourById(10L, 2L))
            .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void getTourByIdWithCorrectOwnerSucceeds() {
        when(tourRepository.findById(10L)).thenReturn(Optional.of(tour));

        // Owner is accessing their own tour
        org.assertj.core.api.Assertions.assertThatNoException()
            .isThrownBy(() -> service.getTourById(10L, 1L));
    }

    @Test
    void deleteTourWithWrongOwnerThrowsException() {
        when(tourRepository.findById(10L)).thenReturn(Optional.of(tour));

        assertThatThrownBy(() -> service.deleteTour(10L, 2L))
            .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void deleteTourWithCorrectOwnerSucceeds() {
        when(tourRepository.findById(10L)).thenReturn(Optional.of(tour));

        service.deleteTour(10L, 1L);
        Mockito.verify(tourRepository).deleteById(10L);
    }

    @Test
    void deleteTourLogWithWrongTourThrowsException() {
        TourLog log = new TourLog();
        log.setId(1L);
        log.setTour(tour);

        when(tourLogRepository.findById(1L)).thenReturn(Optional.of(log));

        // log belongs to tour 10, but trying to delete from tour 99
        assertThatThrownBy(() -> service.deleteTourLog(99L, 1L, 1L))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addTourLogWithWrongOwnerThrowsException() {
        when(tourRepository.findById(10L)).thenReturn(Optional.of(tour));

        assertThatThrownBy(() -> service.addTourLog(10L, new TourLogDto(), 2L))
            .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void deleteTourWithImageDeletesFile() {
        tour.setImagePath("photo.jpg");
        when(tourRepository.findById(10L)).thenReturn(Optional.of(tour));
        service.deleteTour(10L, 1L);
        Mockito.verify(imageStorageService).delete("photo.jpg");
    }
}