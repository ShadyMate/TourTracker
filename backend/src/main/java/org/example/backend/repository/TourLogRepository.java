package org.example.backend.repository;

import org.example.backend.model.TourLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data Access Layer for TourLog entity.
 * Provides CRUD operations and custom queries for the TourLog table.
 */
@Repository
public interface TourLogRepository extends JpaRepository<TourLog, Long> {
    List<TourLog> findByTourId(Long tourId);
}
