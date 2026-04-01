package com.example.backend.service;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Like;
import com.example.backend.model.Trip;
import com.example.backend.model.User;
import com.example.backend.repository.LikeRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> toggleLike(Long tripId) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        
        boolean liked;
        if (likeRepository.existsByTripAndUser(trip, currentUser)) {
            likeRepository.deleteByTripAndUser(trip, currentUser);
            liked = false;
        } else {
            Like like = Like.builder()
                    .trip(trip)
                    .user(currentUser)
                    .build();
            likeRepository.save(like);
            liked = true;
        }
        
        Long likesCount = likeRepository.countByTrip(trip);
        
        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likesCount", likesCount);
        
        return response;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
