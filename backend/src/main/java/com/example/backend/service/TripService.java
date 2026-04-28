package com.example.backend.service;

import com.example.backend.dto.trip.TripRequest;
import com.example.backend.dto.trip.TripResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Trip;
import com.example.backend.model.User;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.LikeRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public TripResponse createTrip(TripRequest request) {
        User currentUser = getCurrentUser();
        
        Trip trip = Trip.builder()
                .title(request.getTitle())
                .destination(request.getDestination())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .budget(request.getBudget())
                .status(request.getStatus() != null ? 
                    Trip.TripStatus.valueOf(request.getStatus()) : Trip.TripStatus.PLANNING)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .imageUrl(request.getImageUrl())
                .user(currentUser)
                .build();
        
        trip = tripRepository.save(trip);
        return mapToResponse(trip, currentUser);
    }

    @Transactional
    public TripResponse updateTrip(Long id, TripRequest request) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        
        if (!trip.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You don't have permission to modify this trip");
        }
        
        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudget(request.getBudget());
        if (request.getStatus() != null) {
            trip.setStatus(Trip.TripStatus.valueOf(request.getStatus()));
        }
        if (request.getIsPublic() != null) {
            trip.setIsPublic(request.getIsPublic());
        }
        if (request.getImageUrl() != null) {
            trip.setImageUrl(request.getImageUrl());
        }
        
        trip = tripRepository.save(trip);
        return mapToResponse(trip, currentUser);
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getMyTrips() {
        User currentUser = getCurrentUser();
        List<Trip> trips = tripRepository.findByUserOrderByCreatedAtDesc(currentUser);
        return trips.stream()
                .map(trip -> mapToResponse(trip, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TripResponse> getAllTripsAdmin(Pageable pageable) {
        return tripRepository.findAll(pageable)
                .map(trip -> mapToResponse(trip, null));
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getPublicTrips() {
        User currentUser = getCurrentUserOrNull();
        List<Trip> trips = tripRepository.findByIsPublicTrueOrderByCreatedAtDesc();
        return trips.stream()
                .map(trip -> mapToResponse(trip, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(Long id) {
        User currentUser = getCurrentUserOrNull();
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        
        if (!trip.getIsPublic() && currentUser != null && 
            !trip.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You don't have permission to view this trip");
        }
        
        return mapToResponse(trip, currentUser);
    }

    @Transactional
    public void deleteTrip(Long id) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        
        if (!trip.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You don't have permission to delete this trip");
        }
        
        tripRepository.delete(trip);
    }

    private TripResponse mapToResponse(Trip trip, User currentUser) {
        Long likesCount = likeRepository.countByTrip(trip);
        Long commentsCount = commentRepository.countByTrip(trip);
        Boolean isLiked = currentUser != null && 
                         likeRepository.existsByTripAndUser(trip, currentUser);
        
        return TripResponse.builder()
                .id(trip.getId())
                .title(trip.getTitle())
                .destination(trip.getDestination())
                .description(trip.getDescription())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .budget(trip.getBudget())
                .status(trip.getStatus().name())
                .isPublic(trip.getIsPublic())
                .imageUrl(trip.getImageUrl())
                .user(TripResponse.UserInfo.builder()
                        .id(trip.getUser().getId())
                        .username(trip.getUser().getUsername())
                        .firstName(trip.getUser().getFirstName())
                        .lastName(trip.getUser().getLastName())
                        .build())
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .isLikedByCurrentUser(isLiked)
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User getCurrentUserOrNull() {
        try {
            return getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }
}
