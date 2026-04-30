package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for TourLog entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourLogDto {
    private Long id;
    private Long tourId;
    private LocalDateTime logDate;
    private String notes;
    private Integer difficulty;
    private Double totalDistance;
    private Long totalTime;
    private Integer rating;
}
