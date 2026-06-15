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

    private double averageRating(List<TourLog> logs) {
        double sum = 0;
        for (TourLog l : logs) {
            sum += l.getRating() != null ? l.getRating() : 0.0;
        }
        return sum / logs.size();
    }
}
