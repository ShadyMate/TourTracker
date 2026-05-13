package org.example.backend.dto;

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
    private String name;
    private String description;
    private String startLocation;   // "from" in the frontend
    private String endLocation;     // "to" in the frontend
    private String transportType;
    private Double distance;
    private Long estimatedTime;     // stored as minutes
    private String selectedImage;
    private Double fromLat;
    private Double fromLng;
    private Double toLat;
    private Double toLng;
    private List<TourLogDto> logs;
}
