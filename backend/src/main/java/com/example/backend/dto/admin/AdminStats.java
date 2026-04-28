package com.example.backend.dto.admin;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminStats {
    private Long totalUsers;
    private Long totalTrips;
    private Long totalDestinations;
    private Long totalBookings;
    private Long totalMessages;
    private Long pendingBookings;
    private Long confirmedBookings;
    private Long cancelledBookings;
}
