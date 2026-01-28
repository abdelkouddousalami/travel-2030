package com.example.backend.service;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.MessageResponse;
import com.example.backend.dto.auth.RefreshTokenRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.auth.ResendOtpRequest;
import com.example.backend.dto.auth.VerifyOtpRequest;
import com.example.backend.exception.BadRequestException;
import com.example.backend.model.OtpCode;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final OtpService otpService;

    /**
     * Register a new user — saves the account and sends OTP email.
     * Does NOT return JWT tokens until the email is verified.
     */
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.USER)
                .isActive(true)
                .emailVerified(false)
                .build();

        userRepository.save(user);
        log.info("User saved, sending OTP to: {}", user.getEmail());

        otpService.generateAndSendOtp(user.getEmail(), user.getFirstName(), OtpCode.OtpType.EMAIL_VERIFICATION);

        return MessageResponse.builder()
                .message("Inscription reussie. Un code de verification a ete envoye a votre email.")
                .success(true)
                .build();
    }

    /**
     * Verify the OTP code, activate the account, and return JWT tokens.
     */
    @Transactional
    public AuthResponse verifyOtpAndActivate(VerifyOtpRequest request) {
        log.info("Verifying OTP for email: {}", request.getEmail());

        otpService.verifyOtp(request.getEmail(), request.getCode(), OtpCode.OtpType.EMAIL_VERIFICATION);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Email verified for user: {}", user.getUsername());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    /**
     * Resend OTP code for unverified accounts.
     */
    @Transactional
    public MessageResponse resendOtp(ResendOtpRequest request) {
        log.info("Resending OTP to: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Aucun compte trouve avec cet email."));

        if (user.getEmailVerified()) {
            throw new BadRequestException("Cet email est deja verifie.");
        }

        otpService.generateAndSendOtp(user.getEmail(), user.getFirstName(), OtpCode.OtpType.EMAIL_VERIFICATION);

        return MessageResponse.builder()
                .message("Un nouveau code de verification a ete envoye.")
                .success(true)
                .build();
    }

    /**
     * Authenticate user and generate JWT token.
     * Blocks login if email is not verified.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!user.getIsActive()) {
            throw new BadRequestException("Account is deactivated");
        }

        if (!user.getEmailVerified()) {
            throw new BadRequestException("Email non verifie. Veuillez verifier votre email avant de vous connecter.");
        }

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        log.info("User logged in successfully: {}", user.getUsername());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    /**
     * Refresh access token.
     */
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtService.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new BadRequestException("Refresh token is not valid");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        String newAccessToken = jwtService.generateToken(userDetails);
        log.info("Token refreshed for user: {}", username);

        return buildAuthResponse(user, newAccessToken, refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
