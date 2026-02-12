package com.example.backend;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class BackendApplicationTests {

    @Test
    void main_ShouldNotThrowException() {
        // Test that the main class can be instantiated
        assertDoesNotThrow(() -> new BackendApplication());
    }
}
