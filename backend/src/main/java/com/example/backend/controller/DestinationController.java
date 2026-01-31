package com.example.backend.controller;

import com.example.backend.dto.DestinationRequest;
import com.example.backend.dto.DestinationResponse;
import com.example.backend.model.Destination;
import com.example.backend.service.DestinationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    @Autowired
    private DestinationService destinationService;

    @GetMapping
    public ResponseEntity<Page<DestinationResponse>> getAllDestinations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort) {
        
        Sort.Direction direction = sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        
        Page<DestinationResponse> destinations = destinationService.getAllDestinations(pageable);
        return ResponseEntity.ok(destinations);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<DestinationResponse>> searchDestinations(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<DestinationResponse> destinations = destinationService.searchDestinations(keyword, pageable);
        return ResponseEntity.ok(destinations);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<DestinationResponse>> getDestinationsByCategory(
            @PathVariable Destination.Category category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<DestinationResponse> destinations = destinationService.getDestinationsByCategory(category, pageable);
        return ResponseEntity.ok(destinations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DestinationResponse> getDestinationById(@PathVariable Long id) {
        DestinationResponse destination = destinationService.getDestinationById(id);
        return ResponseEntity.ok(destination);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinationResponse> createDestination(@Valid @RequestBody DestinationRequest request) {
        DestinationResponse destination = destinationService.createDestination(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(destination);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinationResponse> updateDestination(
            @PathVariable Long id,
            @Valid @RequestBody DestinationRequest request) {
        DestinationResponse destination = destinationService.updateDestination(id, request);
        return ResponseEntity.ok(destination);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDestination(@PathVariable Long id) {
        destinationService.deleteDestination(id);
        return ResponseEntity.noContent().build();
    }
}
