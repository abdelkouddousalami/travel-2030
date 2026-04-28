package com.example.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentSummary {
    private Long id;
    private String content;
    private Long tripId;
    private String tripTitle;
    private Long userId;
    private String username;
    private String userFullName;
    private LocalDateTime createdAt;
}
