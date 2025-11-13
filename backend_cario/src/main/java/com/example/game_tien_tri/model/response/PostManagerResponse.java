package com.example.game_tien_tri.model.response;

import com.example.game_tien_tri.model.dto.GroupOfPostDTO;
import com.example.game_tien_tri.model.dto.UserOfPost;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostManagerResponse {
    private Integer id;
    private String title;
    private String content;
    private UserOfPost userOfPost;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String type;
    private GroupOfPostDTO groupOfPost;
}