package com.touristguide.repo;

import com.touristguide.model.Favorite;
import com.touristguide.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
    Optional<Favorite> findByUserAndTargetTypeAndTargetId(User user, String targetType, String targetId);
}
