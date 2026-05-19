package org.example.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object for Tour entity.
 * Field names and types match the Angular frontend Tour model.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourDto {
    private Long id;

    @NotBlank(message = "Tour name is required")
    @Size(max = 100, message = "Tour name must not exceed 100 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotBlank(message = "Start location is required")
    @Size(max = 255, message = "Start location must not exceed 255 characters")
    private String startLocation;

    @NotBlank(message = "End location is required")
    @Size(max = 255, message = "End location must not exceed 255 characters")
    private String endLocation;

    @NotBlank(message = "Transport type is required")
    @Pattern(
        regexp = "^(hiking|cycling|walking|driving)$",
        message = "Transport type must be one of: hiking, cycling, walking, driving"
    )
    private String transportType;

    @DecimalMin(value = "0.0", message = "Distance must be zero or positive")
    private Double distance;

    @Min(value = 0, message = "Estimated time must be zero or positive")
    private Long estimatedTime;

    private String selectedImage;
    private Double fromLat;
    private Double fromLng;
    private Double toLat;
    private Double toLng;
    private String routeGeometry;
    private String mapImagePath;
    private List<TourLogDto> logs;
}
