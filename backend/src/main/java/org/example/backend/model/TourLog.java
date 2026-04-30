package org.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tour_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "log_date")
    private LocalDateTime logDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Integer difficulty;

    private Double totalDistance;

    private Long totalTime;

    private Integer rating;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    private void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (logDate == null) {
            logDate = LocalDateTime.now();
        }
    }
}
