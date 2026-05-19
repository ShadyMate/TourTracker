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
    
    @Query("""
            SELECT DISTINCT t FROM Tour t LEFT JOIN t.logs l
            WHERE t.user.id = :userId AND (
                LOWER(t.name)          LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(t.description)   LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(t.startLocation) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(t.endLocation)   LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(l.notes)         LIKE LOWER(CONCAT('%', :search, '%'))
            )""")
    List<Tour> searchTours(@Param("userId") Long userId, @Param("search") String search);
}
