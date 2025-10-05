package com.touristguide.model;

import jakarta.persistence.*;

@Entity
@Table(name = "favorites", indexes = {
        @Index(name = "idx_fav_user_type_target", columnList = "user_id,targetType,targetId", unique = true)
})
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @Column(nullable = false)
    private String targetType;

    @Column(nullable = false)
    private String targetId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
}
