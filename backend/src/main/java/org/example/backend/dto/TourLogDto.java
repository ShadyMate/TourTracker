package org.example.backend.dto;

import jakarta.validation.constraints.*;
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

    @NotBlank(message = "Log date is required")
    private String logDate;     // ISO date string "YYYY-MM-DD"

    @NotBlank(message = "Start time is required")
    private String startTime;   // "HH:mm"

    @NotBlank(message = "End time is required")
    private String endTime;     // "HH:mm"

    private String totalTime;   // "H:mm" — computed, not validated on input

    @DecimalMin(value = "0.0", message = "Distance must be zero or positive")
    private Double actualDistance;

    @NotNull(message = "Difficulty is required")
    @Min(value = 1, message = "Difficulty must be at least 1")
    @Max(value = 10, message = "Difficulty must be at most 10")
    private Integer difficulty;

    @NotNull(message = "Rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Rating must be at most 5.0")
    private Double rating;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;
}
