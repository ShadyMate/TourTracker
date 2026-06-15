package org.example.backend.service;

import org.example.backend.model.TourLog;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class TourMetricsCalculatorTest {

    private final TourMetricsCalculator calc = new TourMetricsCalculator();

    private TourLog log(Integer difficulty, Double distance, String time, Double rating) {
        TourLog l = new TourLog();
        l.setDifficulty(difficulty);
        l.setTotalDistance(distance);
        l.setTotalTimeStr(time);
        l.setRating(rating);
        return l;
    }

    @Test
    void popularityIsOneWhenNoLogs() {
        assertThat(calc.popularity(List.of())).isEqualTo(1.0);
    }

    @Test
    void popularityBlendsLogCountAndAverageRating() {
        // 4 logs -> logsScore = min(4/2,10)=2.0; avgRating 5.0 -> ratingScore=10.0
        // (2.0 + 10.0)/2 = 6.0
        var logs = List.of(
                log(3, 5.0, "1:00", 5.0),
                log(3, 5.0, "1:00", 5.0),
                log(3, 5.0, "1:00", 5.0),
                log(3, 5.0, "1:00", 5.0));
        assertThat(calc.popularity(logs)).isEqualTo(6.0, within(1e-9));
    }

    @Test
    void popularityClampsToTen() {
        // 30 logs -> logsScore=min(15,10)=10; avgRating 5 -> ratingScore=10; (10+10)/2=10
        var logs = new java.util.ArrayList<TourLog>();
        for (int i = 0; i < 30; i++) logs.add(log(3, 5.0, "1:00", 5.0));
        assertThat(calc.popularity(logs)).isEqualTo(10.0, within(1e-9));
    }

    @Test
    void popularityClampsToOne() {
        // 1 log -> logsScore=0.5; avgRating 1.0 -> ratingScore=2.0; (0.5+2.0)/2=1.25
        var logs = List.of(log(3, 5.0, "1:00", 1.0));
        assertThat(calc.popularity(logs)).isEqualTo(1.25, within(1e-9));
    }
}
