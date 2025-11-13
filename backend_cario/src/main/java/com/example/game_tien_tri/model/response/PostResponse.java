package com.example.game_tien_tri.model.response;

import com.example.game_tien_tri.model.dto.UserOfPost;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class PostResponse {
    private Integer id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserOfPost userOfPost;
    private Integer countLike;
    private Integer countComment;
    private boolean userIsLike;
}