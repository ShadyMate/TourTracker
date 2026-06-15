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
    void popularityBlendsLowRatingSingleLog() {
        // 1 log -> logsScore=0.5; avgRating 1.0 -> ratingScore=2.0; (0.5+2.0)/2=1.25
        var logs = List.of(log(3, 5.0, "1:00", 1.0));
        assertThat(calc.popularity(logs)).isEqualTo(1.25, within(1e-9));
    }

    @Test
    void popularityClampsToOne() {
        // 1 log, rating 0.5 -> blended 0.75 -> clamped up to floor 1.0
        var logs = List.of(log(3, 5.0, "1:00", 0.5));
        assertThat(calc.popularity(logs)).isEqualTo(1.0, within(1e-9));
    }

    @Test
    void childFriendlinessIsThreeWhenNoLogs() {
        assertThat(calc.childFriendliness(List.of())).isEqualTo(3);
    }

    @Test
    void childFriendlinessFullWhenEasyShortShort() {
        // diff 4 (<5 +2), 60 min (<180 +2), 10 km (<15 +2) => 6
        var logs = List.of(log(4, 10.0, "1:00", 4.0));
        assertThat(calc.childFriendliness(logs)).isEqualTo(6);
    }

    @Test
    void childFriendlinessZeroWhenHardLongFar() {
        // diff 6, 240 min, 20 km => 0
        var logs = List.of(log(6, 20.0, "4:00", 4.0));
        assertThat(calc.childFriendliness(logs)).isEqualTo(0);
    }

    @Test
    void childFriendlinessBoundariesAreExclusive() {
        // exactly diff 5, time 180 (3:00), dist 15 => none qualify => 0
        var logs = List.of(log(5, 15.0, "3:00", 4.0));
        assertThat(calc.childFriendliness(logs)).isEqualTo(0);
    }

    @Test
    void childFriendlinessTimePartialCredit() {
        // diff 5 (no), 179 min (2:59 <180 +2), 20 km (no) => 2
        var logs = List.of(log(5, 20.0, "2:59", 4.0));
        assertThat(calc.childFriendliness(logs)).isEqualTo(2);
    }

    @Test
    void childFriendlinessToleratesNullTime() {
        // null time => 0 min for that log => avg 0 (<180 +2); diff 4 (+2); dist 10 (+2) => 6
        var logs = List.of(log(4, 10.0, null, 4.0));
        assertThat(calc.childFriendliness(logs)).isEqualTo(6);
    }

    @Test
    void labelThresholds() {
        assertThat(calc.childFriendlinessLabel(0)).isEqualTo("Not suitable");
        assertThat(calc.childFriendlinessLabel(2)).isEqualTo("Challenging");
        assertThat(calc.childFriendlinessLabel(3)).isEqualTo("Moderate");
        assertThat(calc.childFriendlinessLabel(4)).isEqualTo("Moderate");
        assertThat(calc.childFriendlinessLabel(5)).isEqualTo("Very friendly");
        assertThat(calc.childFriendlinessLabel(6)).isEqualTo("Very friendly");
    }
}
