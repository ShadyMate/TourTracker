package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for TourLog entity.
 * Field names match the Angular frontend Tour Log model.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourLogDto {
    private Long id;
    private Long tourId;
    private String logDate;     // ISO date string "YYYY-MM-DD"
    private String startTime;   // "HH:mm"
    private String endTime;     // "HH:mm"
    private String totalTime;   // "H:mm"
    private Double actualDistance;
    private Integer difficulty; // 1-10
    private Double rating;      // 1.0-5.0
    private String notes;
}
