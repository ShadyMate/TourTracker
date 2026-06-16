package org.example.backend.service;

import org.example.backend.model.TourLog;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Stateless business-logic component that derives a tour's computed attributes
 * from its logs. Formulas mirror the Angular frontend (tour.service.ts) so the
 * two tiers stay consistent. Pure functions — no state, no I/O.
 */
@Component
public class TourMetricsCalculator {

    /**
     * Popularity on a 1–10 scale, blending log count with average rating.
     * No logs → 1.
     */
    public double popularity(List<TourLog> logs) {
        if (logs == null || logs.isEmpty()) {
            return 1.0;
        }
        double logsScore = Math.min(logs.size() / 2.0, 10.0);
        double ratingScore = (averageRating(logs) / 5.0) * 10.0;
        double blended = (logsScore + ratingScore) / 2.0;
        return Math.max(1.0, Math.min(10.0, blended));
    }

    /**
     * Child-friendliness on a 0–6 scale: +2 for each of low average difficulty,
     * short average time, and short average distance. No logs → 3.
     */
    public int childFriendliness(List<TourLog> logs) {
        if (logs == null || logs.isEmpty()) {
            return 3;
        }
        int n = logs.size();
        double avgDiff = 0, avgMin = 0, avgDist = 0;
        for (TourLog l : logs) {
            avgDiff += l.getDifficulty() != null ? l.getDifficulty() : 0;
            avgMin += parseMinutes(l.getTotalTimeStr());
            avgDist += l.getTotalDistance() != null ? l.getTotalDistance() : 0.0;
        }
        avgDiff /= n;
        avgMin /= n;
        avgDist /= n;

        int score = 0;
        if (avgDiff < 5) score += 2;
        if (avgMin < 180) score += 2;
        if (avgDist < 15) score += 2;
        return Math.min(6, score);
    }

    /** Human-readable label for a child-friendliness score (matches the frontend). */
    public String childFriendlinessLabel(int score) {
        if (score == 0) return "Not suitable";
        if (score <= 2) return "Challenging";
        if (score <= 4) return "Moderate";
        return "Very friendly";
    }

    /** Parse a "H:mm" duration string into minutes; null/blank/malformed → 0. */
    private int parseMinutes(String hhmm) {
        if (hhmm == null || hhmm.isBlank() || !hhmm.contains(":")) {
            return 0;
        }
        try {
            String[] parts = hhmm.split(":");
            int h = Integer.parseInt(parts[0].trim());
            int m = Integer.parseInt(parts[1].trim());
            return h * 60 + m;
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private double averageRating(List<TourLog> logs) {
        double sum = 0;
        for (TourLog l : logs) {
            sum += l.getRating() != null ? l.getRating() : 0.0;
        }
        return sum / logs.size();
    }
}
