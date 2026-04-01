package com.example.backend.service;

import com.example.backend.dto.comment.CommentRequest;
import com.example.backend.dto.comment.CommentResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Comment;
import com.example.backend.model.Trip;
import com.example.backend.model.User;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentResponse addComment(Long tripId, CommentRequest request) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        
        Comment comment = Comment.builder()
                .content(request.getContent())
                .trip(trip)
                .user(currentUser)
                .build();
        
        comment = commentRepository.save(comment);
        return mapToResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getTripComments(Long tripId) {
        List<Comment> comments = commentRepository.findByTripIdOrderByCreatedAtDesc(tripId);
        return comments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long id) {
        User currentUser = getCurrentUser();
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
        
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You don't have permission to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(CommentResponse.UserInfo.builder()
                        .id(comment.getUser().getId())
                        .username(comment.getUser().getUsername())
                        .firstName(comment.getUser().getFirstName())
                        .lastName(comment.getUser().getLastName())
                        .build())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
