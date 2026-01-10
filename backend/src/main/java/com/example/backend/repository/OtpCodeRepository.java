package com.example.backend.repository;

import com.example.backend.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    Optional<OtpCode> findTopByEmailAndTypeAndIsUsedFalseOrderByCreatedAtDesc(
            String email, OtpCode.OtpType type);

    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE OtpCode o SET o.isUsed = true WHERE o.email = :email AND o.type = :type AND o.isUsed = false")
    void invalidateAllByEmailAndType(@Param("email") String email, @Param("type") OtpCode.OtpType type);

    long countByEmailAndTypeAndCreatedAtAfter(String email, OtpCode.OtpType type, LocalDateTime after);
}
