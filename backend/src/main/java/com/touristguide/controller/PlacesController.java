package com.touristguide.controller;

import com.touristguide.service.PlacesService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/places")
@CrossOrigin
public class PlacesController {
    private final PlacesService placesService;

    public PlacesController(PlacesService placesService) {
        this.placesService = placesService;
    }

    @GetMapping("/hotels/{city}")
    public ResponseEntity<String> hotels(@PathVariable String city) {
        if (!StringUtils.hasText(city)) return ResponseEntity.badRequest().body("city required");
        return ResponseEntity.ok(placesService.fetchHotels(city));
    }

    @GetMapping("/attractions/{city}")
    public ResponseEntity<String> attractions(@PathVariable String city) {
        if (!StringUtils.hasText(city)) return ResponseEntity.badRequest().body("city required");
        return ResponseEntity.ok(placesService.fetchAttractions(city));
    }

    @GetMapping("/monuments/{city}")
    public ResponseEntity<String> monuments(@PathVariable String city) {
        if (!StringUtils.hasText(city)) return ResponseEntity.badRequest().body("city required");
        return ResponseEntity.ok(placesService.fetchMonuments(city));
    }

    @GetMapping("/photo")
    public ResponseEntity<byte[]> photo(@RequestParam("ref") String photoReference,
                                        @RequestParam(value = "maxWidth", defaultValue = "800") int maxWidth) {
        byte[] image = placesService.fetchPhoto(photoReference, maxWidth);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .contentType(MediaType.IMAGE_JPEG)
                .body(image);
    }

    @GetMapping("/details/{placeId}")
    public ResponseEntity<String> details(@PathVariable String placeId) {
        if (!StringUtils.hasText(placeId)) return ResponseEntity.badRequest().body("placeId required");
        return ResponseEntity.ok(placesService.fetchDetails(placeId));
    }
}


