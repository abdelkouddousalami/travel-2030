package com.example.backend.service;

import com.example.backend.exception.BadRequestException;
import com.example.backend.model.OtpCode;
import com.example.backend.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int MAX_RESEND_PER_HOUR = 5;

    @Transactional
    public void generateAndSendOtp(String email, String firstName, OtpCode.OtpType type) {
        // Rate limit: max 5 OTPs per email per hour
        long recentCount = otpCodeRepository.countByEmailAndTypeAndCreatedAtAfter(
                email, type, LocalDateTime.now().minusHours(1));
        if (recentCount >= MAX_RESEND_PER_HOUR) {
            throw new BadRequestException("Trop de demandes. Reessayez dans une heure.");
        }

        // Invalidate previous OTPs for this email
        otpCodeRepository.invalidateAllByEmailAndType(email, type);

        // Generate new OTP
        String code = generateOtpCode();

        OtpCode otpCode = OtpCode.builder()
                .code(code)
                .email(email)
                .type(type)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build();

        otpCodeRepository.save(otpCode);
        log.info("OTP generated for email: {} (type: {})", email, type);

        // Send email
        emailService.sendOtpEmail(email, code, firstName);
    }

    @Transactional
    public boolean verifyOtp(String email, String code, OtpCode.OtpType type) {
        OtpCode otpCode = otpCodeRepository
                .findTopByEmailAndTypeAndIsUsedFalseOrderByCreatedAtDesc(email, type)
                .orElseThrow(() -> new BadRequestException("Aucun code OTP trouve. Demandez un nouveau code."));

        // Increment attempts
        otpCode.setAttempts(otpCode.getAttempts() + 1);
        otpCodeRepository.save(otpCode);

        if (otpCode.isExpired()) {
            throw new BadRequestException("Le code OTP a expire. Demandez un nouveau code.");
        }

        if (otpCode.getAttempts() > 5) {
            otpCode.setIsUsed(true);
            otpCodeRepository.save(otpCode);
            throw new BadRequestException("Trop de tentatives. Demandez un nouveau code.");
        }

        if (!otpCode.getCode().equals(code)) {
            throw new BadRequestException("Code OTP incorrect. " + (5 - otpCode.getAttempts()) + " tentative(s) restante(s).");
        }

        // Mark as used
        otpCode.setIsUsed(true);
        otpCodeRepository.save(otpCode);

        log.info("OTP verified successfully for email: {}", email);
        return true;
    }

    private String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    @Transactional
    public void cleanupExpiredOtps() {
        otpCodeRepository.deleteExpiredOtps(LocalDateTime.now());
    }
}
