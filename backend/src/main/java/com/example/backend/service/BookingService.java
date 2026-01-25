package com.example.backend.service;

import com.example.backend.dto.BookingRequest;
import com.example.backend.dto.BookingResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Booking;
import com.example.backend.model.Destination;
import com.example.backend.model.User;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.DestinationRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;

    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<BookingResponse> getUserBookings(Pageable pageable) {
        User currentUser = getCurrentUser();
        return bookingRepository.findByUser(currentUser, pageable).map(this::mapToResponse);
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        checkAuthorization(booking);
        
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User currentUser = getCurrentUser();
        Destination destination = destinationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + request.getDestinationId()));

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date must be before end date");
        }

        if (request.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new BadRequestException("Start date cannot be in the past");
        }

        // Calculate total price
        long nights = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (nights <= 0) {
            throw new BadRequestException("Booking must be at least 1 night");
        }
        BigDecimal totalPrice = destination.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        // Create booking
        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setDestination(destination);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setStatus(Booking.Status.PENDING);
        booking.setTotalPrice(totalPrice);

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, Booking.Status status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        checkAuthorization(booking);
        
        booking.setStatus(status);
        Booking updated = bookingRepository.save(booking);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        checkAuthorization(booking);
        
        bookingRepository.delete(booking);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void checkAuthorization(Booking booking) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        
        if (!isAdmin && !booking.getUser().getUsername().equals(authentication.getName())) {
            throw new BadRequestException("You don't have permission to access this booking");
        }
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUser().getId());
        response.setUsername(booking.getUser().getUsername());
        response.setDestinationId(booking.getDestination().getId());
        response.setDestinationName(booking.getDestination().getName());
        response.setStartDate(booking.getStartDate());
        response.setEndDate(booking.getEndDate());
        response.setStatus(booking.getStatus());
        response.setTotalPrice(booking.getTotalPrice());
        response.setCreatedAt(booking.getCreatedAt());
        return response;
    }
}
