package com.example.backend.repository;

import com.example.backend.model.Booking;
import com.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    Page<Booking> findByUser(User user, Pageable pageable);
    
    Page<Booking> findByUserId(Long userId, Pageable pageable);
    
    Page<Booking> findByDestinationId(Long destinationId, Pageable pageable);
    
    Page<Booking> findByStatus(Booking.Status status, Pageable pageable);
    
    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    Long countByStatus(Booking.Status status);
}
