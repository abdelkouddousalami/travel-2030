package com.example.backend.repository;

import com.example.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m " +
           "WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) " +
           "   OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) " +
           "ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversation(@Param("userId1") Long userId1,
                                       @Param("userId2") Long userId2);

    @Query("SELECT m FROM ChatMessage m " +
           "WHERE m.sender.id = :userId OR m.receiver.id = :userId " +
           "ORDER BY m.createdAt DESC")
    List<ChatMessage> findByParticipant(@Param("userId") Long userId);

    List<ChatMessage> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true " +
           "WHERE m.receiver.id = :receiverId AND m.sender.id = :senderId AND m.isRead = false")
    void markConversationAsRead(@Param("receiverId") Long receiverId,
                                @Param("senderId") Long senderId);

    Long countByReceiverIdAndIsReadFalse(Long receiverId);
}
