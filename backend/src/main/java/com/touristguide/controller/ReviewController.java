package com.touristguide.controller;

import com.touristguide.model.Review;
import com.touristguide.model.User;
import com.touristguide.repo.ReviewRepository;
import com.touristguide.repo.UserRepository;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Validated
public class ReviewController {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{type}/{id}/reviews")
    public List<Review> list(@PathVariable String type, @PathVariable String id) {
        return reviewRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(type, id);
    }

    @GetMapping("/reviews/{location}")
    public ResponseEntity<Map<String, Object>> getLocationReviews(@PathVariable String location) {
        try {
            List<Review> reviews = reviewRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc("location", location);
            Map<String, Object> result = new HashMap<>();
            result.put("reviews", reviews);
            result.put("location", location);
            result.put("total", reviews.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch reviews: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    public record CreateReviewRequest(@Min(1) @Max(5) int rating, @NotBlank String text) {}
    
    public record CreateLocationReviewRequest(@Min(1) @Max(5) int rating, @NotBlank String review, @NotBlank String location) {}

    @PostMapping("/{type}/{id}/reviews")
    public ResponseEntity<?> create(@PathVariable String type, @PathVariable String id,
                                    @RequestBody CreateReviewRequest req,
                                    @AuthenticationPrincipal UserDetails principal){
        if (principal == null) return ResponseEntity.status(401).build();
        User author = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        Review r = new Review();
        r.setAuthor(author);
        r.setTargetType(type);
        r.setTargetId(id);
        r.setRating(req.rating());
        r.setText(req.text());
        reviewRepository.save(r);
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", r.getId());
        return ResponseEntity.status(201).body(resp);
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> createLocationReview(@RequestBody CreateLocationReviewRequest req) {
        try {
            // For demo purposes, create a mock user or use anonymous
            Review r = new Review();
            r.setTargetType("location");
            r.setTargetId(req.location());
            r.setRating(req.rating());
            r.setText(req.review());
            r.setUserName("Anonymous User"); // Default, may be overridden below
            reviewRepository.save(r);
            
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", r.getId());
            resp.put("message", "Review submitted successfully");
            return ResponseEntity.status(201).body(resp);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create review: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/reviews/user/{userName}")
    public ResponseEntity<?> getReviewsByUser(@PathVariable String userName) {
        try {
            List<Review> reviews = reviewRepository.findAll().stream()
                    .filter(r -> userName.equalsIgnoreCase(r.getUserName()) ||
                            (r.getAuthor() != null && userName.equalsIgnoreCase(r.getAuthor().getName())))
                    .toList();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch user reviews: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}



