package com.example.backend.controller;

import com.example.backend.dto.auth.*;
import com.example.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private AuthResponse authResponse;
    private MessageResponse messageResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("Password123@");
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("Password123!");

        authResponse = AuthResponse.builder()
                .token("test-jwt-token")
                .refreshToken("test-refresh-token")
                .type("Bearer")
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role("USER")
                .firstName("Test")
                .lastName("User")
                .build();

        messageResponse = MessageResponse.builder()
                .message("Registration successful")
                .success(true)
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/register - Success")
    void register_ShouldReturnCreated_WhenValidRequest() throws Exception {
        when(authService.register(any(RegisterRequest.class))).thenReturn(messageResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Registration successful"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Success")
    void login_ShouldReturnOk_WhenValidCredentials() throws Exception {
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-jwt-token"))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /api/auth/verify-otp - Success")
    void verifyOtp_ShouldReturnOk_WhenValidOtp() throws Exception {
        VerifyOtpRequest verifyRequest = new VerifyOtpRequest();
        verifyRequest.setEmail("test@example.com");
        verifyRequest.setCode("123456");

        when(authService.verifyOtpAndActivate(any(VerifyOtpRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @DisplayName("POST /api/auth/resend-otp - Success")
    void resendOtp_ShouldReturnOk_WhenValidEmail() throws Exception {
        ResendOtpRequest resendRequest = new ResendOtpRequest();
        resendRequest.setEmail("test@example.com");

        MessageResponse response = MessageResponse.builder()
                .message("OTP resent successfully")
                .success(true)
                .build();

        when(authService.resendOtp(any(ResendOtpRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/resend-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resendRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/auth/refresh - Success")
    void refreshToken_ShouldReturnOk_WhenValidRefreshToken() throws Exception {
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken("valid-refresh-token");

        when(authService.refreshToken(any(RefreshTokenRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }
}
