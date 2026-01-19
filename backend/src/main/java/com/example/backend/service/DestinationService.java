package com.example.backend.service;

import com.example.backend.dto.DestinationRequest;
import com.example.backend.dto.DestinationResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Destination;
import com.example.backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public Page<DestinationResponse> getAllDestinations(Pageable pageable) {
        return destinationRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<DestinationResponse> getDestinationsByCategory(Destination.Category category, Pageable pageable) {
        return destinationRepository.findByCategory(category, pageable).map(this::mapToResponse);
    }

    public Page<DestinationResponse> searchDestinations(String keyword, Pageable pageable) {
        return destinationRepository.searchDestinations(keyword, pageable).map(this::mapToResponse);
    }

    public DestinationResponse getDestinationById(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));
        return mapToResponse(destination);
    }

    @Transactional
    public DestinationResponse createDestination(DestinationRequest request) {
        Destination destination = new Destination();
        mapRequestToEntity(request, destination);
        Destination saved = destinationRepository.save(destination);
        return mapToResponse(saved);
    }

    @Transactional
    public DestinationResponse updateDestination(Long id, DestinationRequest request) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));
        
        mapRequestToEntity(request, destination);
        Destination updated = destinationRepository.save(destination);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteDestination(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));
        destinationRepository.delete(destination);
    }

    private void mapRequestToEntity(DestinationRequest request, Destination destination) {
        destination.setName(request.getName());
        destination.setDescription(request.getDescription());
        destination.setCountry(request.getCountry());
        destination.setCity(request.getCity());
        destination.setLatitude(request.getLatitude());
        destination.setLongitude(request.getLongitude());
        destination.setPricePerNight(request.getPricePerNight());
        destination.setImageUrl(request.getImageUrl());
        destination.setCategory(request.getCategory());
    }

    private DestinationResponse mapToResponse(Destination destination) {
        DestinationResponse response = new DestinationResponse();
        response.setId(destination.getId());
        response.setName(destination.getName());
        response.setDescription(destination.getDescription());
        response.setCountry(destination.getCountry());
        response.setCity(destination.getCity());
        response.setLatitude(destination.getLatitude());
        response.setLongitude(destination.getLongitude());
        response.setPricePerNight(destination.getPricePerNight());
        response.setImageUrl(destination.getImageUrl());
        response.setCategory(destination.getCategory());
        response.setCreatedAt(destination.getCreatedAt());
        return response;
    }
}
