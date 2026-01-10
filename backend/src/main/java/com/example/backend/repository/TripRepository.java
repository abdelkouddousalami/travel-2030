package com.example.backend.repository;

import com.example.backend.model.Trip;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    List<Trip> findByUser(User user);
    
    List<Trip> findByUserOrderByCreatedAtDesc(User user);
    
    List<Trip> findByIsPublicTrueOrderByCreatedAtDesc();
    
    @Query("SELECT t FROM Trip t WHERE t.isPublic = true ORDER BY SIZE(t.likes) DESC, t.createdAt DESC")
    List<Trip> findPublicTripsOrderByLikes();
    
    Long countByUser(User user);
}
