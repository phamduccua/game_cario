package com.example.game_tien_tri.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name="user_answers")
public class UserAnswerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="user_answer_id")
    private Integer id;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="attempt_id")
    private AttemptEntity attempt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="question_id")
    private QuestionEntity question;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="answer_id")
    private AnswerEntity answer;
}
