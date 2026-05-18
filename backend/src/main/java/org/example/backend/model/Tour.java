package org.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tours")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String startLocation;

    @Column(nullable = false)
    private String endLocation;

    @Column(nullable = false)
    private String transportType;

    private Double distance;

    private Long estimatedTime;

    private String selectedImage;

    private Double fromLat;
    private Double fromLng;
    private Double toLat;
    private Double toLng;

    @Column(columnDefinition = "TEXT")
    private String routeGeometry;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TourLog> logs = new ArrayList<>();

    @PrePersist
    private void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
