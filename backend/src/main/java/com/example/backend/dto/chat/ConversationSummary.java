package com.example.backend.dto.chat;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationSummary {

    private String conversationKey;
    private UserInfo participant1;
    private UserInfo participant2;
    private String lastMessage;
    private LocalDateTime lastActivity;
    private Long messageCount;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private String firstName;
        private String lastName;
    }
}
