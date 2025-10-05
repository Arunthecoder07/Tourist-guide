package com.touristguide.controller;

import com.touristguide.service.TouristApiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tourist")
@CrossOrigin(origins = {"http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5500", "*"})
public class TouristController {

    private final TouristApiService touristApiService;

    public TouristController(TouristApiService touristApiService) {
        this.touristApiService = touristApiService;
    }

    @GetMapping("/{city}")
    public ResponseEntity<String> getTouristPlaces(@PathVariable String city) {
        if (!StringUtils.hasText(city)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("city path variable must be provided");
        }

        String response = touristApiService.searchTouristPlaces(city);
        if (response == null || response.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No tourist attractions found in " + city);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hotels/{city}")
    public ResponseEntity<Map<String, Object>> getHotels(@PathVariable String city) {
        if (!StringUtils.hasText(city)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "city path variable must be provided"));
        }

        try {
            Map<String, Object> hotels = touristApiService.getHotels(city);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch hotels: " + e.getMessage()));
        }
    }

    @GetMapping("/attractions/{city}")
    public ResponseEntity<Map<String, Object>> getAttractions(@PathVariable String city) {
        if (!StringUtils.hasText(city)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "city path variable must be provided"));
        }

        try {
            Map<String, Object> attractions = touristApiService.getAttractions(city);
            return ResponseEntity.ok(attractions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch attractions: " + e.getMessage()));
        }
    }

    @GetMapping("/monuments/{city}")
    public ResponseEntity<Map<String, Object>> getMonuments(@PathVariable String city) {
        if (!StringUtils.hasText(city)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "city path variable must be provided"));
        }

        try {
            Map<String, Object> monuments = touristApiService.getMonuments(city);
            return ResponseEntity.ok(monuments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch monuments: " + e.getMessage()));
        }
    }
}
