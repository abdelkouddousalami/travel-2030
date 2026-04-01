package com.example.backend.dto;

import com.example.backend.model.Destination;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DestinationResponse {
    private Long id;
    private String name;
    private String description;
    private String country;
    private String city;
    private Double latitude;
    private Double longitude;
    private BigDecimal pricePerNight;
    private String imageUrl;
    private Destination.Category category;
    private LocalDateTime createdAt;
}
