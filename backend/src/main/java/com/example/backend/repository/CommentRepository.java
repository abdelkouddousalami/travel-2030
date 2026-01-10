package com.example.backend.repository;

import com.example.backend.model.Comment;
import com.example.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByTripOrderByCreatedAtDesc(Trip trip);
    
    List<Comment> findByTripIdOrderByCreatedAtDesc(Long tripId);
    
    Long countByTrip(Trip trip);
}
