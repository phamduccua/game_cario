package com.example.game_tien_tri.entity;


import com.example.game_tien_tri.entity.PostEntity;
import com.example.game_tien_tri.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name="comments")
public class CommentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="comment_id")
    private Integer id;

    @Column(name="content")
    private String content;

    @Column(name="created_at", updatable=false)
    @CreationTimestamp
    private LocalDateTime created_at;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="post_id")
    private PostEntity post;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="user_id")
    private UserEntity user;

    @OneToMany(mappedBy = "parent", orphanRemoval = true)
    private List<CommentEntity> children;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="parent_id")
    private CommentEntity parent;
}
