package com.example.backend.dto;

import com.example.backend.model.Booking;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private Long id;
    private Long userId;
    private String username;
    private Long destinationId;
    private String destinationName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Booking.Status status;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
}
