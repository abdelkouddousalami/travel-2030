package com.example.backend.service;

import com.example.backend.dto.auth.*;
import com.example.backend.exception.BadRequestException;
import com.example.backend.model.OtpCode;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private OtpService otpService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .role(User.Role.USER)
                .isActive(true)
                .emailVerified(true)
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("newuser");
        registerRequest.setEmail("new@example.com");
        registerRequest.setPassword("Password123!");
        registerRequest.setFirstName("New");
        registerRequest.setLastName("User");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("Password123!");
    }

    @Test
    @DisplayName("Register - Success")
    void register_ShouldReturnSuccess_WhenValidRequest() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(otpService).generateAndSendOtp(anyString(), anyString(), any(OtpCode.OtpType.class));

        MessageResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(userRepository).save(any(User.class));
        verify(otpService).generateAndSendOtp(anyString(), anyString(), eq(OtpCode.OtpType.EMAIL_VERIFICATION));
    }

    @Test
    @DisplayName("Register - Username Already Taken")
    void register_ShouldThrowException_WhenUsernameExists() {
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Register - Email Already In Use")
    void register_ShouldThrowException_WhenEmailExists() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Login - Success")
    void login_ShouldReturnAuthResponse_WhenValidCredentials() {
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(userDetails)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(userDetails)).thenReturn("refresh-token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("access-token", response.getToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals("testuser", response.getUsername());
    }

    @Test
    @DisplayName("Login - Account Deactivated")
    void login_ShouldThrowException_WhenAccountDeactivated() {
        testUser.setIsActive(false);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        assertThrows(BadRequestException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("Login - Email Not Verified")
    void login_ShouldThrowException_WhenEmailNotVerified() {
        testUser.setEmailVerified(false);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        assertThrows(BadRequestException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("Verify OTP - Success")
    void verifyOtp_ShouldReturnAuthResponse_WhenValidOtp() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("test@example.com");
        request.setCode("123456");

        testUser.setEmailVerified(false);
        UserDetails userDetails = mock(UserDetails.class);

        when(otpService.verifyOtp(anyString(), anyString(), any(OtpCode.OtpType.class))).thenReturn(true);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(userDetails)).thenReturn("refresh-token");

        AuthResponse response = authService.verifyOtpAndActivate(request);

        assertNotNull(response);
        assertEquals("access-token", response.getToken());
        assertTrue(testUser.getEmailVerified());
    }

    @Test
    @DisplayName("Resend OTP - Success")
    void resendOtp_ShouldReturnSuccess_WhenValidEmail() {
        ResendOtpRequest request = new ResendOtpRequest();
        request.setEmail("test@example.com");

        testUser.setEmailVerified(false);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        doNothing().when(otpService).generateAndSendOtp(anyString(), anyString(), any(OtpCode.OtpType.class));

        MessageResponse response = authService.resendOtp(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
    }

    @Test
    @DisplayName("Resend OTP - Email Already Verified")
    void resendOtp_ShouldThrowException_WhenEmailAlreadyVerified() {
        ResendOtpRequest request = new ResendOtpRequest();
        request.setEmail("test@example.com");

        testUser.setEmailVerified(true);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(BadRequestException.class, () -> authService.resendOtp(request));
    }

    @Test
    @DisplayName("Refresh Token - Success")
    void refreshToken_ShouldReturnNewTokens_WhenValidRefreshToken() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("valid-refresh-token");

        UserDetails userDetails = mock(UserDetails.class);

        when(jwtService.validateToken("valid-refresh-token")).thenReturn(true);
        when(jwtService.extractUsername("valid-refresh-token")).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtService.isTokenValid("valid-refresh-token", userDetails)).thenReturn(true);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(userDetails)).thenReturn("new-access-token");

        AuthResponse response = authService.refreshToken(request);

        assertNotNull(response);
        assertEquals("new-access-token", response.getToken());
    }

    @Test
    @DisplayName("Refresh Token - Invalid Token")
    void refreshToken_ShouldThrowException_WhenInvalidToken() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("invalid-refresh-token");

        when(jwtService.validateToken("invalid-refresh-token")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.refreshToken(request));
    }
}
