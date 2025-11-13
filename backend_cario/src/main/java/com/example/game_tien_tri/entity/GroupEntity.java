package com.example.game_tien_tri.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name="user_group")
public class GroupEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="group_id")
    private Integer id;

    @Column(name="name")
    private String name;

    @Column(name="description")
    private String description;

    @Column(name="is_private")
    private Boolean isPrivate;

    @Column(name="created_at", updatable=false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "group", orphanRemoval = true)
    private List<PostEntity> posts;

    @OneToMany(mappedBy = "group", orphanRemoval = true)
    private List<GroupMemberEntity> groupMembers;

}