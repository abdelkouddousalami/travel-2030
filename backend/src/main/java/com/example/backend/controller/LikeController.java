package com.example.backend.controller;

import com.example.backend.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long tripId) {
        Map<String, Object> response = likeService.toggleLike(tripId);
        return ResponseEntity.ok(response);
    }
}
