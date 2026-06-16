package org.example.backend.repository;

import org.example.backend.model.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data Access Layer for Tour entity.
 * Provides CRUD operations and custom queries for the Tour table.
 */
@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByUserId(Long userId);
}
