package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Tour entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourDto {
    private Long id;
    private String name;
    private String description;
    private String startLocation;
    private String endLocation;
    private String transportType;
    private Double distance;
    private Long estimatedTime;
}
