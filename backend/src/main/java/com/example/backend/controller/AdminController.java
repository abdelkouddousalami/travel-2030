package com.example.backend.controller;

import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.admin.AdminStats;
import com.example.backend.dto.admin.CommentSummary;
import com.example.backend.dto.admin.UserSummary;
import com.example.backend.dto.chat.ChatMessageResponse;
import com.example.backend.dto.chat.ConversationSummary;
import com.example.backend.dto.trip.TripResponse;
import com.example.backend.model.Booking;
import com.example.backend.model.Comment;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.DestinationRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.BookingService;
import com.example.backend.service.ChatService;
import com.example.backend.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final BookingService bookingService;
    private final ChatService chatService;
    private final TripService tripService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final CommentRepository commentRepository;

    // ─── Stats ───────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getStats() {
        AdminStats stats = AdminStats.builder()
                .totalUsers(userRepository.count())
                .totalBookings(bookingRepository.count())
                .totalMessages(chatMessageRepository.count())
                .totalTrips(tripRepository.count())
                .totalDestinations(destinationRepository.count())
                .pendingBookings(bookingRepository.countByStatus(Booking.Status.PENDING))
                .confirmedBookings(bookingRepository.countByStatus(Booking.Status.CONFIRMED))
                .cancelledBookings(bookingRepository.countByStatus(Booking.Status.CANCELLED))
                .build();
        return ResponseEntity.ok(stats);
    }

    // ─── Users ───────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<UserSummary>> getAllUsers() {
        List<UserSummary> users = userRepository.findAll(
                Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(u -> UserSummary.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .role(u.getRole().name())
                        .isActive(u.getIsActive())
                        .emailVerified(u.getEmailVerified())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // ─── Trips ───────────────────────────────────────────────────────────────────

    @GetMapping("/trips")
    public ResponseEntity<Page<TripResponse>> getAllTrips(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(tripService.getAllTripsAdmin(pageable));
    }

    // ─── Bookings ────────────────────────────────────────────────────────────────

    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingResponse>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(bookingService.getAllBookings(pageable));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam Booking.Status status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    // ─── Comments ────────────────────────────────────────────────────────────────

    @GetMapping("/comments")
    public ResponseEntity<Page<CommentSummary>> getAllComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CommentSummary> result = commentRepository.findAll(pageable).map(c -> {
            String firstName = c.getUser().getFirstName() == null ? "" : c.getUser().getFirstName();
            String lastName = c.getUser().getLastName() == null ? "" : c.getUser().getLastName();
            String fullName = (firstName + " " + lastName).trim();
            if (fullName.isEmpty()) fullName = c.getUser().getUsername();
            return CommentSummary.builder()
                    .id(c.getId())
                    .content(c.getContent())
                    .tripId(c.getTrip().getId())
                    .tripTitle(c.getTrip().getTitle())
                    .userId(c.getUser().getId())
                    .username(c.getUser().getUsername())
                    .userFullName(fullName)
                    .createdAt(c.getCreatedAt())
                    .build();
        });
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Chat ────────────────────────────────────────────────────────────────────

    @GetMapping("/chat/conversations")
    public ResponseEntity<List<ConversationSummary>> getAllConversations() {
        return ResponseEntity.ok(chatService.getAllConversations());
    }

    @GetMapping("/chat/conversations/{userId1}/{userId2}")
    public ResponseEntity<List<ChatMessageResponse>> getConversationMessages(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        return ResponseEntity.ok(chatService.getConversationMessages(userId1, userId2));
    }

    @GetMapping("/chat/messages")
    public ResponseEntity<List<ChatMessageResponse>> getAllMessages() {
        return ResponseEntity.ok(chatService.getAllMessages());
    }
}
