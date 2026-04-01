package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/health")
public class HealthController {


    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Travel2030 Backend API");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Service is running successfully");
        
        return ResponseEntity.ok(response);
    }


    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, String> app = new HashMap<>();
        app.put("name", "Travel2030 Backend");
        app.put("version", "1.0.0");
        app.put("description", "Full-stack travel management platform");
        app.put("springBootVersion", "3.2.0");
        app.put("javaVersion", System.getProperty("java.version"));
        
        Map<String, Object> system = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();
        system.put("processors", runtime.availableProcessors());
        system.put("freeMemory", formatBytes(runtime.freeMemory()));
        system.put("totalMemory", formatBytes(runtime.totalMemory()));
        system.put("maxMemory", formatBytes(runtime.maxMemory()));
        
        response.put("application", app);
        response.put("system", system);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }


    @GetMapping("/liveness")
    public ResponseEntity<Map<String, String>> liveness() {
        return ResponseEntity.ok(Map.of("status", "alive"));
    }


    @GetMapping("/readiness")
    public ResponseEntity<Map<String, String>> readiness() {
        return ResponseEntity.ok(Map.of("status", "ready"));
    }


    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.2f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
