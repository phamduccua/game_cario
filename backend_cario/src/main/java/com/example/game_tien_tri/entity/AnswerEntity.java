package com.example.game_tien_tri.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Table(name="answers")
@Entity
public class AnswerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="answer_id")
    private Integer id;

    @Column(name="content")
    private String content;

    @Column(name="created_at", updatable=false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="question_id")
    private QuestionEntity question;

    @OneToMany(mappedBy = "answer", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserAnswerEntity> userAnswers;
}
