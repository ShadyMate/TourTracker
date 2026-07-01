package org.example.backend.service;

import org.example.backend.dto.TourDto;
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

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class TourServiceSearchTest {

    private TourRepository tourRepository;
    private TourServiceImpl service;
    private final User user = new User();

    private Tour tour(String name, List<TourLog> logs) {
        Tour t = new Tour();
        t.setId((long) Math.abs(name.hashCode()));
        t.setName(name);
        t.setDescription("");
        t.setStartLocation("A");
        t.setEndLocation("B");
        t.setTransportType("hiking");
        t.setUser(user);
        t.setLogs(logs);
        for (TourLog l : logs) {
            l.setTour(t);
        }
        return t;
    }

    private TourLog easyLog() {
        TourLog l = new TourLog();
        l.setDifficulty(3);
        l.setTotalDistance(5.0);
        l.setTotalTimeStr("1:00");
        l.setRating(5.0);
        return l;
    }

    @BeforeEach
    void setUp() {
        user.setId(1L);
        tourRepository = Mockito.mock(TourRepository.class);
        TourLogRepository logRepo = Mockito.mock(TourLogRepository.class);
        UserRepository userRepo = Mockito.mock(UserRepository.class);
        ImageStorageService img = Mockito.mock(ImageStorageService.class);
        service = new TourServiceImpl(tourRepository, logRepo, userRepo, img,
                new TourMetricsCalculator(), new ObjectMapper(),
                jakarta.validation.Validation.buildDefaultValidatorFactory().getValidator());
    }

    @Test
    void searchMatchesChildFriendlinessLabel() {
        Tour friendly = tour("Easy Park Loop", List.of(easyLog()));
        Tour hard = tour("Mountain Climb", new ArrayList<>());
        when(tourRepository.findByUserId(eq(1L))).thenReturn(List.of(friendly, hard));

        // "Easy Park Loop" with one easy log => child-friendliness 6 => label "Very friendly".
        // "Mountain Climb" with no logs => 3 => label "Moderate".
        List<TourDto> results = service.searchTours(1L, "friendly");

        assertThat(results).extracting(TourDto::getName).containsExactly("Easy Park Loop");
    }

    @Test
    void searchMatchesName() {
        Tour a = tour("Mountain Climb", new ArrayList<>());
        Tour b = tour("Easy Park Loop", new ArrayList<>());
        when(tourRepository.findByUserId(eq(1L))).thenReturn(List.of(a, b));

        List<TourDto> results = service.searchTours(1L, "mountain");

        assertThat(results).extracting(TourDto::getName).containsExactly("Mountain Climb");
    }

    @Test
    void emptySearchTermReturnsAllTours() {
        Tour a = tour("Mountain Climb", new ArrayList<>());
        Tour b = tour("Easy Park Loop", new ArrayList<>());
        when(tourRepository.findByUserId(eq(1L))).thenReturn(List.of(a, b));

        List<TourDto> results = service.searchTours(1L, "  ");

        assertThat(results).hasSize(2);
    }

    private TourLog ratedLog(double rating) {
        TourLog l = easyLog();
        l.setRating(rating);
        return l;
    }

    @Test
    void sortByRatingDescOrdersHighestRatedFirst() {
        Tour low = tour("Low", List.of(ratedLog(2.0)));
        Tour high = tour("High", List.of(ratedLog(5.0)));
        when(tourRepository.findByUserId(eq(1L))).thenReturn(List.of(low, high));

        List<TourDto> results = service.searchTours(1L, null, "ratingDesc", null, null);

        assertThat(results).extracting(TourDto::getName).containsExactly("High", "Low");
    }

    @Test
    void sortByDistanceFromUserOrdersNearestFirst() {
        Tour near = tour("Near", new ArrayList<>());
        near.setFromLat(48.21); near.setFromLng(16.37);   // ~Vienna
        Tour far = tour("Far", new ArrayList<>());
        far.setFromLat(40.71); far.setFromLng(-74.01);     // ~New York
        when(tourRepository.findByUserId(eq(1L))).thenReturn(List.of(far, near));

        // User sits in Vienna; "Near" must come first.
        List<TourDto> results =
                service.searchTours(1L, null, "distanceFromUserAsc", 48.20, 16.37);

        assertThat(results).extracting(TourDto::getName).containsExactly("Near", "Far");
    }

    @Test
    void toursMissingSortKeySortLast() {
        Tour withCoords = tour("HasCoords", new ArrayList<>());
        withCoords.setFromLat(48.2); withCoords.setFromLng(16.3);
        Tour noCoords = tour("NoCoords", new ArrayList<>());      // null lat/lng → no distance
        when(tourRepository.findByUserId(eq(1L))).thenReturn(List.of(noCoords, withCoords));

        List<TourDto> results =
                service.searchTours(1L, null, "distanceFromUserAsc", 48.2, 16.3);

        assertThat(results).extracting(TourDto::getName).containsExactly("HasCoords", "NoCoords");
    }
}
