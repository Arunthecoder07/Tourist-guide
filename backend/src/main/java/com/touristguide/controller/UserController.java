package com.touristguide.controller;

import com.touristguide.model.Favorite;
import com.touristguide.model.User;
import com.touristguide.repo.FavoriteRepository;
import com.touristguide.repo.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    public UserController(FavoriteRepository favoriteRepository, UserRepository userRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/users/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails principal){
        if (principal == null) return ResponseEntity.status(401).build();
        User u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        Map<String,Object> resp = new HashMap<>();
        resp.put("id", u.getId());
        resp.put("name", u.getName());
        resp.put("email", u.getEmail());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/users/{id}/favorites")
    public ResponseEntity<?> addFavorite(@PathVariable Long id,
                                         @RequestParam String type,
                                         @RequestParam String targetId,
                                         @AuthenticationPrincipal UserDetails principal){
        if (principal == null) return ResponseEntity.status(401).build();
        User u = userRepository.findById(id).orElseThrow();
        if (!u.getEmail().equals(principal.getUsername())) return ResponseEntity.status(403).build();
        Favorite fav = favoriteRepository.findByUserAndTargetTypeAndTargetId(u, type, targetId)
                .orElseGet(() -> { Favorite f = new Favorite(); f.setUser(u); f.setTargetType(type); f.setTargetId(targetId); return f; });
        favoriteRepository.save(fav);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/users/{id}/favorites")
    public ResponseEntity<List<Favorite>> listFavorites(@PathVariable Long id, @AuthenticationPrincipal UserDetails principal){
        if (principal == null) return ResponseEntity.status(401).build();
        User u = userRepository.findById(id).orElseThrow();
        if (!u.getEmail().equals(principal.getUsername())) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(favoriteRepository.findByUser(u));
    }
}







