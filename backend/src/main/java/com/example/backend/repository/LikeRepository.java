package com.example.backend.repository;

import com.example.backend.model.Like;
import com.example.backend.model.Trip;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    Optional<Like> findByTripAndUser(Trip trip, User user);
    
    boolean existsByTripAndUser(Trip trip, User user);
    
    Long countByTrip(Trip trip);
    
    void deleteByTripAndUser(Trip trip, User user);
}
