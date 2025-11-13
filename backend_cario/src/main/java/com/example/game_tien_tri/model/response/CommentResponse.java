package com.example.game_tien_tri.model.response;

import com.example.game_tien_tri.model.dto.UserOfComment;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Integer id;
    private String content;
    private LocalDateTime createdAt;
    private UserOfComment user;
    private boolean isLike;
    private Integer countLike;
    private List<CommentResponse> commentsChildren;
}