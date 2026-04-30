package org.example.backend.repository;

import org.example.backend.model.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data Access Layer for Tour entity.
 * Provides CRUD operations and custom queries for the Tour table.
 */
@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByUserId(Long userId);
    
    @Query("SELECT t FROM Tour t WHERE t.user.id = :userId AND t.name LIKE %:search%")
    List<Tour> searchToursByName(@Param("userId") Long userId, @Param("search") String search);
}
