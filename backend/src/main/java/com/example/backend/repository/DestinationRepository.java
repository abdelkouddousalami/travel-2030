package com.example.backend.repository;

import com.example.backend.model.Destination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {
    
    Page<Destination> findByCategory(Destination.Category category, Pageable pageable);
    
    Page<Destination> findByCountryContainingIgnoreCase(String country, Pageable pageable);
    
    @Query("SELECT d FROM Destination d WHERE " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.country) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.city) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Destination> searchDestinations(@Param("keyword") String keyword, Pageable pageable);
    
    List<Destination> findTop10ByOrderByCreatedAtDesc();
}
