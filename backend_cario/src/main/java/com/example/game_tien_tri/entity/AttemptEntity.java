package com.example.game_tien_tri.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name="attempts")
public class AttemptEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="attempt_id")
    private Integer id;

    @Column(name="time_at")
    private LocalDateTime timeAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="user_id")
    private UserEntity user;

    @OneToMany(mappedBy = "attempt", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserAnswerEntity> userAnswers;
}
