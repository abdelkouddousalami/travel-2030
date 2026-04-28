package com.example.backend.controller;

import com.example.backend.dto.chat.ChatMessageRequest;
import com.example.backend.dto.chat.ChatMessageResponse;
import com.example.backend.dto.chat.ConversationSummary;
import com.example.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /** Send a message to another user */
    @PostMapping("/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.sendMessage(request));
    }

    /** List all conversations for the current user */
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummary>> getMyConversations() {
        return ResponseEntity.ok(chatService.getMyConversations());
    }

    /** Get the full message thread with a specific user */
    @GetMapping("/messages/{userId}")
    public ResponseEntity<List<ChatMessageResponse>> getConversation(
            @PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getConversation(userId));
    }

    /** Mark all messages from a user as read */
    @PatchMapping("/messages/{userId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long userId) {
        chatService.markAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
