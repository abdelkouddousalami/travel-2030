package com.example.backend.service;

import com.example.backend.dto.chat.ChatMessageRequest;
import com.example.backend.dto.chat.ChatMessageResponse;
import com.example.backend.dto.chat.ConversationSummary;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.ChatMessage;
import com.example.backend.model.User;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    // ─── User operations ────────────────────────────────────────────────────────

    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        User sender = getCurrentUser();
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new BadRequestException("Cannot send a message to yourself");
        }

        ChatMessage message = ChatMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .build();

        message = chatMessageRepository.save(message);
        log.info("Message sent: {} -> {}", sender.getUsername(), receiver.getUsername());
        return mapToResponse(message);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getConversation(Long otherUserId) {
        User currentUser = getCurrentUser();
        return chatMessageRepository.findConversation(currentUser.getId(), otherUserId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationSummary> getMyConversations() {
        User currentUser = getCurrentUser();
        List<ChatMessage> messages = chatMessageRepository.findByParticipant(currentUser.getId());
        return buildConversationSummaries(messages);
    }

    @Transactional
    public void markAsRead(Long senderId) {
        User currentUser = getCurrentUser();
        chatMessageRepository.markConversationAsRead(currentUser.getId(), senderId);
    }

    // ─── Admin operations ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getAllMessages() {
        return chatMessageRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationSummary> getAllConversations() {
        List<ChatMessage> allMessages = chatMessageRepository.findAllByOrderByCreatedAtDesc();
        return buildConversationSummaries(allMessages);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getConversationMessages(Long userId1, Long userId2) {
        return chatMessageRepository.findConversation(userId1, userId2)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Private helpers ─────────────────────────────────────────────────────────

    private List<ConversationSummary> buildConversationSummaries(List<ChatMessage> messages) {
        // Group by canonical conversation key: "minId-maxId"
        Map<String, List<ChatMessage>> grouped = new LinkedHashMap<>();
        for (ChatMessage msg : messages) {
            String key = conversationKey(msg);
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(msg);
        }

        return grouped.entrySet().stream()
                .map(e -> buildSummary(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private String conversationKey(ChatMessage m) {
        long a = m.getSender().getId();
        long b = m.getReceiver().getId();
        return Math.min(a, b) + "-" + Math.max(a, b);
    }

    private ConversationSummary buildSummary(String key, List<ChatMessage> conv) {
        String[] parts = key.split("-");
        Long id1 = Long.parseLong(parts[0]);
        Long id2 = Long.parseLong(parts[1]);

        // Resolve User objects from the messages
        User user1 = null, user2 = null;
        for (ChatMessage msg : conv) {
            if (user1 == null && msg.getSender().getId().equals(id1))   user1 = msg.getSender();
            if (user1 == null && msg.getReceiver().getId().equals(id1)) user1 = msg.getReceiver();
            if (user2 == null && msg.getSender().getId().equals(id2))   user2 = msg.getSender();
            if (user2 == null && msg.getReceiver().getId().equals(id2)) user2 = msg.getReceiver();
            if (user1 != null && user2 != null) break;
        }

        // Messages are stored DESC by createdAt, so index 0 is the most recent
        ChatMessage last = conv.get(0);

        return ConversationSummary.builder()
                .conversationKey(key)
                .participant1(mapToUserInfo(user1))
                .participant2(mapToUserInfo(user2))
                .lastMessage(truncate(last.getContent(), 80))
                .lastActivity(last.getCreatedAt())
                .messageCount((long) conv.size())
                .build();
    }

    private ConversationSummary.UserInfo mapToUserInfo(User user) {
        if (user == null) return null;
        return ConversationSummary.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    private ChatMessageResponse mapToResponse(ChatMessage msg) {
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .sender(ChatMessageResponse.UserInfo.builder()
                        .id(msg.getSender().getId())
                        .username(msg.getSender().getUsername())
                        .firstName(msg.getSender().getFirstName())
                        .lastName(msg.getSender().getLastName())
                        .build())
                .receiver(ChatMessageResponse.UserInfo.builder()
                        .id(msg.getReceiver().getId())
                        .username(msg.getReceiver().getUsername())
                        .firstName(msg.getReceiver().getFirstName())
                        .lastName(msg.getReceiver().getLastName())
                        .build())
                .content(msg.getContent())
                .isRead(msg.getIsRead())
                .createdAt(msg.getCreatedAt())
                .build();
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() > maxLen ? text.substring(0, maxLen) + "…" : text;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
